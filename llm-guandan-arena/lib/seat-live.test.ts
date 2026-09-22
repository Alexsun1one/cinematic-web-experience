import assert from "node:assert/strict";
import { chipText, emptySeatLive, nextSeatLives, phaseLabel, thoughtIsOpen } from "./seat-live";

const now = 5_000;
const idle = emptySeatLive(1_000);
assert.equal(phaseLabel("thinking"), "思考中");
assert.equal(phaseLabel("timeout"), "超时 Mock");
assert.equal(chipText({ ...idle, phase: "thinking", since: 4_200, line: "思考中" }, now), "思考中 800ms");
assert.equal(thoughtIsOpen(false, null, 1), false);
assert.equal(thoughtIsOpen(false, 2, 1), false);
assert.equal(thoughtIsOpen(false, 1, 1), true);
assert.equal(thoughtIsOpen(true, null, 1), true);

const first = nextSeatLives([idle, idle, idle, idle], 2, { phase: "thinking", line: "思考中", thought: "Bearer sk-secret-token-value" }, now);
assert.equal(first.changed, true);
assert.equal(first.lives[2].thought.includes("sk-secret"), false);
assert.match(first.lives[2].thought, /\[redacted\]/);

const again = nextSeatLives(first.lives, 2, { phase: "thinking", line: "思考中" }, now + 400);
assert.equal(again.changed, false);
assert.equal(again.lives[2].since, now);

const jev = nextSeatLives(again.lives, 2, { phase: "jev", line: "Jev 120ms · $0.02", jevMs: 120, costUsd: 0.02 }, now + 500);
assert.equal(jev.lives[2].costUsd, 0.02);
assert.equal(jev.lives[2].jevMs, 120);
assert.equal(jev.lives[0].phase === "thinking" || jev.lives[0].phase === "idle", true);

const busy = nextSeatLives(jev.lives, 0, { phase: "thinking", line: "思考中" }, now + 800);
assert.equal(busy.lives[2].phase, "waiting");
assert.equal(busy.lives[0].phase, "thinking");

console.log("seat live tests passed");
