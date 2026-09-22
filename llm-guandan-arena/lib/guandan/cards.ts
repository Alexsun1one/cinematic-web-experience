import { FACE, type Card, type FaceRank, type Rank, type Suit } from "./types";

const SUITS: Suit[] = ["S", "H", "D", "C"];

export function createDeck(): Card[] {
  const cards: Card[] = [];
  for (const deck of [0, 1] as const) {
    for (const suit of SUITS) {
      for (const rank of FACE) {
        cards.push({ id: `${deck}${suit}${rank}`, deck, suit, rank });
      }
    }
    cards.push({ id: `${deck}JSJ`, deck, suit: "J", rank: "SJ" });
    cards.push({ id: `${deck}JBJ`, deck, suit: "J", rank: "BJ" });
  }
  return cards;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(cards: Card[], seed: number): Card[] {
  const next = cards.slice();
  const rand = mulberry32(seed);
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const swap = next[i];
    next[i] = next[j];
    next[j] = swap;
  }
  return next;
}

export function deal(cards: Card[]): [Card[], Card[], Card[], Card[]] {
  const hands: [Card[], Card[], Card[], Card[]] = [[], [], [], []];
  cards.forEach((card, index) => {
    hands[index % 4].push(card);
  });
  return hands;
}

export function isWild(card: Card, level: FaceRank): boolean {
  return card.suit === "H" && card.rank === level;
}

export function powerRank(rank: Rank, level: FaceRank): number {
  if (rank === "BJ") return 16;
  if (rank === "SJ") return 15;
  if (rank === level) return 14;
  return FACE.indexOf(rank as FaceRank);
}

export function sortCards(cards: Card[], level: FaceRank): Card[] {
  const suitOrder: Record<Suit, number> = { S: 0, H: 1, C: 2, D: 3, J: 4 };
  return cards.slice().sort((a, b) => {
    const power = powerRank(a.rank, level) - powerRank(b.rank, level);
    if (power !== 0) return power;
    const suit = suitOrder[a.suit] - suitOrder[b.suit];
    if (suit !== 0) return suit;
    return a.deck - b.deck;
  });
}

export function rankLabel(rank: Rank): string {
  if (rank === "T") return "10";
  if (rank === "SJ") return "小王";
  if (rank === "BJ") return "大王";
  return rank;
}

export function rankCompact(rank: Rank): string {
  if (rank === "T") return "10";
  if (rank === "SJ") return "小";
  if (rank === "BJ") return "大";
  return rank;
}

export function suitGlyph(suit: Suit): string {
  if (suit === "S") return "♠";
  if (suit === "H") return "♥";
  if (suit === "D") return "♦";
  if (suit === "C") return "♣";
  return "";
}

export function isRed(card: Card): boolean {
  return card.suit === "H" || card.suit === "D" || card.rank === "BJ";
}

export function cardToken(card: Card, level: FaceRank): string {
  if (card.rank === "SJ") return "SJ";
  if (card.rank === "BJ") return "BJ";
  const wild = isWild(card, level) ? "*" : "";
  return `${card.suit}${rankLabel(card.rank)}${wild}`;
}

export function subtract(hand: Card[], played: Card[]): Card[] {
  const ids = new Set(played.map((card) => card.id));
  if (ids.size !== played.length) {
    throw new Error("duplicate cards in move");
  }
  const next = hand.filter((card) => !ids.has(card.id));
  if (next.length !== hand.length - played.length) {
    throw new Error("played cards are not in hand");
  }
  return next;
}
