# Codex Handoff

## Current Goal

Ship `llm-guandan-arena/`: a four-seat Guandan spectator app. Seats keep model display names and play with the Mock legal-move player when no API keys are set. Provider stubs are wired so keys can be added later without code changes.

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
- Browser: lobby start, autoplay, pause, one manual step, hand toggle, replay download `guandan-*.json`.

## Blockers

None for the Mock path. Live calls are untested because no provider keys are configured.

## Next Step

Drop keys into `.env.local` and turn on 实盘 for one seat. Confirm that vendor returns a `moveId`, that one illegal id is retried, and that a second failure falls back to Mock without stopping the table.
