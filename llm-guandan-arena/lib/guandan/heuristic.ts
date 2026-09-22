import { isWild } from "./cards";
import type { Move } from "./legal";
import type { FaceRank } from "./types";

export interface PriorityContext {
  counts?: number[];
  level?: FaceRank;
}

/**
 * Mirrors prompts/guandan-agent-system.md:
 * pass when the partner is winning; keep bombs unless blocking a short opponent or securing the round;
 * do not steal a short partner's 头游; prefer plays that do not spend a wild.
 */
export function chooseHeuristic(moves: Move[], seat: number, lastSeat: number | null, ctx: PriorityContext = {}): Move {
  const pass = moves.find((move) => move.kind === "pass");
  const plays = moves.filter((move) => move.kind !== "pass");
  const partner = (seat + 2) % 4;
  const counts = ctx.counts;
  const mine = counts?.[seat];
  const partnerCount = counts?.[partner];
  const partnerWinning = lastSeat === partner;
  const enemyShort = Boolean(counts && lastSeat !== null && lastSeat !== partner && (counts[lastSeat] ?? 99) <= 6);
  const partnerRacing = partnerCount !== undefined && partnerCount > 0 && mine !== undefined && partnerCount < mine && partnerCount <= 8;
  const partnerAlreadyOut = partnerCount === 0;

  const finishing = plays.filter((move) => move.finishes);
  const calmFinish = finishing.filter((move) => move.bombTier === 0);
  if (!partnerRacing && finishing.length > 0) {
    return lowest(calmFinish.length > 0 ? calmFinish : finishing, ctx.level, false);
  }

  if (partnerWinning && pass && calmFinish.length === 0) return pass;
  if (plays.length === 0) {
    if (!pass) throw new Error("no legal moves");
    return pass;
  }

  const allowBomb = enemyShort || partnerAlreadyOut;
  let pool = plays.filter((move) => move.bombTier === 0 && !(partnerRacing && move.finishes));
  if (pool.length === 0) pool = plays.filter((move) => move.bombTier === 0);
  if (pool.length === 0) {
    if (!allowBomb && pass) return pass;
    pool = plays;
  }

  if (lastSeat === null) {
    const shaped = pool.filter((move) => move.bombTier === 0 && move.cards.length >= 5);
    const sets = pool.filter((move) => move.kind === "pair" || move.kind === "triple" || move.kind === "fullhouse");
    const lead = shaped.length > 0 ? shaped : sets.length > 0 ? sets : pool;
    return lowest(lead, ctx.level, true);
  }
  return lowest(pool, ctx.level, false);
}

function usesWild(move: Move, level?: FaceRank): boolean {
  if (!level) return false;
  return move.cards.some((card) => isWild(card, level));
}

function lowest(moves: Move[], level: FaceRank | undefined, shedShape: boolean): Move {
  return [...moves].sort((a, b) => {
    const wild = Number(usesWild(a, level)) - Number(usesWild(b, level));
    if (wild !== 0) return wild;
    if (a.rankKey !== b.rankKey) return a.rankKey - b.rankKey;
    return shedShape ? b.cards.length - a.cards.length : a.cards.length - b.cards.length;
  })[0];
}
