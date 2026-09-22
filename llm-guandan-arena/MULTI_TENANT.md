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

`lib/room.ts` keeps process-local pieces that cannot move: the in-memory room object and `onAct` (the turn-timer callback). Spectators are saved with the room. Match documents are saved next to the room when Redis is on, and `withMatchLock` takes a Redis lock so two instances do not step the same hand.

Without Redis, a restart clears everything. With Redis, another instance can load the room and the match.

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

`TENANT_MAX_ROOMS` is the max number of rooms for one tenant whose status is not `finished`. Unset means no extra cap. The memory store also drops the oldest room in a tenant once that tenant has more than 40 rooms.

The cap is checked when the room is created. Two instances can both pass the check and go one over. It is not a cluster-wide transaction.

Create returns HTTP 429 and `该租户同时进行的房间已达上限` when the cap is hit.

## What still stays on one process

The turn driver starts on the instance that starts the match. Redis locking and match reload let another instance accept `act` and serve state. Spectator SSE connections stay on the instance that opened them.
