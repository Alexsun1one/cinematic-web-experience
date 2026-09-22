import { getRedis, usesRedis } from "./redis-client";

export const DEFAULT_TENANT = "default";

/** Plain room row. Callers may store extra JSON fields; the store keeps the object it is given. */
export interface RoomSnapshot {
  tenantId: string;
  code: string;
  status: string;
  createdAt: number;
  updatedAt: number;
  /** Incremented on each successful save. Missing means 0. */
  rev?: number;
}

export interface RoomStore {
  get(tenantId: string, code: string): Promise<RoomSnapshot | null>;
  put(record: RoomSnapshot): Promise<void>;
  /** Write only when the stored rev equals expectedRev. Missing row matches expectedRev 0. */
  compareAndSet(record: RoomSnapshot, expectedRev: number): Promise<boolean>;
  delete(tenantId: string, code: string): Promise<void>;
  list(tenantId: string): Promise<RoomSnapshot[]>;
  countOpen(tenantId: string): Promise<number>;
}

export function normalizeTenant(raw: string | null | undefined): string {
  const cleaned = (raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 64);
  return cleaned || DEFAULT_TENANT;
}

export function tenantFromRequest(request: Request, body?: { tenantId?: unknown } | null): string {
  const hinted = body && typeof body.tenantId === "string" ? body.tenantId : null;
  return normalizeTenant(hinted || request.headers.get("x-tenant-id"));
}

export function roomKey(tenantId: string, code: string): string {
  return `guandan:room:${normalizeTenant(tenantId)}:${code.toUpperCase()}`;
}

export function tenantRoomsKey(tenantId: string): string {
  return `guandan:tenant:${normalizeTenant(tenantId)}:rooms`;
}

export function matchKey(id: string): string {
  return `guandan:match:${id}`;
}

export function matchLockKey(id: string): string {
  return `guandan:lock:match:${id}`;
}

export function matchesIndexKey(): string {
  return "guandan:matches";
}

export class TenantRoomLimitError extends Error {
  readonly status = 429;
  constructor() {
    super("该租户同时进行的房间已达上限");
    this.name = "TenantRoomLimitError";
  }
}

/** Concurrent non-finished rooms per tenant. Unset means no extra cap. */
export function tenantMaxRooms(): number | null {
  const raw = process.env.TENANT_MAX_ROOMS;
  if (raw === undefined || raw.trim() === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.floor(n);
}

type MemoryGlobal = { __guandanRoomRecords?: Map<string, RoomSnapshot> };

function memoryRecords(): Map<string, RoomSnapshot> {
  const g = globalThis as MemoryGlobal;
  if (!g.__guandanRoomRecords) g.__guandanRoomRecords = new Map();
  return g.__guandanRoomRecords;
}

export class MemoryRoomStore implements RoomStore {
  async get(tenantId: string, code: string): Promise<RoomSnapshot | null> {
    return memoryRecords().get(roomKey(tenantId, code)) ?? null;
  }

  async put(record: RoomSnapshot): Promise<void> {
    const tenantId = normalizeTenant(record.tenantId);
    const code = record.code.toUpperCase();
    const stored = { ...record, tenantId, code };
    memoryRecords().set(roomKey(tenantId, code), stored);
  }

  async compareAndSet(record: RoomSnapshot, expectedRev: number): Promise<boolean> {
    const tenantId = normalizeTenant(record.tenantId);
    const code = record.code.toUpperCase();
    const key = roomKey(tenantId, code);
    const current = memoryRecords().get(key);
    const rev = current?.rev ?? 0;
    if (current ? rev !== expectedRev : expectedRev !== 0) return false;
    memoryRecords().set(key, { ...record, tenantId, code });
    return true;
  }

  async delete(tenantId: string, code: string): Promise<void> {
    memoryRecords().delete(roomKey(tenantId, code));
  }

  async list(tenantId: string): Promise<RoomSnapshot[]> {
    const prefix = `guandan:room:${normalizeTenant(tenantId)}:`;
    const rows: RoomSnapshot[] = [];
    for (const [key, value] of memoryRecords()) {
      if (key.startsWith(prefix)) rows.push(value);
    }
    return rows;
  }

  async countOpen(tenantId: string): Promise<number> {
    const rows = await this.list(tenantId);
    return rows.filter((row) => row.status !== "finished").length;
  }
}

export class RedisRoomStore implements RoomStore {
  async get(tenantId: string, code: string): Promise<RoomSnapshot | null> {
    const client = await getRedis();
    const raw = await client.get(roomKey(tenantId, code));
    if (!raw) return null;
    return JSON.parse(raw) as RoomSnapshot;
  }

  async put(record: RoomSnapshot): Promise<void> {
    const client = await getRedis();
    const tenantId = normalizeTenant(record.tenantId);
    const code = record.code.toUpperCase();
    const stored = { ...record, tenantId, code };
    await client.set(roomKey(tenantId, code), JSON.stringify(stored));
    await client.sAdd(tenantRoomsKey(tenantId), code);
  }

  async compareAndSet(record: RoomSnapshot, expectedRev: number): Promise<boolean> {
    const client = await getRedis();
    const tenantId = normalizeTenant(record.tenantId);
    const code = record.code.toUpperCase();
    const stored = { ...record, tenantId, code };
    const written = await client.eval(ROOM_CAS_LUA, {
      keys: [roomKey(tenantId, code), tenantRoomsKey(tenantId)],
      arguments: [JSON.stringify(stored), String(expectedRev), code],
    });
    return Number(written) === 1;
  }

  async delete(tenantId: string, code: string): Promise<void> {
    const client = await getRedis();
    const upper = code.toUpperCase();
    await client.del(roomKey(tenantId, upper));
    await client.sRem(tenantRoomsKey(tenantId), upper);
  }

  async list(tenantId: string): Promise<RoomSnapshot[]> {
    const client = await getRedis();
    const codes = await client.sMembers(tenantRoomsKey(tenantId));
    const rows: RoomSnapshot[] = [];
    for (const code of codes) {
      const raw = await client.get(roomKey(tenantId, code));
      if (!raw) {
        await client.sRem(tenantRoomsKey(tenantId), code);
        continue;
      }
      rows.push(JSON.parse(raw) as RoomSnapshot);
    }
    return rows;
  }

  async countOpen(tenantId: string): Promise<number> {
    const rows = await this.list(tenantId);
    return rows.filter((row) => row.status !== "finished").length;
  }
}

const ROOM_CAS_LUA = `
local raw = redis.call('GET', KEYS[1])
local expected = tonumber(ARGV[2])
if raw then
  local ok, decoded = pcall(cjson.decode, raw)
  local rev = 0
  if ok and type(decoded) == 'table' and decoded.rev then
    rev = tonumber(decoded.rev) or 0
  end
  if rev ~= expected then return 0 end
elseif expected ~= 0 then
  return 0
end
redis.call('SET', KEYS[1], ARGV[1])
redis.call('SADD', KEYS[2], ARGV[3])
return 1
`;

const memoryStore = new MemoryRoomStore();
let redisStore: RedisRoomStore | null = null;

export function roomStore(): RoomStore {
  if (usesRedis()) {
    if (!redisStore) redisStore = new RedisRoomStore();
    return redisStore;
  }
  return memoryStore;
}
