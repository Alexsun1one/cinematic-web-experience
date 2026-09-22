# Cycle

Branch `cursor/llm-guandan-arena-6cfe`. Reviewed against the locked 打A rule and the tenant store, then run again after the fixes.

## Passed

### 打A

- 头游+二游 and 头游+三游 pass A. 头游+末游 stays on A and counts a failure for that side only.
- The count is cumulative. An intervening hand won by the other side does not clear it or add to it. Two failures, then the other side's hand, still leaves the count at 2.
- The third failure drops that side to 2 and clears the count. A successful pass also clears it.
- Climbing onto A, including 头游+三游 from K, does not end the match and does not add a failure.
- Default is 3. `GUANDAN_ACE_STRIKES=0` stays on A (four 头游+末游 hands stayed on A). That mode is not the default.
- Invite text includes 升到 A 还不算赢 and 退回 2.

### Rooms

- `MemoryRoomStore` when `REDIS_URL` is unset. `RedisRoomStore` when it is set.
- Room codes are per tenant. Header `x-tenant-id` or body `tenantId`. No header uses `default`.
- A save carries `rev` and writes only if that revision is still current, so a stale copy cannot replace a newer seat token or match id.
- Creating a room deletes only an old finished room past 40. A playing room is left in place.
- `TENANT_MAX_ROOMS` still rejects a new unfinished room at the cap.
- `MULTI_TENANT.md` has the key layout, the revision rule, and the quota.

### Audit after those fixes

- `npm run test:engine` passed.
- `npm run build` passed.
- Live protocol on the production server: invite had the 打A lines; public room JSON did not contain the seat token; a bad `moveId` during play returned 400 `非法着法，只能出 legal 列表里的 moveId`; a listed id returned 200; the wrong tenant got 404; `apiKey` on claim was rejected.
- Operator `HANDS=2` on that build, room `ADZM7C`, exit 0.
  - Hand 1: 南北 头游+末游 +1, T → J.
  - Then 进贡.
  - Hand 2: 东西 头游+三游 +2, T → Q.
  - 知识 45 plays in the log, bots 61 card plays. The public room JSON did not contain the seat token.

## Next

- This environment has no Redis server, so the Redis client path is implemented and typechecked, not exercised against a live `REDIS_URL`.
- Two instances can still both pass `TENANT_MAX_ROOMS` in the same moment. The check is not a cluster transaction.
- Spectator heartbeats stay on the instance that holds the connection. They do not rewrite the shared room row.
