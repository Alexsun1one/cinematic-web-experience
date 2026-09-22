import type { Match } from "./guandan/match";
import { getRedis, usesRedis } from "./redis-client";
import { matchKey, matchLockKey, matchesIndexKey } from "./room-store";

type GlobalStore = { __guandanMatches?: Map<string, Match>; __guandanLocks?: Map<string, Promise<void>> };

function globalStore(): GlobalStore {
  return globalThis as GlobalStore;
}

export function matchStore(): Map<string, Match> {
  const g = globalStore();
  if (!g.__guandanMatches) g.__guandanMatches = new Map();
  return g.__guandanMatches;
}

export async function persistMatch(match: Match): Promise<void> {
  if (!usesRedis()) return;
  const client = await getRedis();
  await client.set(matchKey(match.id), JSON.stringify(match));
  await client.sAdd(matchesIndexKey(), match.id);
}

export function remember(match: Match) {
  const store = matchStore();
  store.set(match.id, match);
  if (!usesRedis() && store.size > 24) {
    const oldest = [...store.values()].sort((a, b) => a.createdAt - b.createdAt)[0];
    if (oldest) store.delete(oldest.id);
  }
  if (usesRedis()) {
    void persistMatch(match).catch((error) => {
      console.error("match save", error instanceof Error ? error.message : error);
    });
  }
}

export async function readMatch(id: string | null | undefined): Promise<Match | null> {
  if (!id) return null;
  if (!usesRedis()) return matchStore().get(id) ?? null;
  return (await refreshMatch(id)) ?? null;
}

/** Pull a newer Redis copy onto the in-process object so act handlers keep their reference. */
export async function refreshMatch(id: string): Promise<Match | undefined> {
  const local = matchStore().get(id);
  if (!usesRedis()) return local;
  const client = await getRedis();
  const raw = await client.get(matchKey(id));
  if (!raw) return local;
  const remote = JSON.parse(raw) as Match;
  if (!local) {
    matchStore().set(id, remote);
    return remote;
  }
  if ((remote.seq ?? 0) > (local.seq ?? 0)) Object.assign(local, remote);
  return local;
}

async function acquireMatchLock(id: string): Promise<() => Promise<void>> {
  const client = await getRedis();
  const token = crypto.randomUUID();
  const key = matchLockKey(id);
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const ok = await client.set(key, token, { NX: true, PX: 8000 });
    if (ok) {
      return async () => {
        const current = await client.get(key);
        if (current === token) await client.del(key);
      };
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error("对局锁超时");
}

export function withMatchLock<T>(id: string, fn: () => Promise<T>): Promise<T> {
  const g = globalStore();
  if (!g.__guandanLocks) g.__guandanLocks = new Map();
  const prev = g.__guandanLocks.get(id) ?? Promise.resolve();
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  g.__guandanLocks.set(
    id,
    prev.then(() => gate),
  );
  return prev.then(async () => {
    let unlockRedis: (() => Promise<void>) | null = null;
    try {
      if (usesRedis()) {
        unlockRedis = await acquireMatchLock(id);
        await refreshMatch(id);
      }
      const result = await fn();
      const match = matchStore().get(id);
      if (match) await persistMatch(match);
      return result;
    } finally {
      if (unlockRedis) await unlockRedis();
      release();
    }
  });
}

export async function listStoredMatches(): Promise<Match[]> {
  if (!usesRedis()) return [...matchStore().values()];
  const client = await getRedis();
  const ids = await client.sMembers(matchesIndexKey());
  const matches: Match[] = [];
  for (const id of ids) {
    const match = await readMatch(id);
    if (match) matches.push(match);
  }
  return matches;
}
