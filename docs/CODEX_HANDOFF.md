# Codex Handoff

## Current Goal

Ship `llm-guandan-arena/` as a Jiangsu-style spectator table: square wood-rimmed felt, a play zone per seat, South as an overlapping fan (or rank columns), opponent card backs by default. Seats keep model display names and play with the Mock legal-move player when no API keys are set.

The cinematic-web-experience skill in the repo root is unchanged.

## Changed Files

- `llm-guandan-arena/` — Next.js App Router app (lobby `/`, live table `/match/[id]`, step and replay routes).
- `docs/CODEX_HANDOFF.md` — this note.

Seat display names, even in Mock:

- Seat 0 North: DeepSeek V4.1 Flash (`DEEPSEEK_API_KEY`)
- Seat 1 East: Gemini 3.8 Flash (`GEMINI_API_KEY` or `GOOGLE_API_KEY`)
- Seat 2 South: MiMo 2.6 Flash (`MIMO_API_KEY` + `MIMO_BASE_URL`)
- Seat 3 West: GLM 5.3 Flash (`ZHIPU_API_KEY`)

Optional Jev assist: `TYPESAFE_API_KEY` → `POST {TYPESAFE_BASE_URL}/v1/systemone` with a Noul and a Choice. Illegal model moves are rejected once, then the Mock heuristic plays.

## Validation Evidence

- `npm run test:engine` passed (deck, bombs, wild straights, 接风, scripted 双上, full Mock matches from A, one round from 2, prompt hides other hands).
- `npm run build` passed (Next.js 15.5.25).
- `npm run dev` on port 3456: create match + six steps with zero keys. Log showed DeepSeek / Gemini / MiMo / GLM playing legal combos.
- Browser: square 620×620 felt, 北东南西, center 红心级牌, per-seat play zones (三连对 on all four sides), South overlapping fan of 27 cards, West/North red backs with counts, 理牌 columns, 明牌 vertical overlap. Lobby start, pause, step, and 复盘 export.
- `npm run test:engine` passed after the layout rewrite.

## Blockers

None for the Mock path. Live calls are untested because no provider keys are configured.

## Next Step

Drop keys into `.env.local` and turn on 实盘 for one seat. Confirm that vendor returns a `moveId`, that one illegal id is retried, and that a second failure falls back to Mock without stopping the table.
