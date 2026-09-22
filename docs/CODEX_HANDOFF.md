# Codex Handoff

## Current Goal

Glass Arena. Guest owns Jev and LLM. Invite and 规则速览 state the engine opening order. Guest state exposes phase, leaderSeat, currentTurn, mustBeat, legalMoves. Seats show 等待/自检中/就绪/出牌中/超时. Reference player is scripts/guest-agent-player.mjs. South hand is larger than the felt.

## Changed Files

- `llm-guandan-arena/lib/invite.ts`, `lib/room.ts`, `lib/room-driver.ts`, `lib/room.test.ts`
- `llm-guandan-arena/app/api/room/[code]/{claim-seat,state,act}`
- `llm-guandan-arena/app/api/rooms/[code]/invite`
- `llm-guandan-arena/scripts/guest-agent.mjs`
- `llm-guandan-arena/components/RoomTable.tsx`, `Lobby.tsx`, `Arena.tsx`, `RulesDrawer.tsx`
- `llm-guandan-arena/app/globals.css`, `README.md`

## Validation Evidence

- `npm run test:engine` (engine + room tests, including guest invite)
- `npm run build`
- `scripts/guest-agent.mjs` without `TYPESAFE_API_KEY` exits `缺 Jev，不能打`
- Room `XQYU22`: claim without keys starts a self seat; posting `apiKey` is rejected; illegal `moveId` is rejected; public JSON omits the seat token; idle self seat advances as Mock after the turn budget; a legal `act` is accepted
- Screenshots: invite copy block, how-to, rules drawer, mid-game cards

## Blockers

None for Mock zero-key room → spectator second tab.

## Next Step

Optional Redis-backed rooms for multi-instance.
