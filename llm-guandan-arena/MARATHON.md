# Marathon

`npm run marathon` from `llm-guandan-arena` claims all four seats in this process. Each seat asks Jev when `TYPESAFE_API_KEY` is already in the environment, then plays a legal move. The Guandan server never receives the key. If the variable is missing, every seat uses the shared heuristic and the run notes say Jev was skipped. Token counts and dollar cost are stored only when the API response includes usage.

The run copies four invites, joins all four seats, and plays until `HANDS` (default 50) or `DURATION_MIN` (for example 120), whichever finishes first. `START_LEVEL` defaults to A so each settle line includes the 打A counters. Passing A ends that match. The harness opens the next room until the hand or time cap.

Watch a finished room at `/replay/[code]`. The 统计 tab downloads the room telemetry as JSON or CSV (`thinkMs`, `jevMs`, `reactionMs`, `tokens`, `costUsd`). `GET /api/room/<code>/telemetry` is the same JSON. `npm run replay:capture` records the replay page when both Chrome and ffmpeg are installed.

## Run on a machine that already has the key

Do not put the key on the command line, in a file in this repo, or in the pull request. The shell must already have `TYPESAFE_API_KEY`. Optional: `TYPESAFE_BASE_URL`, `TYPESAFE_MODEL`, `JEV_MS` (default 3500).

From the repo root, start the server in one shell:

```bash
cd llm-guandan-arena
npm run build
npm run start -- --port 3456
```

In a second shell on that same machine, with the key already in the environment:

```bash
cd llm-guandan-arena
npm run marathon
```

That is the default 50-hand, four-seat run at level A. For a two-hour cap instead:

```bash
cd llm-guandan-arena
DURATION_MIN=120 npm run marathon
```

`HANDS=2` is the short check. Notes replace the block below. The log prints room codes and 打A counters, not seat tokens and not the key.

<!-- last-run -->
## Last run

- Start level A. Settled hands 1. Seat plays 79. Rooms: `2X3Y2Z` hands 1, metrics 158, 打A 南北 1 东西 0, replay `/replay/2X3Y2Z`.
- Four seats claimed in this process. Jev calls: 0. TYPESAFE_API_KEY was unset, so Jev was skipped and the heuristic played.
- Passing A ends that match. The harness opens another room until HANDS or DURATION_MIN.
- Failures and UX notes: TYPESAFE_API_KEY unset, Jev calls skipped, heuristic used.
<!-- /last-run -->
