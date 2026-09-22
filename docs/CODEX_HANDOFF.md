# Codex Handoff

## Current Goal

Glass Arena. **复制给 Agent** is a self-check + self-play protocol: guest owns Jev and LLM. Server lists legal moves and Mock/passes on timeout. Bigger cards, smaller felt. `npm run watch` still opens a Mock spectator match.

## Changed Files

- `llm-guandan-arena/lib/invite.ts`, `lib/room.ts`, `lib/room-driver.ts`, `lib/room.test.ts`
- `llm-guandan-arena/app/api/room/[code]/{claim-seat,state,act}`
- `llm-guandan-arena/app/api/rooms/[code]/invite`
- `llm-guandan-arena/scripts/guest-agent.mjs`
- `llm-guandan-arena/components/RoomTable.tsx`, `Lobby.tsx`, `Arena.tsx`, `RulesDrawer.tsx`
- `llm-guandan-arena/app/globals.css`, `README.md`

## Validation Evidence

- `npm run test:engine` (engine + room tests)
- `npm run build`
- Screenshots: room lobby with code, 4 agents seated, spectator HUD

## Blockers

None for Mock zero-key room → spectator second tab.

## Next Step

Optional Redis-backed rooms for multi-instance.
