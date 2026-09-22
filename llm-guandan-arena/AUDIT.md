# Guandan arena audit

Date: 2026-09-22. Branch `cursor/llm-guandan-arena-6cfe`.

## Round 1 — Engine

| Item | Result |
| --- | --- |
| `npm run test:engine` | Pass |
| 双下进贡, larger card to 头游, then 还贡, 头游 leads | Pass (existing + kept) |
| 单下, including 末游 is 头游's partner | Pass. Added exchange test. 头游 leads after the return |
| 抗贡, one loser holds both 大王 | Pass. No cards move. 头游 leads |
| 抗贡, the two 大王 are split across the paying side | Pass. Added |
| 还贡 when the hand has no 2–10 | Pass. Falls back to the smallest non-joker non-wild, then plays |
| Illegal `moveId` rejected | Pass. `commitMove` throws. Live `POST act` returned 400 `非法着法，只能出 legal 列表里的 moveId`. A listed id returned 200 |
| `legalMoves` matches `you.legal` on your turn, null otherwise | Pass |
| +3 / +2 / +1 | Pass |
| 打A: winning on A, and reaching A from K | Updated after this audit. Reaching A no longer wins. On A, 头游+二游 or 头游+三游 passes; 头游+末游 stays; the third failure drops that side to 2 |

## Round 2 — Agent protocol

| Item | Result |
| --- | --- |
| Invite includes `prompts/guandan-agent-system.md` | Pass. Live invite contained 不要等人类教牌, 缺 Jev, and claim-seat |
| claim → state → act | Pass. Operator claimed 知识 and played |
| seatToken hidden from spectators | Pass. Public room JSON did not contain the token. A wrong token returns `you: null` |
| Timeout does not deadlock | Pass. Driver catches a thrown tick and keeps the loop. Timeout still submits the heuristic or the listed tribute card |
| `HANDS=2` operator | Pass. Room `WW4C6J`, exit 0. Hand 1 头游+末游 +1. Hand 2 头游+末游 +1. 知识 33 plays, bots 71 card plays. No thrown error |

## Round 3 — Product surface

| Item | Result |
| --- | --- |
| Felt size | Pass. `.table-rim` 560×560 on a 1440×1100 viewport |
| South cards stay large | Pass. Measured 84×117. No page-level horizontal overflow |
| Highlight on the felt | Pass. A highlight banner was on screen and the layout held |
| Sound mute | Pass. Toggle went from 声音 to 静音. `playTableCue` / `armAudio` do not throw when `AudioContext` and `localStorage` are missing |
| Spectator + 复制给 Agent | Pass. Button text 复制给 Agent. Preview includes the goals, the Jev self-check, and claim-seat |
| README / BACKEND.md | Pass. Both say rooms live in one process and a restart clears them. Multi-instance needs a sticky process or Redis |

## Round 4 — Regression

| Item | Result |
| --- | --- |
| `npm run test:engine` | Pass, after the fixes below |
| `npm run build` | Pass |
| `HANDS=2` operator on that build | Pass. Room `WW4C6J`, exit 0 |

## Bugs fixed this loop

- The room driver now catches a thrown tick instead of exiting, so one bad act cannot freeze the table.
- Sound no longer throws if `AudioContext` cannot be constructed or `localStorage` is blocked.
- `POST act` says 对局已结束 when the match is over, and 现在不能出牌 during 抗贡 or between hands, instead of 还没开打.
- Tests now cover split 抗贡, partner-last 单下, empty 还贡, who leads after, illegal ids, reaching A without ending the match, the invite goals text, a bad seatToken, and audio calls without a browser.

## Remaining limits

- Without `REDIS_URL`, rooms and matches stay in this process. With `REDIS_URL`, instances share them. See `MULTI_TENANT.md`. The Redis `EXPIRE` path is in the client and covered by the Lua string plus the memory `expiresAt` tests. This environment did not run a live Redis.
- There is no click-to-play hand. 知识 plays through claim / state / act.
- 抗贡 is decided by the engine. Agents do not send a resist move. They wait, then 头游 leads.
- `npm run operator` uses the shared heuristic unless `LLM_API_KEY` is set.
- Reaching A does not end the match. Passing A needs 头游 and a partner who is not 末游. The engine labels 头游+二游 as 双下 (+3) and 头游+三游 as +2. Three 头游+末游 failures drop that side to 2.

## QA checklist decisions

- The 打A fail count is per side on that match. A new room calls `createMatch`, which starts both sides at 0. It is not keyed by opponent. Seats stay 0+2 against 1+3 for the series. The other side winning a hand leaves the count where it was.
- Claiming a token that already owns a seat is a no-op, in the lobby and after the deal. The name does not change. An unknown token after the deal throws and leaves the seats alone. Start requires four ready seats. A second start throws and does not deal again.
- A second `commitMove` after the hand has left `playing` throws. Levels and the fail count stay as the first settle left them, including a drop to 2.
- Illegal `moveId` is 400. The hand and the seat to move stay put. The driver catches a thrown tick. Timeout plays one heuristic move. `GUANDAN_KICK_AFTER` unset or `0` does not kick. A positive value switches that self seat to Mock after that many consecutive timeouts and keeps the token.
- Room TTL defaults to 6 hours, refreshed on each save. `0` disables it. Two compare-and-set writes of the same revision: one full row wins, the other is dropped.
