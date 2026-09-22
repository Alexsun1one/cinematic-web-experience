#!/usr/bin/env node
/**
 * Four-seat marathon. This process claims every seat.
 * Jev runs here when TYPESAFE_API_KEY is already in the environment.
 * The key is never sent to the Guandan server and never printed.
 *
 * HANDS=50            stop after this many settled hands (default 50)
 * DURATION_MIN=120    optional time cap, whichever comes first
 * START_LEVEL=A       so 打A counters are in the settle line
 * JEV_MS=3500         per-call budget; the seat still acts inside the turn
 * PORT=3456
 * Passing A ends that room. The harness opens another until the cap.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { priorityPick } from "./priority-pick.mjs";

const PORT = Number(process.env.PORT || 3456);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const HANDS = Number(process.env.HANDS || (process.env.DURATION_MIN ? 10000 : 50));
const DURATION_MS = process.env.DURATION_MIN ? Number(process.env.DURATION_MIN) * 60 * 1000 : 0;
const START_LEVEL = process.env.START_LEVEL || "A";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const NOTES = join(ROOT, "MARATHON.md");

function redact(text) {
  return String(text)
    .replace(/bearer\s+\S+/gi, "[redacted]")
    .replace(/sk-[a-z0-9_\-]{8,}/gi, "[redacted]")
    .replace(/typesafe_api_key\s*[=:]\s*\S+/gi, "TYPESAFE_API_KEY=[redacted]");
}

function log(line) {
  console.log(redact(line));
}

function fail(message) {
  throw new Error(redact(message));
}

function asNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function usageOf(body) {
  if (!body || typeof body !== "object") return { tokens: null, costUsd: null };
  const usage = body.usage && typeof body.usage === "object" ? body.usage : {};
  const tokens = asNumber(usage.total_tokens) ?? asNumber(usage.totalTokens);
  const costUsd = asNumber(usage.cost_usd) ?? asNumber(usage.cost) ?? asNumber(usage.estimated_cost) ?? asNumber(body.cost);
  return { tokens, costUsd };
}

async function api(path, options = {}) {
  const response = await fetch(`${ORIGIN}${path}`, options);
  const text = await response.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { error: "non-json" };
  }
  return { response, body };
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const ping = await fetch(`${ORIGIN}/api/rooms`);
      if (ping.ok) return;
    } catch {
      /* starting */
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  fail(`server not up at ${ORIGIN}`);
}

async function jevHint(state) {
  if (!process.env.TYPESAFE_API_KEY) return { choice: null, ms: 0, tokens: null, costUsd: null, skipped: true };
  const legal = state.you?.legal || [];
  const criteria = {};
  for (const move of legal.slice(0, 24)) criteria[move.id] = move.label;
  const base = (process.env.TYPESAFE_BASE_URL || "https://api.typesafe.ai").replace(/\/+$/, "");
  const started = Date.now();
  try {
    const response = await fetch(`${base}/v1/systemone`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.TYPESAFE_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.TYPESAFE_MODEL || "jev-latest",
        state: { game: "guandan", seat: state.you.seat },
        questions: {
          play: { type: "choice", instructions: "Pick one legal move id.", criteria },
        },
      }),
      signal: AbortSignal.timeout(Math.min(6000, Number(process.env.JEV_MS || 3500))),
    });
    const raw = await response.json().catch(() => ({}));
    const usage = usageOf(raw);
    const choice = raw.answers?.play?.choice;
    return {
      choice: legal.some((move) => move.id === choice) ? choice : null,
      ms: Date.now() - started,
      tokens: usage.tokens,
      costUsd: usage.costUsd,
      skipped: false,
      ok: response.ok,
    };
  } catch {
    return { choice: null, ms: Date.now() - started, tokens: null, costUsd: null, skipped: false, ok: false };
  }
}

async function postStatus(code, token, payload) {
  await api(`/api/room/${code}/telemetry`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ seatToken: token, ...payload }),
  });
}

async function postMetric(code, token, payload) {
  await api(`/api/room/${code}/telemetry`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ seatToken: token, ...payload }),
  });
}

function writeNotes(section) {
  const markerStart = "<!-- last-run -->";
  const markerEnd = "<!-- /last-run -->";
  let prior = "";
  try {
    prior = readFileSync(NOTES, "utf8");
  } catch {
    prior = `# Marathon\n\n${markerStart}\n${markerEnd}\n`;
  }
  const block = `${markerStart}\n${section.trim()}\n${markerEnd}`;
  const next = prior.includes(markerStart)
    ? prior.replace(new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`), block)
    : `${prior.trim()}\n\n${block}\n`;
  writeFileSync(NOTES, next.endsWith("\n") ? next : `${next}\n`);
}

async function openTable(failures) {
  const created = await api("/api/rooms", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ series: "open", startLevel: START_LEVEL, autoFillMock: false, seatsOpen: true }),
  });
  if (!created.response.ok || !created.body.code || !created.body.hostSecret) fail(created.body.error || "create failed");
  const code = created.body.code;
  const host = created.body.hostSecret;
  const invites = [];
  for (const seat of [0, 1, 2, 3]) {
    const issued = await api(`/api/rooms/${code}/invite?seat=${seat}`, { headers: { "x-room-host": host } });
    if (!issued.response.ok || !issued.body.token || !issued.body.block) fail(issued.body.error || `invite ${seat}`);
    if (!issued.body.block.includes("你自己的 Jev")) failures.push("invite missing bring-your-own Jev line");
    invites.push(issued.body);
  }
  log(`room ${code} copy-invite seats ${invites.map((item) => item.seat).join(",")}`);
  const winds = ["北", "东", "南", "西"];
  const seats = [];
  for (const invite of invites) {
    const claim = await api(`/api/room/${code}/claim-seat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ seatToken: invite.token, name: `马拉松${winds[invite.seat] ?? invite.seat}` }),
    });
    if (!claim.response.ok) fail(claim.body.error || "claim failed");
    seats.push({ seat: invite.seat, token: invite.token });
  }
  log(`joined seats ${seats.map((item) => item.seat).join(",")}`);
  const room = await api(`/api/rooms/${code}`);
  if (room.body.status === "lobby") {
    const started = await api(`/api/rooms/${code}/start`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-room-host": host },
      body: JSON.stringify({ hostSecret: host }),
    });
    if (!started.response.ok && started.body.error !== "已经开打") fail(started.body.error || "start failed");
  } else if (room.body.status !== "playing" && room.body.status !== "finished") {
    fail(room.body.error || "room did not start");
  }
  return { code, seats };
}

async function main() {
  const failures = [];
  const startedAt = Date.now();
  const jevOn = Boolean(process.env.TYPESAFE_API_KEY);
  if (!jevOn) failures.push("TYPESAFE_API_KEY unset, Jev calls skipped, heuristic used");
  await waitForServer();
  log(`start ${START_LEVEL} hands ${HANDS}${DURATION_MS ? ` or ${process.env.DURATION_MIN}min` : ""}`);
  const deadline = Date.now() + (DURATION_MS || HANDS * 180_000);
  const rooms = [];
  let plays = 0;
  let jevCalls = 0;
  let hands = 0;

  while (hands < HANDS && Date.now() < deadline && !(DURATION_MS && Date.now() - startedAt >= DURATION_MS)) {
    const table = await openTable(failures);
    let announced = 0;
    let roomHands = 0;
    let ended = false;
    while (Date.now() < deadline && !(DURATION_MS && Date.now() - startedAt >= DURATION_MS)) {
      const probe = await api(`/api/room/${table.code}/state?seatToken=${encodeURIComponent(table.seats[0].token)}`);
      if (!probe.response.ok) {
        failures.push(probe.body.error || "state failed");
        break;
      }
      const rounds = probe.body.match?.rounds?.length ?? 0;
      if (rounds > announced) {
        const last = probe.body.match.rounds[rounds - 1];
        const fails = probe.body.match.aceFails;
        log(`room ${table.code} hand ${rounds} ${last?.outcome || ""} +${last?.delta ?? ""} ace ns ${fails?.ns ?? 0} ew ${fails?.ew ?? 0}`);
        hands += rounds - announced;
        announced = rounds;
        roomHands = rounds;
      }
      ended = probe.body.status === "finished" || probe.body.match?.status === "finished";
      if (hands >= HANDS || ended) break;
      const turn = probe.body.currentTurn;
      const actor = table.seats.find((item) => item.seat === turn) ?? table.seats[0];
      const state = actor.seat === table.seats[0].seat ? probe : await api(`/api/room/${table.code}/state?seatToken=${encodeURIComponent(actor.token)}`);
      if (!state.response.ok) {
        failures.push(state.body.error || "state failed");
        break;
      }
      if (!state.body.you?.yourTurn) {
        await new Promise((resolve) => setTimeout(resolve, 80));
        continue;
      }
      const thinkStarted = Date.now();
      await postStatus(table.code, actor.token, { phase: "thinking", line: "思考中", thought: "看这一手的合法着法。" });
      await postStatus(table.code, actor.token, { phase: "jev", line: "Jev 快判中", thought: "把合法着法交给 Jev。" });
      const hint = await jevHint(state.body);
      if (!hint.skipped) {
        jevCalls += 1;
        await postMetric(table.code, actor.token, {
          kind: "jev",
          outcome: hint.ok ? "success" : "fail",
          jevMs: hint.ms,
          tokens: hint.tokens,
          costUsd: hint.costUsd,
          moveId: hint.choice,
        });
      }
      const move = (hint.choice && state.body.you.legal.find((item) => item.id === hint.choice)) || priorityPick(state.body);
      if (!move) {
        failures.push("empty legal list");
        break;
      }
      const reactionMs = Date.now() - thinkStarted;
      const costNote = hint.costUsd === null || hint.costUsd === undefined ? "" : ` · $${hint.costUsd}`;
      await postStatus(table.code, actor.token, {
        phase: "llm",
        line: hint.skipped ? "LLM 决策中" : `Jev ${hint.ms}ms${costNote}`,
        thought: hint.skipped ? "没有 Jev，改用启发式。" : `Jev 用了 ${hint.ms}ms。`,
        jevMs: hint.skipped ? null : hint.ms,
        tokens: hint.tokens,
        costUsd: hint.costUsd,
        reactionMs,
      });
      await postStatus(table.code, actor.token, {
        phase: "playing",
        line: "出牌中",
        thought: `准备 ${move.label}`,
        reactionMs,
        jevMs: hint.skipped ? null : hint.ms,
        costUsd: hint.costUsd,
        tokens: hint.tokens,
      });
      await postMetric(table.code, actor.token, {
        kind: "decision",
        outcome: "success",
        reactionMs,
        moveId: move.id,
        jevMs: hint.skipped ? null : hint.ms,
        tokens: hint.tokens,
        costUsd: hint.costUsd,
      });
      const acted = await api(`/api/room/${table.code}/act`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ seatToken: actor.token, moveId: move.id }),
      });
      if (!acted.response.ok) {
        await postStatus(table.code, actor.token, { phase: "error", line: "错误/重试", thought: acted.body.error || "出牌失败" });
        failures.push(acted.body.error || "act failed");
        if (acted.response.status !== 409) break;
        continue;
      }
      plays += 1;
    }

    const done = await api(`/api/room/${table.code}/state?seatToken=${encodeURIComponent(table.seats[0].token)}`);
    const ace = done.body.match?.aceFails;
    const telemetry = await api(`/api/room/${table.code}/telemetry`);
    rooms.push({
      code: table.code,
      hands: roomHands,
      metrics: telemetry.body.metrics?.length ?? 0,
      ace,
      ended,
    });
    log(`ok room ${table.code} hands ${roomHands} metrics ${telemetry.body.metrics?.length ?? 0} ace ns ${ace?.ns ?? "?"} ew ${ace?.ew ?? "?"}`);
    if (!ace) failures.push("打A counters missing on the match");
    if (roomHands < 1) {
      failures.push("no settled hand");
      break;
    }
  }

  if (failures.length) log(`notes ${failures.join(" | ")}`);
  const roomLines = rooms
    .map((room) => `\`${room.code}\` hands ${room.hands}, metrics ${room.metrics}, 打A 南北 ${room.ace?.ns ?? "missing"} 东西 ${room.ace?.ew ?? "missing"}, replay \`/replay/${room.code}\``)
    .join("; ");
  writeNotes(`
## Last run

- Start level ${START_LEVEL}. Settled hands ${hands}. Seat plays ${plays}. Rooms: ${roomLines || "none"}.
- Four seats claimed in this process. Jev calls: ${jevCalls}. ${jevOn ? "TYPESAFE_API_KEY was set in the environment." : "TYPESAFE_API_KEY was unset, so Jev was skipped and the heuristic played."}
- Passing A ends that match. The harness opens another room until HANDS or DURATION_MIN.
- Failures and UX notes: ${failures.length ? failures.map((item) => redact(item)).join("; ") : "none in this run"}.
`);
  if (hands < 1) process.exit(1);
}

main().catch((error) => {
  console.error(redact(error instanceof Error ? error.message : String(error)));
  process.exit(1);
});
