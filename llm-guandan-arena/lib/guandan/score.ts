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

/** Reaching or passing A wins. Winning while already on A also wins. */
export function bumpLevel(level: FaceRank, delta: number): { level: FaceRank; won: boolean } {
  if (level === "A") return { level: "A", won: true };
  const next = FACE.indexOf(level) + delta;
  if (next >= FACE.length - 1) return { level: "A", won: true };
  return { level: FACE[next], won: false };
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
