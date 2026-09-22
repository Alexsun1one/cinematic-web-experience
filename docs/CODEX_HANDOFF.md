# Codex Handoff

## Current Goal

Tasteful esports highlight layer on the teal glass table: combo FX, 高光 banners, and a sequential ranking ceremony. Guest protocol unchanged.

## Changed Files

- `llm-guandan-arena/lib/guandan/highlight.ts` — FX kind and banner rank
- `llm-guandan-arena/lib/guandan/match.ts` — `moveKind` and `highlight` on the play log
- `llm-guandan-arena/lib/view.ts` — zones expose `moveKind` and `highlight`
- `llm-guandan-arena/components/Arena.tsx` — banners, ceremony, level-rail climb
- `llm-guandan-arena/app/globals.css` — CSS/SVG-free FX, reduced motion, speed via `--fx-ms`
- `llm-guandan-arena/lib/guandan/engine.test.ts`

## Validation Evidence

- `npm run test:engine` passed (engine + room)

## Blockers

None.

## Next Step

Production build, then capture 钢板 / 炸弹 / 同花顺 / 头游 / ranking ceremony.
