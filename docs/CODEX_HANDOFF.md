# Codex Handoff

## Current Goal

Glass Arena skin + **一键开房** MVP: shareable `/room/[code]`, BYO agents (Mock / env / OpenAI-compatible), human spectators via SSE/poll, optional chat. In-memory Map (document Redis for multi-instance).

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
