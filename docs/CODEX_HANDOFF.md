# Codex Handoff

## Current Goal

Peer QA checklist for seat join, 打A, the fail counter, room isolation, timeout policy, and idempotent settle. The note is `llm-guandan-arena/CYCLE.md`.

## Changed Files

- `llm-guandan-arena/lib/room.ts` — claiming a token that already owns a seat returns that seat; timeout streak; `GUANDAN_KICK_AFTER`
- `llm-guandan-arena/lib/room-store.ts`, `lib/store.ts` — sliding TTL (`GUANDAN_ROOM_TTL_SEC`, default 6 hours) on room and match keys; expired rows are misses
- `llm-guandan-arena/lib/guandan/engine.test.ts`, `lib/room.test.ts` — 头游+二游 / 头游+三游 / 头游+末游, new-match counter, duplicate settle, two rooms, TTL, compare-and-set
- `llm-guandan-arena/CYCLE.md`, `AUDIT.md`, `MULTI_TENANT.md`, `BACKEND.md`, README, `.env.example`

## Validation Evidence

- `npm run test:engine` passed
- `npm run build` passed
- Live: empty start 400, duplicate claim 200 same seat, mid-game unknown token 400, bad moveId 400 while still your turn, listed move 200, wrong tenant 404, invite phrases present, public JSON without seatToken
- `HANDS=2` operator room `GXG73U`, exit 0. Hand 1 东西 头游+末游 +1 (T→J). Hand 2 南北 头游+三游 +2 (T→Q)

## Blockers

None for the memory store. A live Redis server was not available, so `EXPIRE` was not exercised against Redis.

## Next Step

Point `REDIS_URL` at a private Redis and run two processes against it.
