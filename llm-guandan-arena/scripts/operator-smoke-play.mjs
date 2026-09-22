#!/usr/bin/env node
/**
 * Open 3 heuristic bots + one open seat, claim it as 知识, and play full hands.
 *
 * From the repo root:
 *   npm --prefix llm-guandan-arena run operator
 *
 * Env (all optional):
 *   PORT=3456
 *   HANDS=1                 complete this many hands (a round in match.rounds)
 *   SERIES=three            open | three | full   (three = stop the match after 3 hands)
 *   START_LEVEL=T
 *   OPERATOR_SEAT=2         0 north, 1 east, 2 south, 3 west
 *   ROOM_CODE=              play this room instead of creating one
 *   SEAT_TOKEN=             token from POST /api/rooms operator.seatToken
 *   GUANDAN_TURN_MS=8000    server timeout; bots use the heuristic immediately
 *   LLM_API_KEY=            optional. 知识 then asks an LLM with prompts/guandan-agent-system.md
 *   LLM_BASE_URL= LLM_MODEL=
 *
 * Three-hand series from the repo root:
 *   HANDS=3 SERIES=three npm --prefix llm-guandan-arena run operator
 */
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { priorityPick } from "./priority-pick.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SYSTEM = readFileSync(path.join(ROOT, "prompts/guandan-agent-system.md"), "utf8");

const PORT = Number(process.env.PORT || 3456);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const SERIES = process.env.SERIES === "open" || process.env.SERIES === "full" || process.env.SERIES === "three" ? process.env.SERIES : "three";
const HANDS = Math.max(1, Number(process.env.HANDS || 1));
const START_LEVEL = process.env.START_LEVEL || "T";
const OPERATOR_SEAT = Number(process.env.OPERATOR_SEAT || 2);
const LLM_KEY = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || "";

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

async function llmMove(state) {
  if (!LLM_KEY || state.phase === "tribute" || state.phase === "return" || state.phase === "resist") return null;
  const legal = state.you?.legal || [];
  const base = (process.env.LLM_BASE_URL || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const model = process.env.LLM_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini";
  try {
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { authorization: `Bearer ${LLM_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 80,
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: JSON.stringify({
              phase: state.phase,
              seat: state.you?.seat,
              mustBeat: state.mustBeat,
              hand: state.you?.hand,
              counts: (state.match?.seats || []).map((item) => item.cards),
              legal,
            }),
          },
        ],
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return null;
    const body = await response.json();
    const text = body.choices?.[0]?.message?.content ?? "";
    const id = text.match(/"moveId"\s*:\s*"([^"]+)"/)?.[1];
    return legal.find((move) => move.id === id) || null;
  } catch {
    return null;
  }
}

async function readState(code, token) {
  const response = await fetch(`${ORIGIN}/api/room/${code}/state?seatToken=${encodeURIComponent(token)}`);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "state failed");
  return body;
}

async function main() {
  await waitForServer();
  let code = process.env.ROOM_CODE || "";
  let token = process.env.SEAT_TOKEN || "";
  if (!code || !token) {
    const created = await fetch(`${ORIGIN}/api/rooms`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ operator: true, operatorSeat: OPERATOR_SEAT, series: SERIES, startLevel: START_LEVEL }),
    });
    const room = await created.json();
    if (!created.ok || !room.operator?.seatToken) {
      throw new Error(room.error || "operator room missing seatToken — restart the server so this build is loaded");
    }
    code = room.code;
    token = room.operator.seatToken;
    console.log(`opened room ${code} seat ${room.operator.seat} ${room.operator.wind} series ${SERIES} hands ${HANDS}`);
    console.log(`spectator http://localhost:${PORT}/room/${code}?role=spectator`);
    console.log(`claim     curl -s -X POST ${ORIGIN}/api/room/${code}/claim-seat -H 'content-type: application/json' -d '{"seatToken":"${token}","name":"知识"}'`);
    console.log(`state     curl -s '${ORIGIN}/api/room/${code}/state?seatToken=${token}'`);
    console.log(`act       curl -s -X POST ${ORIGIN}/api/room/${code}/act -H 'content-type: application/json' -d '{"seatToken":"${token}","moveId":"MOVE"}'`);
  } else {
    console.log(`joining room ${code} hands ${HANDS}`);
  }

  let seated = await readState(code, token).catch(() => null);
  if (!seated?.you) {
    const claim = await fetch(`${ORIGIN}/api/room/${code}/claim-seat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ seatToken: token, name: "知识" }),
    });
    seated = await claim.json();
    if (!claim.ok) throw new Error(seated.error || "claim failed");
  }
  if (seated.you?.name !== "知识" && !process.env.SEAT_TOKEN) throw new Error("claim did not seat 知识");
  if (seated.status !== "playing" && seated.match?.status !== "playing" && seated.status !== "finished") {
    throw new Error(`expected playing, got ${seated.status}`);
  }

  const played = [];
  const deadline = Date.now() + HANDS * 180_000;
  let announced = 0;
  while (Date.now() < deadline) {
    const state = await readState(code, token);
    const rounds = state.match?.rounds?.length ?? 0;
    const done = rounds >= HANDS || state.match?.status === "finished" || state.status === "finished";
    if (rounds > announced) {
      const last = state.match.rounds[rounds - 1];
      console.log(`hand ${rounds} ${last?.outcome || ""} +${last?.delta ?? ""}`);
      announced = rounds;
    }
    if (done && rounds >= 1) break;
    if (!state.you?.yourTurn) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      continue;
    }
    const move = (await llmMove(state)) || priorityPick(state);
    if (!move) throw new Error("your turn but legal list is empty");
    const acted = await fetch(`${ORIGIN}/api/room/${code}/act`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ seatToken: token, moveId: move.id }),
    });
    const body = await acted.json();
    if (!acted.ok) throw new Error(body.error || `act ${move.id} failed`);
    played.push(`${move.kind} ${move.label}`);
    console.log(`知识 ${played.length} ${move.kind} ${move.label}`);
  }

  const done = await readState(code, token);
  const rounds = done.match?.rounds?.length ?? 0;
  if (rounds < HANDS && done.match?.status !== "finished" && done.status !== "finished") {
    throw new Error(`finished ${rounds}/${HANDS} hands before the deadline`);
  }
  if (rounds < 1) throw new Error("no completed hand");
  if (!played.some((line) => !line.startsWith("pass") && !line.startsWith("tribute") && !line.startsWith("return"))) {
    throw new Error("operator only passed");
  }
  const bots = (done.match?.log || []).filter((event) => event.kind === "play" && event.seat !== done.you?.seat);
  const mine = (done.match?.log || []).filter((event) => (event.kind === "play" || event.kind === "pass") && event.seat === done.you?.seat);
  if (bots.length < 1) throw new Error("bots never played");
  if (mine.length < 1) throw new Error("operator plays missing from the log");
  console.log(`ok room ${code} hands ${rounds} operator plays ${mine.length} bot plays ${bots.length}`);
  console.log(`spectator http://localhost:${PORT}/room/${code}?role=spectator`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
