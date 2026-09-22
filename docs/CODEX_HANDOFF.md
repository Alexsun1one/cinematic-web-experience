# Codex Handoff

## Current Goal

Tasteful esports highlight layer on the teal glass table: combo FX, 高光 banners, and a sequential ranking ceremony. Guest protocol unchanged.

## Changed Files

- `llm-guandan-arena/lib/guandan/highlight.ts` — FX kind and banner rank
- `llm-guandan-arena/lib/guandan/match.ts` — `moveKind` and `highlight` on the play log
- `llm-guandan-arena/lib/view.ts` — zones expose `moveKind` and `highlight`
- `llm-guandan-arena/components/Arena.tsx` — banners, ceremony, level-rail climb
- `llm-guandan-arena/app/globals.css` — CSS FX, reduced motion, speed via `--fx-ms` / `--banner-ms`
- `llm-guandan-arena/lib/guandan/engine.test.ts`

## Validation Evidence

- `npm run test:engine` passed (engine + room)
- `npm run build` passed
- Frozen matches: 钢板 seed 8 step 1, 首炸/4炸 seed 1 step 7, 同花顺 seed 1 step 257, 头游 seed 1 step 47, 双下 ceremony seed 1 step 73
- Screenshots: `guandan-hl-plate.png`, `guandan-hl-bomb.png`, `guandan-hl-flush.png`, `guandan-hl-firstout.png`, `guandan-hl-ceremony.png`
- Recording: `guandan-highlights.mp4`

## Blockers

None. Rooms stay in memory; a public deploy still needs a sticky process or Redis.

## Next Step

Optional Redis-backed rooms for multi-instance.
