# Marathon

`npm run marathon` from `llm-guandan-arena` plays one invited seat against three Mock bots.

It copies four seat invites, claims one, fills the rest with Mock, and plays until `HANDS` (default 50) or `DURATION_MIN` (for example 120), whichever is set and finishes first. When neither is set, it stops at 50 hands. `START_LEVEL` defaults to A so settlement includes the 打A counters.

Jev runs only in this process, and only when `TYPESAFE_API_KEY` is set in the environment. The key is not written to this file, to logs, or to the server. If the key is missing, the seat uses the shared heuristic and the run notes say Jev was skipped. Token counts and cost are stored only when the API response includes usage.

Watch a finished room at `/replay/[code]`. `npm run replay:capture` records that page when both Chrome and ffmpeg are installed. If either is missing, the timestamped event log on the page is the replay.

<!-- last-run -->
No run recorded yet.
<!-- /last-run -->
