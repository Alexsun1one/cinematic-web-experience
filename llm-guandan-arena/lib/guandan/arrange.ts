import { isWild, powerRank } from "./cards";
import { FACE, type Card, type FaceRank, type Rank, type Suit } from "./types";

/** Vertical 理牌 roles. Bigger structures sit further left and lift higher. */
export type ColumnRole = "wild" | "jokerBomb" | "bomb" | "flush" | "plate" | "tube" | "triple" | "pair" | "single";

export interface HandColumn {
  key: string;
  cards: Card[];
  role: ColumnRole;
  lift: number;
}

const LIFT: Record<ColumnRole, number> = {
  wild: 28,
  jokerBomb: 34,
  bomb: 30,
  flush: 24,
  plate: 20,
  tube: 14,
  triple: 10,
  pair: 4,
  single: 0,
};

const SUITS: Suit[] = ["S", "H", "D", "C"];
const STACK: Record<Suit, number> = { S: 0, H: 1, C: 2, D: 3, J: 4 };

function stack(cards: Card[]): Card[] {
  return cards.slice().sort((a, b) => STACK[a.suit] - STACK[b.suit] || a.deck - b.deck);
}

function column(key: string, cards: Card[], role: ColumnRole): HandColumn {
  return { key, cards: stack(cards), role, lift: LIFT[role] };
}

/**
 * Classic Guandan vertical sort: one overlapping column per rank.
 * 逢人配, bombs, straight flushes, plates, and tubes stand on the left.
 * Pairs and singles sit on the right. No wrap (A is not next to 2).
 */
export function arrangeColumns(cards: Card[], level: FaceRank): HandColumn[] {
  const used = new Set<string>();
  const byRank = new Map<Rank, Card[]>();
  for (const card of cards) {
    if (isWild(card, level)) continue;
    const list = byRank.get(card.rank) ?? [];
    list.push(card);
    byRank.set(card.rank, list);
  }

  const free = (rank: Rank): Card[] => (byRank.get(rank) ?? []).filter((card) => !used.has(card.id));
  const claim = (group: Card[]) => group.forEach((card) => used.add(card.id));

  const columns: HandColumn[] = [];
  const wilds = cards.filter((card) => isWild(card, level));
  if (wilds.length > 0) columns.push(column(`wild-${level}`, wilds, "wild"));

  const jokers = [...free("SJ"), ...free("BJ")];
  if (jokers.length === 4) {
    claim(jokers);
    columns.push(column("joker-bomb", jokers, "jokerBomb"));
  }

  const bombs = FACE.filter((rank) => free(rank).length >= 4)
    .map((rank) => free(rank))
    .sort((a, b) => b.length - a.length || powerRank(b[0].rank, level) - powerRank(a[0].rank, level));
  for (const group of bombs) {
    claim(group);
    columns.push(column(`bomb-${group[0].rank}`, group, "bomb"));
  }

  const flushBlocks = findFlushes(free);
  flushBlocks.sort((a, b) => b.length - a.length || FACE.indexOf(b[b.length - 1]) - FACE.indexOf(a[a.length - 1]));
  for (const ranks of flushBlocks) {
    const highFirst = ranks.slice().sort((a, b) => FACE.indexOf(b) - FACE.indexOf(a));
    for (const rank of highFirst) {
      const group = free(rank);
      if (group.length === 0) continue;
      claim(group);
      columns.push(column(`flush-${rank}`, group, "flush"));
    }
  }

  for (const ranks of findPlates(free)) {
    for (const rank of ranks) {
      const group = free(rank);
      claim(group);
      columns.push(column(`plate-${rank}`, group, "plate"));
    }
  }

  for (const ranks of findTubes(free)) {
    for (const rank of ranks) {
      const group = free(rank);
      claim(group);
      columns.push(column(`tube-${rank}`, group, "tube"));
    }
  }

  const loose = [...FACE, "BJ" as const, "SJ" as const]
    .map((rank) => free(rank))
    .filter((group) => group.length > 0)
    .sort((a, b) => powerRank(b[0].rank, level) - powerRank(a[0].rank, level) || b.length - a.length);
  for (const group of loose) {
    const role: ColumnRole = group.length >= 3 ? "triple" : group.length === 2 ? "pair" : "single";
    columns.push(column(`${role}-${group[0].rank}`, group, role));
    claim(group);
  }

  return columns;
}

function findFlushes(free: (rank: Rank) => Card[]): FaceRank[][] {
  const runs: FaceRank[][] = [];
  for (const suit of SUITS) {
    const present: number[] = [];
    FACE.forEach((rank, index) => {
      if (free(rank).some((card) => card.suit === suit)) present.push(index);
    });
    let start = 0;
    while (start < present.length) {
      let end = start;
      while (end + 1 < present.length && present[end + 1] === present[end] + 1) end += 1;
      const slice = present.slice(start, end + 1);
      if (slice.length >= 5) runs.push(slice.map((index) => FACE[index]));
      start = end + 1;
    }
  }
  const claimed = new Set<FaceRank>();
  const chosen: FaceRank[][] = [];
  const ordered = runs.slice().sort((a, b) => b.length - a.length || FACE.indexOf(b[b.length - 1]) - FACE.indexOf(a[a.length - 1]));
  for (const run of ordered) {
    if (run.some((rank) => claimed.has(rank))) continue;
    run.forEach((rank) => claimed.add(rank));
    chosen.push(run);
  }
  return chosen;
}

function findPlates(free: (rank: Rank) => Card[]): FaceRank[][] {
  const taken = new Set<FaceRank>();
  const plates: FaceRank[][] = [];
  for (let index = FACE.length - 2; index >= 0; index -= 1) {
    const low = FACE[index];
    const high = FACE[index + 1];
    if (taken.has(low) || taken.has(high)) continue;
    if (free(low).length < 3 || free(high).length < 3) continue;
    taken.add(low);
    taken.add(high);
    plates.push([high, low]);
  }
  return plates;
}

function findTubes(free: (rank: Rank) => Card[]): FaceRank[][] {
  const taken = new Set<FaceRank>();
  const tubes: FaceRank[][] = [];
  for (let index = FACE.length - 3; index >= 0; index -= 1) {
    const ranks = [FACE[index + 2], FACE[index + 1], FACE[index]];
    if (ranks.some((rank) => taken.has(rank) || free(rank).length < 2)) continue;
    ranks.forEach((rank) => taken.add(rank));
    tubes.push(ranks);
  }
  return tubes;
}
