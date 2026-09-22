import { isWild, powerRank, sortCards } from "./cards";
import { FACE, type Card, type FaceRank, type Rank } from "./types";

const TOKEN = "(?:10|[2-9JQKA]|小王|大王)";

function tokenRank(token: string): Rank {
  if (token === "10") return "T";
  if (token === "小王") return "SJ";
  if (token === "大王") return "BJ";
  return token as FaceRank;
}

function pull(pool: Card[], level: FaceRank, rank: Rank, count: number): Card[] {
  const taken: Card[] = [];
  for (const card of pool) {
    if (taken.length >= count) break;
    if (!isWild(card, level) && card.rank === rank) taken.push(card);
  }
  for (const card of taken) pool.splice(pool.indexOf(card), 1);
  while (taken.length < count) {
    const wild = pool.find((card) => isWild(card, level));
    if (!wild) break;
    taken.push(wild);
    pool.splice(pool.indexOf(wild), 1);
  }
  return taken;
}

/** Lay a combo left-to-right the way a Guandan client does: triple then pair, straights ascending. */
export function presentCards(cards: Card[], label: string, level: FaceRank): Card[] {
  const plain = label.replace("（配）", "");
  const full = plain.match(new RegExp(`三带二\\s+(${TOKEN})带(${TOKEN})`));
  const sequence = plain.match(/((?:10|[2-9JQKA])(?:-(?:10|[2-9JQKA]))+)/);
  const groups: { rank: Rank; count: number }[] = [];
  if (full) {
    groups.push({ rank: tokenRank(full[1]), count: 3 }, { rank: tokenRank(full[2]), count: 2 });
  } else if (sequence && /顺子|同花顺|三连对|钢板/.test(plain)) {
    const each = plain.includes("三连对") ? 2 : plain.includes("钢板") ? 3 : 1;
    for (const token of sequence[1].split("-")) groups.push({ rank: tokenRank(token), count: each });
  }
  if (groups.length === 0) {
    const wilds = cards.filter((card) => isWild(card, level));
    const naturals = cards.filter((card) => !isWild(card, level));
    return [...naturals, ...wilds];
  }
  const pool = cards.slice();
  const ordered = groups.flatMap((group) => pull(pool, level, group.rank, group.count));
  return [...ordered, ...pool];
}

export function displayRank(card: Card, level: FaceRank): number {
  if (card.rank === "BJ") return 100;
  if (card.rank === "SJ") return 90;
  if (isWild(card, level)) return 80;
  if (card.rank === level) return 70;
  return powerRank(card.rank, level);
}

/** High cards on the left, the way a fanned Guandan hand is read. */
export function handOrder(cards: Card[], level: FaceRank): Card[] {
  return sortCards(cards, level).sort((a, b) => displayRank(b, level) - displayRank(a, level) || a.id.localeCompare(b.id));
}

export function handColumns(cards: Card[], level: FaceRank): { key: string; cards: Card[] }[] {
  const groups: { key: string; cards: Card[] }[] = [];
  for (const card of handOrder(cards, level)) {
    const key = isWild(card, level) ? `wild-${level}` : card.rank;
    const last = groups[groups.length - 1];
    if (last?.key === key) last.cards.push(card);
    else groups.push({ key, cards: [card] });
  }
  return groups;
}

export function rankChip(rank: string): string {
  if (rank === "T") return "10";
  return rank;
}

export const LEVEL_LADDER = FACE;
