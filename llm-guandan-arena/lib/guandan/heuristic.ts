import type { Move } from "./legal";

export function chooseHeuristic(moves: Move[], seat: number, lastSeat: number | null): Move {
  const pass = moves.find((move) => move.kind === "pass");
  const plays = moves.filter((move) => move.kind !== "pass");
  const finishing = plays.filter((move) => move.finishes);
  if (finishing.length > 0) {
    return (
      finishing.find((move) => move.bombTier === 0) ??
      [...finishing].sort((a, b) => a.bombTier - b.bombTier || a.rankKey - b.rankKey)[0]
    );
  }
  const partner = (seat + 2) % 4;
  if (lastSeat === partner && pass) return pass;
  if (plays.length === 0) {
    if (!pass) throw new Error("no legal moves");
    return pass;
  }
  const nonBombs = plays.filter((move) => move.bombTier === 0);
  if (lastSeat === null) {
    const grouped = nonBombs.filter((move) => move.cards.length >= 5);
    const sets = nonBombs.filter((move) => move.kind === "pair" || move.kind === "triple");
    const pool = grouped.length > 0 ? grouped : sets.length > 0 ? sets : nonBombs;
    return [...pool].sort((a, b) => a.rankKey - b.rankKey || b.cards.length - a.cards.length)[0];
  }
  const pool = nonBombs.length > 0 ? nonBombs : plays;
  return [...pool].sort((a, b) => a.rankKey - b.rankKey || a.cards.length - b.cards.length)[0];
}
