# Marathon

`npm run marathon` from `llm-guandan-arena` plays one invited seat against three Mock bots.

It copies four seat invites, claims one, fills the rest with Mock, and plays until `HANDS` (default 50) or `DURATION_MIN` (for example 120), whichever is set and finishes first. When neither is set, it stops at 50 hands. `START_LEVEL` defaults to A so settlement includes the 打A counters. Passing A ends that match, and the harness opens the next room until the hand or time cap.

Jev runs only in this process, and only when `TYPESAFE_API_KEY` is set in the environment. The key is not written to this file, to logs, or to the server. If the key is missing, the seat uses the shared heuristic and the run notes say Jev was skipped. Token counts and cost are stored only when the API response includes usage.

Watch a finished room at `/replay/[code]`. `npm run replay:capture` records that page when both Chrome and ffmpeg are installed. If either is missing, the timestamped event log on the page is the replay.

<!-- last-run -->
## Last run

- Start level A. Settled hands 2. Seat plays 33. Rooms: `QM3MHF` hands 1, metrics 92, 打A 南北 0 东西 0, replay `/replay/QM3MHF`; `HJLWR4` hands 1, metrics 95, 打A 南北 0 东西 0, replay `/replay/HJLWR4`.
- Jev calls from this process: 0. TYPESAFE_API_KEY was unset, so Jev was skipped and the heuristic played.
- Passing A ends that match. The harness opens another room until HANDS or DURATION_MIN.
- Failures and UX notes: TYPESAFE_API_KEY unset, Jev calls skipped, heuristic used.
<!-- /last-run -->
