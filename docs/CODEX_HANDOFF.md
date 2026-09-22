# Codex Handoff

## Current Goal

Telemetry, replay, and the marathon harness on the same glass table. 打A and the tenant lobby stay. The note is `llm-guandan-arena/CYCLE.md`.

## Changed Files

- `llm-guandan-arena/lib/telemetry.ts`, `lib/room.ts`, act route, room driver — think time, Jev/decision rows, replay events. Secrets are redacted. The server does not take a key.
- `llm-guandan-arena/components/TelemetryHud.tsx`, `Arena.tsx` — live HUD and the 统计 table with JSON/CSV
- `llm-guandan-arena/app/replay/[code]/page.tsx`, `components/ReplayScrubber.tsx` — timestamped event scrubber
- `llm-guandan-arena/scripts/marathon.mjs`, `MARATHON.md` — four seats, Jev only from `TYPESAFE_API_KEY`, next room after 过A
- `llm-guandan-arena/scripts/replay-capture.mjs` — optional Chrome plus ffmpeg capture of the replay page

## Validation Evidence

- `npm run test:engine` passed, including telemetry redaction
- `npm run build` passed
- `HANDS=1 START_LEVEL=A` four-seat marathon, exit 0, key unset. Room `2X3Y2Z` settled 头游+末游 +1, 打A 南北 1 / 东西 0. HUD reads 出牌 / Jev / 反应. No token or key in the log.
- HUD on `/room/HJLWR4` showed `座1 · play · success · 321ms` and the strip `0/3`. The 统计 tab listed think, Jev, reaction, tokens, and cost. `/replay/HJLWR4` scrubbed from the settle line back to `开房`.

## Blockers

None for the memory store. A live Redis server was not available.

## Next Step

Point `REDIS_URL` at a private Redis and run two processes against it. A marathon with `TYPESAFE_API_KEY` set will store Jev latency and usage when the API returns them.
