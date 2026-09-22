# Codex Handoff

## Current Goal

`llm-guandan-arena/` is a Jiangsu-style spectator table. South’s hand defaults to staggered vertical 理牌. The HUD shows the 2→A track, the end of a hand announces the upgrade, and the 统计 tab exports the series. A short 快推理 beat still plays before each seat.

The cinematic-web-experience skill in the repo root is unchanged.

## Changed Files

- `llm-guandan-arena/` — lobby series (本局起 / 三局 / 打满一盘), vertical columns, level track, ceremony, stats.
- `docs/CODEX_HANDOFF.md` — this note.

Upgrade rule already in the engine, now named in the ceremony: winners only, 双下 +3, 头游+三游 +2, 头游+末游 +1. A fixed series ends on the higher level if A is not passed.

Seat display names, even in Mock:

- Seat 0 North: DeepSeek V4.1 Flash (`DEEPSEEK_API_KEY`)
- Seat 1 East: Gemini 3.8 Flash (`GEMINI_API_KEY` or `GOOGLE_API_KEY`)
- Seat 2 South: MiMo 2.6 Flash (`MIMO_API_KEY` + `MIMO_BASE_URL`)
- Seat 3 West: GLM 5.3 Flash (`ZHIPU_API_KEY`)

Optional Jev assist: `TYPESAFE_API_KEY` → `POST {TYPESAFE_BASE_URL}/v1/systemone`. The spectator beat times out at 800ms. Illegal model moves are rejected once, then the Mock heuristic plays.

## Validation Evidence

- `npm run test:engine` passed, including column order (bomb and 同花顺 left of singles, 逢人配 first), 头游+三游 on a 1-hand series, finish counts, bomb and pass stats, CSV header.
- `npm run build` passed after the layout and stats work.
- Browser, zero keys: south hand is staggered rank columns (taller structures on the left) with 27 cards; felt stays square; HUD reads 打到 10 with the 2→A rail; end of hand shows 头游+末游 +1 and 东西 打10 → 打J; 统计 lists 头游率, 双下, and the hand log.

## Blockers

None for the Mock path. Live calls are untested because no provider keys are configured.

## Next Step

Drop keys into `.env.local` and turn on 实盘 for one seat. Confirm that vendor returns a `moveId`, that one illegal id is retried, and that a second failure falls back to Mock without stopping the table.
