#!/usr/bin/env node
/**
 * Local one-shot: ensure dev server, open 3 bots + 1 operator seat, print the claim/act loop.
 * Usage: npm run watch
 * The seat stays empty until something claims it. npm run operator plays it.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const PORT = Number(process.env.PORT || 3456);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function reachable() {
  try {
    const response = await fetch(`${ORIGIN}/api/rooms`, { signal: AbortSignal.timeout(1500) });
    return response.ok;
  } catch {
    return false;
  }
}

function startDev() {
  const child = spawn("npm", ["run", "dev", "--", "--port", String(PORT)], {
    cwd: ROOT,
    detached: true,
    stdio: "ignore",
  });
  child.unref();
  console.log(`dev server starting on :${PORT} (pid ${child.pid})`);
}

async function waitForServer() {
  if (await reachable()) {
    console.log(`dev server already up on :${PORT}`);
    return;
  }
  startDev();
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (await reachable()) {
      console.log(`dev server ready on :${PORT}`);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`dev server did not answer ${ORIGIN}/api/rooms`);
}

function openBrowser(url) {
  const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  const child = spawn(command, args, { detached: true, stdio: "ignore" });
  child.on("error", (error) => {
    console.error(`browser open failed (${command}): ${error.message}`);
    console.error(url);
  });
  child.unref();
  console.log(`opened ${url}`);
}

async function main() {
  await waitForServer();
  const created = await fetch(`${ORIGIN}/api/rooms`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ operator: true, operatorSeat: 2, series: "open", startLevel: "T" }),
  });
  const room = await created.json();
  if (!created.ok || !room.code || !room.operator?.seatToken) {
    throw new Error(room.error || "operator room failed");
  }

  const publicOrigin = `http://localhost:${PORT}`;
  const token = room.operator.seatToken;
  const spectatorUrl = `${publicOrigin}/room/${room.code}?role=spectator`;
  const hostUrl = `${publicOrigin}/room/${room.code}?host=${encodeURIComponent(room.hostSecret)}`;
  console.log(`spectator ${spectatorUrl}`);
  console.log(`host      ${hostUrl}`);
  console.log(`operator  seat ${room.operator.seat} ${room.operator.wind}  token ${token}`);
  console.log(`claim     curl -s -X POST ${ORIGIN}/api/room/${room.code}/claim-seat -H 'content-type: application/json' -d '{"seatToken":"${token}","name":"知识"}'`);
  console.log(`state     curl -s '${ORIGIN}/api/room/${room.code}/state?seatToken=${token}'`);
  console.log(`act       curl -s -X POST ${ORIGIN}/api/room/${room.code}/act -H 'content-type: application/json' -d '{"seatToken":"${token}","moveId":"MOVE"}'`);
  console.log("play it   npm run operator");
  openBrowser(spectatorUrl);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
