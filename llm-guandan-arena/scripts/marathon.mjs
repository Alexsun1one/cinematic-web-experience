#!/usr/bin/env node
/**
 * Marathon table. One invited seat plus three Mock bots.
 * Jev and LLM stay in this process. The server never receives a key.
 *
 * HANDS=50            stop after this many settled hands (default 50)
 * DURATION_MIN=120    optional time cap, whichever comes first
 * START_LEVEL=A       so 打A counters are in the settle line
 * PORT=3456
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

function usageOf(body) {
  const usage = body && typeof body === "object" ? body.usage : null;
  const tokens = typeof usage?.total_tokens === "number" ? usage.total_tokens : null;
  const cost = typeof usage?.cost_usd === "number" ? usage.cost_usd : typeof usage?.cost === "number" ? usage.cost : null;
  return { tokens, costUsd: cost };
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
      signal: AbortSignal.timeout(800),
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

async function main() {
  const failures = [];
  const startedAt = Date.now();
  await waitForServer();
  const created = await api("/api/rooms", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ series: "open", startLevel: START_LEVEL, autoFillMock: false, seatsOpen: true }),
  });
  if (!created.response.ok || !created.body.code || !created.body.hostSecret) fail(created.body.error || "create failed");
  const code = created.body.code;
  const host = created.body.hostSecret;
  log(`room ${code} start ${START_LEVEL} hands ${HANDS}${DURATION_MS ? ` or ${process.env.DURATION_MIN}min` : ""}`);

  const invites = [];
  for (const seat of [0, 1, 2, 3]) {
    const issued = await api(`/api/rooms/${code}/invite?seat=${seat}`, { headers: { "x-room-host": host } });
    if (!issued.response.ok || !issued.body.token || !issued.body.block) fail(issued.body.error || `invite ${seat}`);
    if (!issued.body.block.includes("你自己的 Jev")) failures.push("invite missing bring-your-own Jev line");
    invites.push(issued.body);
  }
  log(`copy-invite ok seats ${invites.map((item) => item.seat).join(",")}`);

  const token = invites[2].token;
  const claim = await api(`/api/room/${code}/claim-seat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ seatToken: token, name: "马拉松" }),
  });
  if (!claim.response.ok) fail(claim.body.error || "claim failed");
  log(`joined seat ${claim.body.you?.seat}`);

  const filled = await api(`/api/rooms/${code}/fill-mock`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-room-host": host },
    body: JSON.stringify({ hostSecret: host }),
  });
  if (!filled.response.ok) fail(filled.body.error || "fill failed");
  const started = await api(`/api/rooms/${code}/start`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-room-host": host },
    body: JSON.stringify({ hostSecret: host }),
  });
  if (!started.response.ok) fail(started.body.error || "start failed");

  const jevOn = Boolean(process.env.TYPESAFE_API_KEY);
  if (!jevOn) failures.push("TYPESAFE_API_KEY unset, Jev calls skipped, heuristic used");
  let plays = 0;
  let jevCalls = 0;
  let announced = 0;
  const deadline = Date.now() + (DURATION_MS || HANDS * 180_000);
  while (Date.now() < deadline) {
    if (DURATION_MS && Date.now() - startedAt >= DURATION_MS) break;
    const state = await api(`/api/room/${code}/state?seatToken=${encodeURIComponent(token)}`);
    if (!state.response.ok) {
      failures.push(state.body.error || "state failed");
      break;
    }
    const rounds = state.body.match?.rounds?.length ?? 0;
    if (rounds > announced) {
      const last = state.body.match.rounds[rounds - 1];
      const fails = state.body.match.aceFails;
      log(`hand ${rounds} ${last?.outcome || ""} +${last?.delta ?? ""} ace ns ${fails?.ns ?? 0} ew ${fails?.ew ?? 0}`);
      announced = rounds;
    }
    if (rounds >= HANDS || state.body.status === "finished" || state.body.match?.status === "finished") break;
    if (!state.body.you?.yourTurn) {
      await new Promise((resolve) => setTimeout(resolve, 120));
      continue;
    }
    const thinkStarted = Date.now();
    const hint = await jevHint(state.body);
    if (!hint.skipped) {
      jevCalls += 1;
      await postMetric(code, token, {
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
    await postMetric(code, token, { kind: "decision", outcome: "success", reactionMs, moveId: move.id, jevMs: hint.skipped ? null : hint.ms });
    const acted = await api(`/api/room/${code}/act`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ seatToken: token, moveId: move.id }),
    });
    if (!acted.response.ok) {
      failures.push(acted.body.error || "act failed");
      if (acted.response.status !== 409) break;
      continue;
    }
    plays += 1;
  }

  const done = await api(`/api/room/${code}/state?seatToken=${encodeURIComponent(token)}`);
  const rounds = done.body.match?.rounds?.length ?? 0;
  const ace = done.body.match?.aceFails;
  const telemetry = await api(`/api/room/${code}/telemetry`);
  const metricCount = telemetry.body.metrics?.length ?? 0;
  if (rounds < 1) failures.push("no settled hand");
  if (!ace) failures.push("打A counters missing on the match");
  log(`ok room ${code} hands ${rounds} plays ${plays} jev ${jevCalls} metrics ${metricCount} ace ns ${ace?.ns ?? "?"} ew ${ace?.ew ?? "?"}`);
  if (failures.length) log(`notes ${failures.join(" | ")}`);

  writeNotes(`
## Last run

- Room \`${code}\`, start level ${START_LEVEL}, settled hands ${rounds}, seat plays ${plays}.
- Jev calls from this process: ${jevCalls}. ${jevOn ? "TYPESAFE_API_KEY was set." : "TYPESAFE_API_KEY was unset, so Jev was skipped and the heuristic played."}
- 打A counters after the run: 南北 ${ace?.ns ?? "missing"}，东西 ${ace?.ew ?? "missing"}.
- Telemetry rows on the room: ${metricCount}.
- Failures and UX notes: ${failures.length ? failures.map((item) => redact(item)).join("; ") : "none in this run"}.
- Replay: \`/replay/${code}\`.
`);
  if (rounds < 1) process.exit(1);
}

main().catch((error) => {
  console.error(redact(error instanceof Error ? error.message : String(error)));
  process.exit(1);
});
