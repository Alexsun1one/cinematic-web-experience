# Codex Handoff

## Current Goal

`llm-guandan-arena/` uses the **Glass Arena** skin: charcoal floor, electric teal accent, luminous emerald felt, glass HUD chips. Engine, Mock, vertical 理牌, level track, stats, and 快推理 are unchanged underneath.

## Changed Files

- `llm-guandan-arena/app/globals.css` — full rewrite away from lacquer/gold to modern glass/esports.
- `llm-guandan-arena/components/Arena.tsx` — chip controls, glass reason toast with mono latency, kinetic ceremony.
- `llm-guandan-arena/components/Lobby.tsx` — Glass Arena lobby copy + chip buttons.
- `llm-guandan-arena/components/CardView.tsx` — neon 「配」 badge on 逢人配.
- `docs/CODEX_HANDOFF.md` — this note.

## Validation Evidence

- `npm run test:engine`
- `npm run build`
- Screenshots: lobby, vertical hand, 快推理, end/stats + short mp4.

## Blockers

None for Mock.

## Next Step

Optional live-key seat check under the same skin.
