#!/usr/bin/env node
/**
 * Claim the open seat as 知识 and play N legal moves against 3 heuristic bots.
 * Usage: npm run operator
 * Env: PORT, TRICKS (default 6)
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const PORT = Number(process.env.PORT || 3456);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const TRICKS = Number(process.env.TRICKS || 6);
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
  if (await reachable()) return;
  startDev();
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (await reachable()) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`dev server did not answer ${ORIGIN}/api/rooms`);
}

function pick(state) {
  const legal = state.you?.legal || [];
  if (legal.length === 0) return null;
  const order = ["single", "pair", "triple", "fullhouse", "straight", "tube", "plate"];
  const pass = legal.find((move) => move.kind === "pass");
  for (const kind of order) {
    const hit = legal.find((move) => move.kind === kind);
    if (hit) return hit;
  }
  return pass || legal.find((move) => move.kind !== "pass") || legal[0];
}

async function main() {
  await waitForServer();
  const created = await fetch(`${ORIGIN}/api/rooms`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ operator: true, operatorSeat: 2, series: "open", startLevel: "T" }),
  });
  const room = await created.json();
  if (!created.ok || !room.operator?.seatToken) {
    throw new Error(room.error || "operator room missing seatToken — restart the server so this build is loaded");
  }
  const token = room.operator.seatToken;
  const code = room.code;
  const claim = await fetch(`${ORIGIN}/api/room/${code}/claim-seat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ seatToken: token, name: "知识" }),
  });
  const seated = await claim.json();
  if (!claim.ok || seated.you?.seat !== 2 || seated.you?.name !== "知识") {
    throw new Error(seated.error || "claim failed");
  }
  if (seated.status !== "playing") throw new Error(`expected playing, got ${seated.status}`);

  const played = [];
  const deadline = Date.now() + 60_000;
  while (played.length < TRICKS && Date.now() < deadline) {
    const state = await fetch(`${ORIGIN}/api/room/${code}/state?seatToken=${encodeURIComponent(token)}`).then((response) => response.json());
    if (state.status === "finished") break;
    if (!state.you?.yourTurn) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      continue;
    }
    const move = pick(state);
    if (!move) throw new Error("your turn but legal list is empty");
    const acted = await fetch(`${ORIGIN}/api/room/${code}/act`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ seatToken: token, moveId: move.id }),
    });
    const body = await acted.json();
    if (!acted.ok) throw new Error(body.error || `act ${move.id} failed`);
    played.push(`${move.kind} ${move.label}`);
    console.log(`知识 ${played.length}/${TRICKS} ${move.kind} ${move.label}`);
  }
  if (played.length < TRICKS) throw new Error(`only played ${played.length}/${TRICKS}`);
  if (!played.some((line) => !line.startsWith("pass"))) throw new Error("operator only passed");

  const done = await fetch(`${ORIGIN}/api/room/${code}/state?seatToken=${encodeURIComponent(token)}`).then((response) => response.json());
  const bots = (done.match?.log || []).filter((event) => event.kind === "play" && event.seat !== 2);
  if (bots.length < 1) throw new Error("bots never played");
  const mine = (done.match?.log || []).filter((event) => (event.kind === "play" || event.kind === "pass") && event.seat === 2);
  if (mine.length < TRICKS) throw new Error(`log shows ${mine.length} operator plays`);
  console.log(`ok room ${code} operator plays ${mine.length} bot plays ${bots.length}`);
  console.log(`spectator http://localhost:${PORT}/room/${code}?role=spectator`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
