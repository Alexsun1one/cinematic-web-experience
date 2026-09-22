# Codex Handoff

## Current Goal

进贡 / 还贡 / 抗贡 are in the engine, the seat API, the invite, and the felt ceremony. Operator seat (3 bots + 知识) stays.

## Rule

First hand: no tribute. Seat 0 leads.

Later hands: deal, then tribute, then 头游 leads.

- 双下 (+3): 三游 and 末游 each pay the largest non-wild. Higher card goes to 头游, lower to 二游. Tie: 末游's card to 头游.
- 单下 (+2 or +1): only 末游 pays one card to 头游.
- 进贡 is forced (`t:cardId`). 还贡 is 2–10, not the level, not a joker, not a wild; otherwise the smallest non-joker non-wild (`r:cardId`).
- 抗贡: the paying side holds both 大王. No exchange. Status `resist`, then 头游 leads.
- After resist and after the exchange, 头游 leads (the larger tribute is assigned to 头游).

## Changed Files

- `llm-guandan-arena/lib/guandan/tribute.ts`
- `llm-guandan-arena/lib/guandan/match.ts` — phases, `previousOrder`, exchange
- `llm-guandan-arena/lib/guandan/procedure.ts`, `lib/invite.ts`, `lib/view.ts`, `lib/room.ts`
- `llm-guandan-arena/lib/room-driver.ts`, act route, step route, guest script
- `llm-guandan-arena/components/Arena.tsx`, `app/globals.css` — tribute board
- `llm-guandan-arena/lib/guandan/engine.test.ts`, `lib/room.test.ts`
- `llm-guandan-arena/README.md`, `BACKEND.md`

## Validation Evidence

- `npm run test:engine` passed (双下进贡, 还贡, 抗贡, invite copy)
- `npm run build` passed

## Blockers

None. Rooms stay in memory.

## Next Step

Sound, a larger felt, and a sticky-process deploy note are still queued.
