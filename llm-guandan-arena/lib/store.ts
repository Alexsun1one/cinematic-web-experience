import type { Match } from "./guandan/match";

type GlobalStore = { __guandanMatches?: Map<string, Match>; __guandanLocks?: Map<string, Promise<void>> };

function globalStore(): GlobalStore {
  return globalThis as GlobalStore;
}

export function matchStore(): Map<string, Match> {
  const g = globalStore();
  if (!g.__guandanMatches) g.__guandanMatches = new Map();
  return g.__guandanMatches;
}

export function remember(match: Match) {
  const store = matchStore();
  store.set(match.id, match);
  if (store.size > 24) {
    const oldest = [...store.values()].sort((a, b) => a.createdAt - b.createdAt)[0];
    if (oldest) store.delete(oldest.id);
  }
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
    try {
      return await fn();
    } finally {
      release();
    }
  });
}
