import assert from "node:assert/strict";
import { metricsToCsv, readModelUsage, redactSecrets, sparkValues, type PlayMetric } from "./telemetry";

const row: PlayMetric = {
  id: 1,
  at: 10,
  room: "ROOM01",
  matchId: "m1",
  hand: 2,
  seat: 2,
  kind: "play",
  moveId: "s:3",
  outcome: "success",
  thinkMs: 40,
  jevMs: 12,
  reactionMs: 55,
  tokens: 20,
  costUsd: 0.001,
};

assert.equal(redactSecrets("Authorization: Bearer sk-live-secret-value and TYPESAFE_API_KEY=abcd1234"), "Authorization: [redacted] and [redacted]");
assert.equal(redactSecrets("普通出牌").includes("redacted"), false);
assert.deepEqual(readModelUsage({ usage: { total_tokens: 18, cost_usd: 0.02 } }), { tokens: 18, costUsd: 0.02 });
assert.deepEqual(readModelUsage({}), { tokens: null, costUsd: null });
assert.match(metricsToCsv([row]), /thinkMs,jevMs,reactionMs/);
assert.match(metricsToCsv([row]), /ROOM01,m1,2,2,play,s:3,success,40,12,55,20,0.001/);
assert.deepEqual(sparkValues([row, { ...row, thinkMs: null, jevMs: 9 }], "jevMs"), [12, 9]);
console.log("telemetry tests passed");
