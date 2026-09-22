/**
 * Fallback picker. Same priorities as lib/guandan/heuristic.ts and prompts/guandan-agent-system.md.
 * Tribute and return stay on the engine's ordered you.legal list (smallest return first).
 */
export function priorityPick(state) {
  const legal = state.you?.legal || state.legalMoves || [];
  if (legal.length === 0) return null;
  if (state.phase === "tribute" || state.phase === "return") {
    return legal.find((move) => move.kind === "tribute" || move.kind === "return") || legal[0];
  }
  const seat = state.you?.seat ?? 0;
  const partner = (seat + 2) % 4;
  const lastSeat = state.mustBeat?.seat ?? state.you?.mustBeat?.seat ?? null;
  const counts = (state.match?.seats || []).map((item) => item.cards);
  const mine = counts[seat];
  const partnerCount = counts[partner];
  const pass = legal.find((move) => move.kind === "pass");
  const plays = legal.filter((move) => move.kind !== "pass");
  const partnerWinning = lastSeat === partner;
  const enemyShort = lastSeat !== null && lastSeat !== partner && (counts[lastSeat] ?? 99) <= 6;
  const partnerRacing = partnerCount > 0 && mine !== undefined && partnerCount < mine && partnerCount <= 8;
  const partnerAlreadyOut = partnerCount === 0;
  const finishing = plays.filter((move) => move.finishes);
  const calmFinish = finishing.filter((move) => !move.bombTier);
  if (!partnerRacing && finishing.length > 0 && hasRank(finishing)) {
    return lowest(calmFinish.length > 0 ? calmFinish : finishing, false);
  }
  if (partnerWinning && pass) return pass;
  if (plays.length === 0) return pass || null;
  const allowBomb = enemyShort || partnerAlreadyOut;
  let pool = plays.filter((move) => !move.bombTier && !(partnerRacing && move.finishes));
  if (pool.length === 0) pool = plays.filter((move) => !move.bombTier);
  if (pool.length === 0) {
    if (!allowBomb && pass) return pass;
    pool = plays;
  }
  if (!hasRank(pool)) return pool.find((move) => !move.bombTier) || pass || pool[0];
  if (lastSeat === null) {
    const shaped = pool.filter((move) => !move.bombTier && (move.kind === "straight" || move.kind === "tube" || move.kind === "plate" || move.kind === "fullhouse"));
    const sets = pool.filter((move) => move.kind === "pair" || move.kind === "triple" || move.kind === "fullhouse");
    return lowest(shaped.length > 0 ? shaped : sets.length > 0 ? sets : pool, true);
  }
  return lowest(pool, false);
}

function hasRank(moves) {
  return moves.some((move) => typeof move.rankKey === "number");
}

function lowest(moves, shedShape) {
  return [...moves].sort((a, b) => {
    const wild = Number(Boolean(a.usesWild)) - Number(Boolean(b.usesWild));
    if (wild !== 0) return wild;
    const rank = (a.rankKey ?? 0) - (b.rankKey ?? 0);
    if (rank !== 0) return rank;
    const size = (b.cards?.length || 0) - (a.cards?.length || 0);
    return shedShape ? size : -size;
  })[0];
}
