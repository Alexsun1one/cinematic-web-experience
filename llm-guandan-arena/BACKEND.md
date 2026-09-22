# Backend checklist

Single Node process. Rooms and matches live in `globalThis` Maps. A restart clears them. Several instances without a sticky process will not see the same room.

## Ready

| Call | What it does |
| --- | --- |
| `POST /api/rooms` | Create a room. `{"operator":true,"operatorSeat":2}` leaves South open and seats three Mock bots. The response `operator.seatToken` is the only copy of that token. |
| `POST /api/rooms/:code/start` | Host header `x-room-host`. Starts when four seats are ready. |
| `POST /api/rooms/:code/fill-mock` | Host fills every empty seat with a heuristic bot. |
| `GET /api/rooms/:code/invite` | Host-only guest paste. Token is not on the public room JSON. |
| `POST /api/room/:code/claim-seat` | `{"seatToken","name"}`. Rejects `apiKey` / `baseUrl` / `model`. Starts the table and the bot driver when the fourth seat claims. |
| `GET /api/room/:code/state?seatToken=` | Poll. `you.yourTurn`, `you.legal[]` (`id`, `kind`, `label`), `legalMoves`, `phase`, `leaderSeat`, `currentTurn`, `mustBeat`. |
| `POST /api/room/:code/act` | `{"seatToken","moveId"}`. `moveId` must be in `you.legal`. |
| `GET /api/rooms/:code/stream` | Spectator SSE. |
| `POST /api/matches` and `POST /api/matches/:id/step` | Solo Mock match, not the operator seat. |

`npm run watch` opens the 3-bot room and prints the three curls. `npm run operator` claims as 知识 and plays six legal moves against the bots.

Bots play with the in-process heuristic. They do not call Jev or an LLM. The operator's timeout (`GUANDAN_TURN_MS`, default 8s) falls back to that same heuristic so the table does not stall.

## Not in this process

- 进贡 / 还贡 / 抗贡. `phase` is only `play` or `settle`. Invite text says so.
- Shared store (Redis) and multi-instance rooms.
- Sound, a larger felt, and a click-to-play hand are not part of this API.
