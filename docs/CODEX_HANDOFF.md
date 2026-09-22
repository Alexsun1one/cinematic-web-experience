# Codex Handoff

## Current Goal

Glass Arena + rooms. Local one-shot: `npm run watch` (alias `arena:watch`) starts dev on :3456 if needed, fills 4 Mock seats, starts the match, opens `/room/CODE?role=spectator`. Host URL is printed with `?host=<secret>`. In-browser: `/watch-now`.

## Changed Files

- `llm-guandan-arena/lib/room.ts` + `lib/room.test.ts` — room state machine
- `llm-guandan-arena/app/api/rooms/**` — create/join/seat/fill/start/chat/stream
- `llm-guandan-arena/components/RoomTable.tsx`, `Lobby.tsx`, `Arena.tsx`
- `llm-guandan-arena/app/room/[code]/page.tsx`
- `llm-guandan-arena/lib/llm/decide.ts`, `providers.ts`, `guandan/types.ts` — openai BYO
- `llm-guandan-arena/app/globals.css`, `README.md`

## Validation Evidence

- `npm run test:engine` (engine + room tests)
- `npm run build`
- Screenshots: room lobby with code, 4 agents seated, spectator HUD

## Blockers

None for Mock zero-key room → spectator second tab.

## Next Step

Optional Redis-backed rooms for multi-instance.
