# Multi-tenant rooms

One process already runs many rooms, four agents each. Several Node processes need a shared store. That store is optional.

## Tenants

Every room has a `tenantId`. The default is `default`, so existing clients that send no tenant keep working.

Set it on create and on every later call:

- Header `x-tenant-id: acme`
- or JSON body `{"tenantId":"acme"}`

The id is lowercased. Characters other than `a-z`, `0-9`, `_`, and `-` are removed. Empty becomes `default`.

Room codes are unique inside a tenant, not globally. `AB12CD` in `acme` is a different room from `AB12CD` in `default`. A request without the header looks up `default` and will not see another tenant's room.

## Store

`RoomStore` is the only room registry.

| | When |
| --- | --- |
| `MemoryRoomStore` | `REDIS_URL` is unset. Default. One Node process. |
| `RedisRoomStore` | `REDIS_URL` is set. |

`lib/room.ts` keeps process-local pieces that cannot move: the in-memory room object and `onAct` (the turn-timer callback). A spectator heartbeat stays on the instance that holds the connection and does not rewrite the room row. Joining a room still saves the spectator list. Match documents are saved next to the room when Redis is on, and `withMatchLock` takes a Redis lock so two instances do not step the same hand.

Each save carries `rev`. The store writes the row only when the stored revision matches. A stale copy cannot replace a newer claim, seat token, or match id. Two writers that both read the same revision: one write lands as a whole row, the other is rejected. Fields are not merged. The writer gets `房间已在别处更新，请重试`.

`GUANDAN_ROOM_TTL_SEC` is a sliding lifetime in seconds. Unset means 6 hours. `0` disables expiry. Every successful room save and every match save refreshes that key. The tenant room set and the match index are not expired; a list skips a code whose row is already gone. An expired memory row is treated as missing, so a create can reuse the code.

Without Redis, a restart clears everything. With Redis, another instance can load the room and the match. This environment has not run two processes against a live Redis.

## Redis keys

| Key | Value |
| --- | --- |
| `guandan:room:{tenantId}:{CODE}` | JSON room: seats, invites, host secret, match id, chat. No `onAct`. |
| `guandan:tenant:{tenantId}:rooms` | Set of room codes for that tenant |
| `guandan:match:{matchId}` | JSON match, including level and 打A fail counts |
| `guandan:matches` | Set of match ids |
| `guandan:lock:match:{matchId}` | Short lock (`SET NX`, 8s) around a step |

`CODE` is uppercase. Treat Redis as private: the room JSON includes the host secret and seat tokens.

## Quotas

`TENANT_MAX_ROOMS` is the max number of rooms for one tenant whose status is not `finished`. Unset means no extra cap. Once a tenant has more than 40 stored rooms, the next create deletes the oldest finished room only. A lobby or a live match is not deleted to make space.

The cap is checked when the room is created. Two instances can both pass the check and go one over. It is not a cluster-wide transaction.

Create returns HTTP 429 and `该租户同时进行的房间已达上限` when the cap is hit.

## What still stays on one process

The turn driver starts on the instance that starts the match. Redis locking and match reload let another instance accept `act` and serve state. Spectator SSE connections stay on the instance that opened them.
