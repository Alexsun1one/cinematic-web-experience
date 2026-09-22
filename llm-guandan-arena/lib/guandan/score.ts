import { FACE, teamOf, type FaceRank, type TeamId } from "./types";

export function upgradeDelta(places: number[]): number {
  if (places.includes(2)) return 3;
  if (places.includes(3)) return 2;
  return 1;
}

/** Ceremony name for the upgrade-only rule: 双下 +3, 头游+三游 +2, 头游+末游 +1. */
export function outcomeLabel(delta: number): string {
  if (delta >= 3) return "双下";
  if (delta === 2) return "头游+三游";
  return "头游+末游";
}

export function teamPlaces(order: number[], team: TeamId): number[] {
  const places: number[] = [];
  order.forEach((seat, index) => {
    if (teamOf(seat) === team) places.push(index + 1);
  });
  return places;
}

/** Failed 打A attempts before that side drops to 2. 0 keeps them on A (competition). */
export function aceStrikeLimit(): number {
  const raw = process.env.GUANDAN_ACE_STRIKES;
  if (raw === undefined || raw.trim() === "") return 3;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 3;
  return Math.floor(n);
}

/**
 * Climb toward A. Landing on A does not win.
 * Already on A: 头游+二游 or 头游+三游 (delta >= 2) passes. 头游+末游 does not.
 */
export function bumpLevel(level: FaceRank, delta: number): { level: FaceRank; won: boolean } {
  if (level === "A") return { level: "A", won: delta >= 2 };
  const next = FACE.indexOf(level) + delta;
  if (next >= FACE.length - 1) return { level: "A", won: false };
  return { level: FACE[next], won: false };
}

export interface AceAttempt {
  level: FaceRank;
  won: boolean;
  fails: number;
  dropped: boolean;
}

/**
 * One hand for the side that took 头游.
 * Below A, the level climbs and the fail counter is unchanged.
 * On A, delta >= 2 passes and clears the counter. delta 1 stays on A and counts a fail.
 * After `limit` fails (default 3, cumulative) that side drops to 2 and the counter clears.
 * limit 0 never drops.
 */
export function applyAceAttempt(level: FaceRank, delta: number, fails: number, limit = aceStrikeLimit()): AceAttempt {
  if (level !== "A") {
    const climbed = bumpLevel(level, delta);
    return { level: climbed.level, won: false, fails, dropped: false };
  }
  if (delta >= 2) return { level: "A", won: true, fails: 0, dropped: false };
  const nextFails = fails + 1;
  if (limit > 0 && nextFails >= limit) return { level: "2", won: false, fails: 0, dropped: true };
  return { level: "A", won: false, fails: nextFails, dropped: false };
}

export function completeOrder(order: number[], lastSeat: number): number[] {
  const seen = new Set(order);
  const remaining = [0, 1, 2, 3].filter((seat) => !seen.has(seat));
  remaining.sort((a, b) => ((a - lastSeat + 4) % 4) - ((b - lastSeat + 4) % 4));
  return [...order, ...remaining];
}

export function roundIsOver(order: number[]): boolean {
  if (order.length >= 3) return true;
  if (order.length >= 2 && teamOf(order[0]) === teamOf(order[1])) return true;
  return false;
}
