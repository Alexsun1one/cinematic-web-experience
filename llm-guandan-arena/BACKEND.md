# Backend checklist

Without `REDIS_URL`, one Node process keeps rooms and matches in memory. A restart clears them. With `REDIS_URL`, `RedisRoomStore` shares rooms and match documents across instances. See `MULTI_TENANT.md`.

## Ready

| Call | What it does |
| --- | --- |
| `POST /api/rooms` | Create a room. Optional `tenantId` in the body or `x-tenant-id`. `{"operator":true,"operatorSeat":2}` leaves South open and seats three Mock bots. The response `operator.seatToken` is the only copy of that token. |
| `POST /api/rooms/:code/start` | Host header `x-room-host`. Starts when four seats are ready. |
| `POST /api/rooms/:code/fill-mock` | Host fills every empty seat with a heuristic bot. |
| `GET /api/rooms/:code/invite` | Host-only guest paste. Token is not on the public room JSON. |
| `POST /api/room/:code/claim-seat` | `{"seatToken","name"}`. Rejects `apiKey` / `baseUrl` / `model`. Starts the table and the bot driver when the fourth seat claims. |
| `GET /api/room/:code/state?seatToken=` | Poll. `you.yourTurn`, `you.legal[]` (`id`, `kind`, `label`), `legalMoves`, `phase`, `leaderSeat`, `currentTurn`, `mustBeat`. |
| `POST /api/room/:code/act` | `{"seatToken","moveId"}`. `moveId` must be in `you.legal`. |
| `GET /api/rooms/:code/stream` | Spectator SSE. |
| `POST /api/matches` and `POST /api/matches/:id/step` | Solo Mock match, not the operator seat. |

From the repo root, `npm --prefix llm-guandan-arena run operator` opens that room, claims 知识, and plays until `HANDS` hands are in `match.rounds` (default 1). `HANDS=3 SERIES=three` plays the short series. `ROOM_CODE` and `SEAT_TOKEN` reuse a room from `npm run watch`. `npm run watch` only prints the curls.

Bots play with the in-process heuristic. They do not call Jev or an LLM. The operator's timeout (`GUANDAN_TURN_MS`, default 8s) falls back to that same heuristic so the table does not stall. The same timeout submits the listed tribute or return card.

A bad `moveId` is rejected with 400 and the same seat is asked again. It does not change the hand. Consecutive illegal acts stay rejected; they do not kick the seat. A timeout plays one heuristic move and the seat keeps its token. `GUANDAN_KICK_AFTER` unset or `0` never switches that seat to Mock. A positive integer switches a self seat to Mock after that many consecutive timeouts, and the token still reads state. A real act clears the streak. Claiming the same token again, including mid-game, returns the same seat and does not start a second match. A token that never sat down cannot claim after the deal. Start waits until four seats are ready; a short table stays in the lobby.

`GUANDAN_ROOM_TTL_SEC` defaults to 21600. Each save refreshes the room key and the match key. `0` keeps them until something else deletes them. The 打A fail count lives on that match only. A new room starts at 0. It is per side (南北 / 东西), not per opponent. The other side winning a hand does not clear it or add to it.

`phase` is `play`, `tribute`, `return`, `resist`, or `settle`. During tribute and return, `you.legal` is the only accepted card. Resist means both big jokers are on the paying side: no exchange, then 头游 leads.

## Not in this process

- Click-to-play on the cards is not this API. Sound (mute toggle, first click unlocks) and the larger felt are in the spectator page.
- `TENANT_MAX_ROOMS` is checked when a room is created. Two instances can race past it by one.
