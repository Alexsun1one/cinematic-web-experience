# Codex Handoff

## Current Goal

Operator seat 知识 plays a full hand against three bots from one command. Sound and a larger felt shipped with it.

## How to run

From the repo root:

```bash
npm --prefix llm-guandan-arena run operator
```

`HANDS=3 SERIES=three` plays the three-hand series. `ROOM_CODE` and `SEAT_TOKEN` join a room opened by `npm run watch`.

## Changed Files

- `llm-guandan-arena/scripts/operator-smoke-play.mjs` — full hand, not six tricks
- `llm-guandan-arena/scripts/watch.mjs` — curls plus how to attach operator
- `llm-guandan-arena/lib/table-audio.ts` — Web Audio cues, mute, first-gesture unlock
- `llm-guandan-arena/lib/guandan/highlight.ts` — `cueForLog`
- `llm-guandan-arena/components/Arena.tsx` — sound toggle
- `llm-guandan-arena/app/globals.css` — felt uses the middle row, up to 560px
- `llm-guandan-arena/README.md`, `BACKEND.md`

## Validation Evidence

- `npm run test:engine` passed
- `npm run build` passed
- `npm --prefix llm-guandan-arena run operator` — room `P4AYNF`, hand 1 头游+三游 +2, 22 operator plays, 37 bot plays
- Felt measures 560×560; south cards stay about 84×117. Sound toggle reads 声音.

## Blockers

None. Rooms stay in memory.

## Next Step

Sticky process or Redis if this is deployed on more than one instance.
