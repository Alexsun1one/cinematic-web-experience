# Codex Handoff

## Current Goal

`llm-guandan-arena/` ships as a Jiangsu spectator table with the 「淮扬夜桌」 skin: lacquer wood, deep emerald felt, warm gold inlay. Vertical 理牌, level track, stats, and 快推理 stay in place under the new look.

The cinematic-web-experience skill in the repo root is unchanged.

## Changed Files

- `llm-guandan-arena/app/globals.css` — full 淮扬夜桌 token and surface rewrite.
- `llm-guandan-arena/components/Arena.tsx` — ceremony curtain, stats KPI cards, gem plaque, wells.
- `llm-guandan-arena/components/CardView.tsx` — taller column stagger.
- `llm-guandan-arena/components/Lobby.tsx` — matching hall skin label.
- `llm-guandan-arena/lib/guandan/arrange.ts` — higher role lifts for vertical columns.
- `docs/CODEX_HANDOFF.md` — this note.

## Validation Evidence

- `npm run test:engine`
- `npm run build`
- Browser screenshots: lobby, mid-hand vertical 理牌, 快推理+play, end ceremony/stats.

## Blockers

None for the Mock path.

## Next Step

Optional: drop provider keys and confirm one live seat still plays through the same skin.
