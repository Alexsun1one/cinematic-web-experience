const KEY = "cosmos-visited-lessons";
const EMPTY: string[] = [];
const EVENT = "cosmos-visited";

let cachedRaw = "UNSET";
let cachedList: string[] = EMPTY;

export function getVisited(): string[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(KEY) ?? "";
  if (raw === cachedRaw) return cachedList;
  try {
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    cachedList = Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : EMPTY;
  } catch {
    cachedList = EMPTY;
  }
  cachedRaw = raw;
  return cachedList;
}

export function getVisitedServer() {
  return EMPTY;
}

export function markVisited(slug: string) {
  if (typeof window === "undefined") return;
  const next = Array.from(new Set([...getVisited(), slug]));
  const raw = JSON.stringify(next);
  window.localStorage.setItem(KEY, raw);
  cachedRaw = raw;
  cachedList = next;
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeVisited(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}
