#!/usr/bin/env node
/**
 * Reference guest player (scripts/guest-agent-player.mjs).
 * Decisioning stays here: own Jev, own LLM.
 * The arena server only lists legal moves and advances on timeout.
 * Read state.phase, leaderSeat, currentTurn, mustBeat.
 * System prompt: prompts/guandan-agent-system.md
 * tribute / return: POST the engine-ordered you.legal id. resist: wait, 头游 leads.
 *
 * ROOM_URL=http://localhost:3456/room/CODE
 * SEAT_TOKEN=...
 * TYPESAFE_API_KEY=...
 * LLM_API_KEY=...
 * LLM_BASE_URL=https://api.openai.com/v1
 * LLM_MODEL=gpt-4.1-mini
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { priorityPick } from "./priority-pick.mjs";

const SYSTEM = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../prompts/guandan-agent-system.md"), "utf8");
const JEV_MS = 800;
const LLM_MS = 6000;

function fail(message) {
  console.error(message);
  process.exit(1);
}

function originAndCode(roomUrl) {
  const url = new URL(roomUrl);
  const code = url.pathname.split("/").filter(Boolean).pop();
  if (!code) fail("ROOM_URL 里没有房间码");
  return { origin: url.origin, code: code.toUpperCase() };
}

async function selfCheck(origin) {
  if (!process.env.TYPESAFE_API_KEY) fail("缺 Jev，不能打");
  const llmKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
  if (!llmKey) fail("缺 LLM，不能打");
  try {
    const ping = await fetch(origin, { signal: AbortSignal.timeout(4000) });
    if (!ping.ok && ping.status !== 500) fail(`房间地址不可达 ${ping.status}`);
  } catch (error) {
    fail(`打不到房间：${error instanceof Error ? error.message : error}`);
  }
  return llmKey;
}

function legalOf(state) {
  return state.legalMoves || state.you?.legal || [];
}

async function jevHint(state) {
  const legal = legalOf(state);
  if (legal.length === 0) return null;
  const criteria = {};
  for (const move of legal.slice(0, 24)) criteria[move.id] = move.label;
  const base = (process.env.TYPESAFE_BASE_URL || "https://api.typesafe.ai").replace(/\/+$/, "");
  try {
    const response = await fetch(`${base}/v1/systemone`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.TYPESAFE_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.TYPESAFE_MODEL || "jev-latest",
        state: { game: "guandan", seat: state.you.seat, hand: state.you.hand },
        questions: {
          play: {
            type: "choice",
            instructions: "Pick one legal Guandan move id. Pass if the partner is winning the trick.",
            criteria,
          },
        },
      }),
      signal: AbortSignal.timeout(JEV_MS),
    });
    if (!response.ok) return null;
    const body = await response.json();
    const choice = body.answers?.play?.choice;
    return legal.some((move) => move.id === choice) ? choice : null;
  } catch {
    return null;
  }
}

async function llmPick(state, hint, llmKey) {
  const legal = legalOf(state);
  const base = (process.env.LLM_BASE_URL || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const model = process.env.LLM_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${llmKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 120,
      messages: [
        {
          role: "system",
          content: SYSTEM,
        },
        {
          role: "user",
          content: JSON.stringify({
            hintMoveId: hint,
            hand: state.you.hand,
            legal,
          }),
        },
      ],
    }),
    signal: AbortSignal.timeout(LLM_MS),
  });
  const body = await response.json();
  const text = body.choices?.[0]?.message?.content ?? "";
  const match = text.match(/"moveId"\s*:\s*"([^"]+)"/);
  const id = match?.[1];
  if (id && legal.some((move) => move.id === id)) return id;
  if (hint && legal.some((move) => move.id === hint)) return hint;
  return priorityPick(state)?.id || legal[0]?.id;
}

async function main() {
  const roomUrl = process.env.ROOM_URL;
  const token = process.env.SEAT_TOKEN;
  if (!roomUrl || !token) fail("需要 ROOM_URL 和 SEAT_TOKEN");
  const { origin, code } = originAndCode(roomUrl);
  const llmKey = await selfCheck(origin);
  const claim = await fetch(`${origin}/api/room/${code}/claim-seat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ seatToken: token, name: process.env.AGENT_NAME || "Guest Agent" }),
  });
  const claimed = await claim.json();
  if (!claim.ok) fail(claimed.error || "入座失败");
  console.log(`入座 ${claimed.you?.wind ?? ""} ${claimed.you?.name ?? ""}`);

  while (true) {
    const response = await fetch(`${origin}/api/room/${code}/state?seatToken=${encodeURIComponent(token)}`);
    const state = await response.json();
    if (!response.ok) fail(state.error || "state 失败");
    if (state.status === "finished") {
      console.log("对局结束");
      return;
    }
    if (!state.you?.yourTurn) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      continue;
    }
    if (state.phase === "resist") {
      await new Promise((resolve) => setTimeout(resolve, 400));
      continue;
    }
    if (state.phase === "tribute" || state.phase === "return") {
      const tributeId = priorityPick(state)?.id;
      if (!tributeId) continue;
      await fetch(`${origin}/api/room/${code}/act`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ seatToken: token, moveId: tributeId }),
      });
      continue;
    }
    const hint = await jevHint(state);
    const moveId = await llmPick(state, hint, llmKey);
    if (!moveId) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      continue;
    }
    const acted = await fetch(`${origin}/api/room/${code}/act`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ seatToken: token, moveId }),
    });
    const result = await acted.json();
    if (!acted.ok && acted.status !== 409) console.error(result.error || "act 失败");
  }
}

main().catch((error) => fail(error instanceof Error ? error.message : String(error)));
