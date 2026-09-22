# Cycle

Branch `cursor/llm-guandan-arena-6cfe`.

## Information architecture

Same teal glass skin. Three layers, no new theme.

| Piece | Result |
| --- | --- |
| Lobby by intent | **Pass.** Top is the tenant. The list stays empty until 锁定. 更换 clears the list. Default filter is 可入座. 围观中 / 我开的 / 已满 are separate. A room from tenant `other-ui` did not appear on the `default` list. Entering a room opens the seat map: empty seats say 入座, a full room says 已满 · 围观, and 填 Mock / 开打 sit only on 北 · 房主. |
| 打A strip | **Pass.** Fixed above the seat map and above the table: `目标 A · 本方已试 n/3 · 三不过 → 回 2`. `n` and the limit come from `match.aceFails` and `aceStrikeLimit()`. A fresh live match reported `{ns:0,ew:0}` and limit 3, and the strip showed `0/3`. Dropping from A to 2 flashes the strip once. Limit `0` says 一直停在 A. |
| Room rail | **Pass.** 大厅 stays on the rail. Rooms show a waiting or active dot. The current room is solid. Opening `WHGAS4` then `VPX9CH` left the locked tenant as `default`. |

Deferred: tenant admin shell, seat FX polish, in-table chat, A-history charts. The replay timeline is the `/replay/[code]` scrubber.

`npm run test:engine` passed. `npm run build` passed. Redis is still the shared store when `REDIS_URL` is set. This environment did not run a live Redis.

## Peer QA checklist

Peer QA checklist, then `test:engine`, `build`, and `HANDS=2`.

## Checklist

| # | Item | Result |
| --- | --- | --- |
| 1 | Seat join | **Pass.** One paste claims a seat. Start with an empty table returns 400 `四席未就绪` and leaves the room in the lobby. A second claim of the same token returns 200 and the same seat; the name stays. An unknown token after the deal returns 400 `已经开打` and does not change seats. Rejoin with the same token returns 200. Live room `RQTWKT`. |
| 2 | Pass A | **Pass.** 头游+二游 is the engine's 双下 (+3) and finishes the match on A. 头游+三游 (+2) finishes. 头游+末游 (+1) stays on A and adds one fail. Covered in `engine.test.ts`. |
| 3 | Three A-fails | **Pass.** The third 头游+末游 drops that side to 2 and clears the count. The count is per side on that match. A new `createMatch` starts both sides at 0, so a new room resets it. It is not keyed by opponent; seats stay 0+2 vs 1+3. The other side winning a hand does not clear or increment it. |
| 4 | Room store | **Pass on the memory store. Live Redis not run.** Tenants cannot read each other's codes (unit, and live wrong tenant 404). An `expiresAt` in the past is a miss, and a later create can reuse the code. Two compare-and-set calls on the same revision: one full row wins, the other is rejected. Redis `EXPIRE` is in `ROOM_CAS_LUA` and on match save. Default TTL is 6 hours (`GUANDAN_ROOM_TTL_SEC`), refreshed on each save. `0` disables it. This environment has no Redis server. |
| 5 | Timeout and illegal play | **Pass.** A bad `moveId` returned 400 `非法着法，只能出 legal 列表里的 moveId` and the seat was still to move. The next listed id returned 200. Consecutive illegal acts are rejected and do not kick. A timeout plays one heuristic move and continues. `GUANDAN_KICK_AFTER` unset or `0` never switches the seat to Mock. Set to `2`, the second consecutive timeout switches that self seat to Mock and keeps the token. A real act clears the streak. The driver still catches a thrown tick. |
| 6 | Disconnect | **Pass.** The seat stays. Timeout sets `lastTimeoutSeat` and the streak. The room is readable again with the same token, including after a configured switch to Mock. |
| 7 | Idempotent settle | **Pass.** A second claim does not start a second match and does not change levels. `commitMove` after the hand has left `playing` throws. A finished 头游+二游 stays one round at A. A drop to 2 stays at 2 with fail count 0. |
| 8 | Two rooms | **Pass.** Unit: start levels 2 and K, different match ids, public JSON does not contain the other room's code or match id. Live: `RQTWKT` start level 2 and `DMPJBF` start level K, different match ids. |
| 9 | Copy | **Pass.** The invite includes 你自己的 Jev, 缺 Jev, 升到 A 还不算赢, 头游+二游, 头游+三游, 头游+末游, and 退回 2. The engine labels 头游+二游 as 双下. |

## Commands

- `npm run test:engine` passed.
- `npm run build` passed.
- Live protocol on that build, as in the table. Public room JSON did not contain `seatToken`.
- `HANDS=2` operator room `GXG73U`, exit 0.
  - Hand 1: 东西 头游+末游 +1, T → J.
  - Hand 2: 南北 头游+三游 +2, T → Q.
  - Levels after those hands: 南北 Q, 东西 J.
  - 知识 51 plays, bots 65 card plays.

## Decisions

- Fail count: per side, per match. New room resets. Opponent change is not a separate counter.
- Kick: off unless `GUANDAN_KICK_AFTER` is a positive integer. Switching to Mock keeps the token.
- TTL: 6 hours sliding, on the room key and the match key. The tenant set and the match index are not expired.
- Duplicate settle is refused because the match is no longer `playing`. There is no second level bump.

## Telemetry, replay, marathon

| Piece | Result |
| --- | --- |
| Telemetry | **Pass.** Room `HJLWR4` stored 95 rows: play think time, decision reaction, seat, hand, move outcome. The HUD read `座1 · play · success · 321ms`. The 统计 tab exported from a table with 思考, Jev, 反应, tokens, 费用. `TYPESAFE_API_KEY` was unset, so Jev rows and cost stayed empty. A posted key is rejected. |
| Replay | **Pass.** `/replay/HJLWR4` opened on the settle line `第1局 头游+三游 +2 … 打A失败 南北0 东西0` and scrubbed back to `开房`. |
| Marathon | **Pass, key unset.** Four seats are claimed in this process. `HANDS=1 START_LEVEL=A` room `2X3Y2Z` settled 头游+末游 +1 with 打A counters 南北 1 / 东西 0. Load the key with `set -a; source /path/to/guandan.env; set +a` and do not commit that file. |
| Status board | **Pass.** Room `56SXNJ` streamed 思考中 then `Jev 快判中` from 916ms to 3916ms, then `Jev 180ms · $0.004` and the thought line. Replay events use kind `status`. |

`npm run test:engine` passed. `npm run build` passed. Live Redis was not run.

## Next

- Point `REDIS_URL` at a private Redis and run two processes. The client path is in place; this environment did not connect.
- Run `npm run marathon` with `TYPESAFE_API_KEY` in the environment when a real Jev latency and usage sample is needed.

## Previous

Room `ADZM7C` was the prior two-hand run, before this checklist. Hand 1 南北 头游+末游 +1 (T→J). Hand 2 东西 头游+三游 +2 (T→Q).
