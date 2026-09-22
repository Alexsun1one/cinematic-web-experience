# Codex Handoff

## Current Goal

Lobby, 打A strip, and room rail on the existing glass skin. The note is `llm-guandan-arena/CYCLE.md`.

## Changed Files

- `llm-guandan-arena/components/Lobby.tsx`, `TenantBar.tsx`, `RoomRail.tsx` — lock a tenant before the room list; filters 可入座 / 围观中 / 我开的 / 已满
- `llm-guandan-arena/components/RoomTable.tsx` — seat map: empty claim, full spectate, host actions on the host seat; rail keeps the tenant
- `llm-guandan-arena/components/AceStrip.tsx`, `Arena.tsx`, `lib/view.ts`, `lib/ace-strip.ts` — `目标 A · 本方已试 n/3` from `aceFails` and `aceStrikeLimit()`
- `llm-guandan-arena/lib/room-list.ts`, `lib/tenant-id.ts`, `lib/tenant-client.ts`

## Validation Evidence

- `npm run test:engine` passed, including filter rows and the strip label
- `npm run build` passed
- Live list for `default` hid room `43SM2N` from tenant `other-ui`
- Started match `VPX9CH` returned `aceFails` 0/0 and `aceLimit` 3; the strip rendered `目标 A · 本方已试 0/3 · 三不过 → 回 2`
- Switching from `WHGAS4` to `VPX9CH` left `guandan-tenant` as `default`

## Blockers

None for the memory store. A live Redis server was not available.

## Next Step

Point `REDIS_URL` at a private Redis and run two processes against it.
