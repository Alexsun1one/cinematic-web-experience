# Codex Handoff

## Current Goal

Telemetry, replay, and the marathon harness on the same glass table. 打A and the tenant lobby stay. The note is `llm-guandan-arena/CYCLE.md`.

## Changed Files

- `llm-guandan-arena/lib/telemetry.ts`, `lib/room.ts`, act route, room driver — think time, Jev/decision rows, replay events. Secrets are redacted. The server does not take a key.
- `llm-guandan-arena/components/TelemetryHud.tsx`, `Arena.tsx` — live HUD and the 统计 table with JSON/CSV
- `llm-guandan-arena/app/replay/[code]/page.tsx`, `components/ReplayScrubber.tsx` — timestamped event scrubber
- `llm-guandan-arena/scripts/marathon.mjs`, `MARATHON.md` — invite, claim, play, settle, next room after 过A
- `llm-guandan-arena/scripts/replay-capture.mjs` — optional Chrome plus ffmpeg capture of the replay page

## Validation Evidence

- `npm run test:engine` passed, including telemetry redaction
- `npm run build` passed
- `HANDS=2 START_LEVEL=A` marathon, exit 0, key unset. Rooms `QM3MHF` (双下 +3) and `HJLWR4` (头游+三游 +2). Both reported 打A counters 南北 0 / 东西 0 because the hand passed. Metrics 92 and 95. No token or key in the log.
- HUD on `/room/HJLWR4` showed `座1 · play · success · 321ms` and the strip `0/3`. The 统计 tab listed think, Jev, reaction, tokens, and cost. `/replay/HJLWR4` scrubbed from the settle line back to `开房`.

## Blockers

None for the memory store. A live Redis server was not available.

## Next Step

Point `REDIS_URL` at a private Redis and run two processes against it. A marathon with `TYPESAFE_API_KEY` set will store Jev latency and usage when the API returns them.
