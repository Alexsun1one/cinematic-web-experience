#!/usr/bin/env node
/**
 * Optional screen capture of /replay/[code].
 * Records the replay page when both ffmpeg and Chrome are available.
 * If either is missing, exits 0. The timestamped event log on the page is the record.
 *
 * ROOM_CODE=ABCD12 PORT=3456 SECONDS=6 npm run replay:capture
 */
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const code = (process.env.ROOM_CODE || "").toUpperCase();
const port = process.env.PORT || "3456";
const seconds = Math.max(2, Math.min(20, Number(process.env.SECONDS || 6)));
const debugPort = Number(process.env.CDP_PORT || 9334);

if (!code) {
  console.error("ROOM_CODE is required");
  process.exit(1);
}

const ffmpeg = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" });
if (ffmpeg.status !== 0) {
  console.log(`ffmpeg is not installed. Use /replay/${code} for the timestamped event log.`);
  process.exit(0);
}
const chromeBin = spawnSync("which", ["google-chrome"], { encoding: "utf8" });
if (chromeBin.status !== 0) {
  console.log(`Chrome is not available. Use /replay/${code} for the timestamped event log.`);
  process.exit(0);
}

const url = `http://127.0.0.1:${port}/replay/${code}`;
const dir = "/tmp/guandan-replay";
mkdirSync(dir, { recursive: true });
const out = `${dir}/${code}.mp4`;

const chrome = spawn(
  "google-chrome",
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--hide-scrollbars",
    `--window-size=1280,720`,
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${dir}/chrome-${code}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function debuggerSocket() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      if (response.ok) {
        const body = await response.json();
        if (body.webSocketDebuggerUrl) return body.webSocketDebuggerUrl;
      }
    } catch {
      /* chrome still starting */
    }
    await sleep(200);
  }
  return null;
}

function cdp(ws) {
  let next = 0;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data));
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  });
  return (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++next;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`cdp timeout ${method}`));
      }, 8000);
      pending.set(id, (message) => {
        clearTimeout(timer);
        if (message.error) reject(new Error(message.error.message || method));
        else resolve(message.result || {});
      });
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      ws.send(JSON.stringify(payload));
    });
}

async function main() {
  const socketUrl = await debuggerSocket();
  if (!socketUrl) {
    console.log(`Chrome did not open a debugger port. Use /replay/${code} for the timestamped event log.`);
    return;
  }
  const ws = new WebSocket(socketUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve);
    ws.addEventListener("error", () => reject(new Error("debugger socket failed")));
  });
  const send = cdp(ws);
  const created = await send("Target.createTarget", { url });
  const attached = await send("Target.attachToTarget", { targetId: created.targetId, flatten: true });
  const sessionId = attached.sessionId;
  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await sleep(1200);
  await send(
    "Runtime.evaluate",
    { expression: "document.querySelector('[data-testid=replay-play]')?.click()", awaitPromise: false },
    sessionId,
  );
  const frames = Math.max(4, seconds * 2);
  for (let index = 0; index < frames; index += 1) {
    const shot = await send("Page.captureScreenshot", { format: "png" }, sessionId);
    writeFileSync(`${dir}/frame-${String(index).padStart(3, "0")}.png`, Buffer.from(shot.data, "base64"));
    await sleep(500);
  }
  ws.close();
  const encoded = spawnSync(
    "ffmpeg",
    ["-y", "-framerate", "2", "-i", `${dir}/frame-%03d.png`, "-c:v", "libx264", "-pix_fmt", "yuv420p", out],
    { encoding: "utf8" },
  );
  if (encoded.status !== 0) {
    console.log(`ffmpeg could not encode the frames. Use /replay/${code} for the timestamped event log.`);
    return;
  }
  console.log(`wrote ${out} from ${frames} frames of ${url}`);
}

main()
  .catch((error) => {
    console.log(`${error instanceof Error ? error.message : "capture failed"}. Use /replay/${code} for the timestamped event log.`);
  })
  .finally(() => {
    chrome.kill("SIGTERM");
    setTimeout(() => process.exit(0), 200);
  });
