import { isWild, powerRank, rankLabel, sortCards, suitGlyph } from "./cards";
import { FACE, type Card, type FaceRank, type Rank, type Suit } from "./types";

export type MoveKind =
  | "pass"
  | "single"
  | "pair"
  | "triple"
  | "fullhouse"
  | "straight"
  | "tube"
  | "plate"
  | "bomb4"
  | "bomb5"
  | "bomb6"
  | "bomb7"
  | "bomb8"
  | "straightFlush"
  | "jokerBomb";

export interface Move {
  id: string;
  kind: MoveKind;
  cards: Card[];
  label: string;
  rankKey: number;
  bombTier: number;
  finishes: boolean;
}

const BOMB_TIER: Partial<Record<MoveKind, number>> = {
  bomb4: 1,
  bomb5: 2,
  straightFlush: 3,
  bomb6: 4,
  bomb7: 5,
  bomb8: 6,
  jokerBomb: 7,
};

const KIND_ORDER: MoveKind[] = [
  "pass",
  "single",
  "pair",
  "triple",
  "fullhouse",
  "straight",
  "tube",
  "plate",
  "bomb4",
  "bomb5",
  "straightFlush",
  "bomb6",
  "bomb7",
  "bomb8",
  "jokerBomb",
];

interface Draft {
  kind: MoveKind;
  cards: Card[];
  label: string;
  rankKey: number;
}

export function bombTierOf(kind: MoveKind): number {
  return BOMB_TIER[kind] ?? 0;
}

export function beats(next: Move, prev: Move): boolean {
  if (next.kind === "pass" || prev.kind === "pass") return false;
  if (next.bombTier > 0 || prev.bombTier > 0) {
    if (next.bombTier !== prev.bombTier) return next.bombTier > prev.bombTier;
    return next.rankKey > prev.rankKey;
  }
  if (next.kind !== prev.kind) return false;
  return next.rankKey > prev.rankKey;
}

function split(hand: Card[], level: FaceRank) {
  const wilds: Card[] = [];
  const byRank = new Map<Rank, Card[]>();
  for (const card of sortCards(hand, level)) {
    if (isWild(card, level)) {
      wilds.push(card);
      continue;
    }
    const list = byRank.get(card.rank) ?? [];
    list.push(card);
    byRank.set(card.rank, list);
  }
  return { wilds, byRank };
}

function allocate(needs: { have: Card[]; want: number }[], wilds: Card[]): Card[] | null {
  const chosen: Card[] = [];
  let wildIndex = 0;
  for (const need of needs) {
    const take = Math.min(need.have.length, need.want);
    const missing = need.want - take;
    if (wildIndex + missing > wilds.length) return null;
    chosen.push(...need.have.slice(0, take), ...wilds.slice(wildIndex, wildIndex + missing));
    wildIndex += missing;
  }
  return chosen;
}

function usesWild(cards: Card[], level: FaceRank): boolean {
  return cards.some((card) => isWild(card, level));
}

function markWild(label: string, cards: Card[], level: FaceRank): string {
  return usesWild(cards, level) ? `${label}（配）` : label;
}

function faceWindows(length: number): FaceRank[][] {
  const windows: FaceRank[][] = [];
  for (let index = 0; index <= FACE.length - length; index += 1) {
    windows.push(FACE.slice(index, index + length));
  }
  return windows;
}

function seqLabel(ranks: readonly FaceRank[]): string {
  return ranks.map((rank) => rankLabel(rank)).join("-");
}

function pickStraight(window: FaceRank[], byRank: Map<Rank, Card[]>, wilds: Card[]): Card[] | null {
  const pools = window.map((rank) => byRank.get(rank) ?? []);
  const missing = pools.filter((pool) => pool.length === 0).length;
  if (missing > wilds.length) return null;
  const chosen: Card[] = [];
  let wildIndex = 0;
  for (const pool of pools) {
    if (pool.length === 0) {
      chosen.push(wilds[wildIndex]);
      wildIndex += 1;
      continue;
    }
    chosen.push(pool[0]);
  }
  const natural = chosen.filter((card) => !wilds.includes(card));
  const suits = new Set(natural.map((card) => card.suit));
  if (suits.size > 1) return chosen;
  for (let index = 0; index < pools.length; index += 1) {
    const alt = pools[index].find((card) => !natural[0] || card.suit !== natural[0].suit);
    if (alt && !wilds.includes(chosen[index])) {
      const next = chosen.slice();
      next[index] = alt;
      return next;
    }
  }
  return null;
}

function pickStraightFlush(
  window: FaceRank[],
  suit: Suit,
  byRank: Map<Rank, Card[]>,
  wilds: Card[],
): Card[] | null {
  const chosen: Card[] = [];
  let wildIndex = 0;
  for (const rank of window) {
    const natural = (byRank.get(rank) ?? []).find((card) => card.suit === suit);
    if (natural) {
      chosen.push(natural);
      continue;
    }
    if (wildIndex >= wilds.length) return null;
    chosen.push(wilds[wildIndex]);
    wildIndex += 1;
  }
  return chosen;
}

function fingerprint(cards: Card[]): string {
  return cards
    .map((card) => card.id)
    .sort()
    .join(".");
}

export function legalMoves(hand: Card[], level: FaceRank, current: Move | null): Move[] {
  const { wilds, byRank } = split(hand, level);
  const drafts: Draft[] = [];

  const push = (draft: Draft) => {
    if (draft.cards.length === 0) return;
    const key = `${draft.kind}:${fingerprint(draft.cards)}`;
    const existing = drafts.findIndex((item) => `${item.kind}:${fingerprint(item.cards)}` === key);
    if (existing >= 0) {
      if (draft.rankKey > drafts[existing].rankKey) drafts[existing] = draft;
      return;
    }
    drafts.push(draft);
  };

  const ranks = [...FACE, "SJ", "BJ"] as Rank[];
  for (const rank of ranks) {
    const have = byRank.get(rank) ?? [];
    if (have.length > 0) {
      push({
        kind: "single",
        cards: [have[0]],
        label: `单张 ${rankLabel(rank)}`,
        rankKey: powerRank(rank, level),
      });
    }
    if (have.length >= 2) {
      push({
        kind: "pair",
        cards: have.slice(0, 2),
        label: `对子 ${rankLabel(rank)}`,
        rankKey: powerRank(rank, level),
      });
    } else if (have.length === 1 && wilds.length >= 1 && rank !== "SJ" && rank !== "BJ") {
      const cards = [have[0], wilds[0]];
      push({
        kind: "pair",
        cards,
        label: markWild(`对子 ${rankLabel(rank)}`, cards, level),
        rankKey: powerRank(rank, level),
      });
    }
    if ((rank as string) !== "SJ" && (rank as string) !== "BJ") {
      if (have.length >= 3) {
        push({
          kind: "triple",
          cards: have.slice(0, 3),
          label: `三张 ${rankLabel(rank)}`,
          rankKey: powerRank(rank, level),
        });
      } else if (have.length >= 1 && have.length + wilds.length >= 3) {
        const cards = allocate([{ have, want: 3 }], wilds);
        if (cards) {
          push({
            kind: "triple",
            cards,
            label: markWild(`三张 ${rankLabel(rank)}`, cards, level),
            rankKey: powerRank(rank, level),
          });
        }
      }
    }
  }

  if (wilds.length > 0 && (byRank.get(level)?.length ?? 0) === 0) {
    push({
      kind: "single",
      cards: [wilds[0]],
      label: "单张 逢人配",
      rankKey: powerRank(level, level),
    });
  } else if (wilds.length > 0) {
    push({
      kind: "single",
      cards: [wilds[0]],
      label: "单张 逢人配",
      rankKey: powerRank(level, level),
    });
  }

  if ((byRank.get(level)?.length ?? 0) === 0 && wilds.length >= 2) {
    push({
      kind: "pair",
      cards: wilds.slice(0, 2),
      label: "对子 逢人配",
      rankKey: powerRank(level, level),
    });
  }

  for (const triple of FACE) {
    const tripleHave = byRank.get(triple) ?? [];
    if (tripleHave.length === 0) continue;
    let best: { cards: Card[]; pair: Rank; wildCost: number; power: number } | null = null;
    for (const pair of ranks) {
      if (pair === triple) continue;
      const pairHave = byRank.get(pair) ?? [];
      if (pairHave.length === 0) continue;
      const wildCost = Math.max(0, 3 - tripleHave.length) + Math.max(0, 2 - pairHave.length);
      if (wildCost > wilds.length) continue;
      const cards = allocate(
        [
          { have: tripleHave, want: 3 },
          { have: pairHave, want: 2 },
        ],
        wilds,
      );
      if (!cards) continue;
      const power = powerRank(pair, level);
      if (
        !best ||
        wildCost < best.wildCost ||
        (wildCost === best.wildCost && power < best.power)
      ) {
        best = { cards, pair, wildCost, power };
      }
    }
    if (best) {
      push({
        kind: "fullhouse",
        cards: best.cards,
        label: markWild(`三带二 ${rankLabel(triple)}带${rankLabel(best.pair)}`, best.cards, level),
        rankKey: powerRank(triple, level),
      });
    }
  }

  for (const window of faceWindows(5)) {
    const straight = pickStraight(window, byRank, wilds);
    if (straight) {
      push({
        kind: "straight",
        cards: straight,
        label: markWild(`顺子 ${seqLabel(window)}`, straight, level),
        rankKey: FACE.indexOf(window[4]),
      });
    }
    for (const suit of ["S", "H", "D", "C"] as const) {
      const flush = pickStraightFlush(window, suit, byRank, wilds);
      if (!flush) continue;
      push({
        kind: "straightFlush",
        cards: flush,
        label: markWild(`同花顺 ${suitGlyph(suit)} ${seqLabel(window)}`, flush, level),
        rankKey: FACE.indexOf(window[4]),
      });
    }
  }

  for (const window of faceWindows(3)) {
    const cards = allocate(
      window.map((rank) => ({ have: byRank.get(rank) ?? [], want: 2 })),
      wilds,
    );
    if (!cards) continue;
    if (window.every((rank) => (byRank.get(rank) ?? []).length === 0)) continue;
    push({
      kind: "tube",
      cards,
      label: markWild(`三连对 ${seqLabel(window)}`, cards, level),
      rankKey: FACE.indexOf(window[2]),
    });
  }

  for (const window of faceWindows(2)) {
    const cards = allocate(
      window.map((rank) => ({ have: byRank.get(rank) ?? [], want: 3 })),
      wilds,
    );
    if (!cards) continue;
    if (window.every((rank) => (byRank.get(rank) ?? []).length === 0)) continue;
    push({
      kind: "plate",
      cards,
      label: markWild(`钢板 ${seqLabel(window)}`, cards, level),
      rankKey: FACE.indexOf(window[1]),
    });
  }

  for (const rank of FACE) {
    const have = byRank.get(rank) ?? [];
    if (have.length === 0) continue;
    for (let size = 4; size <= 8; size += 1) {
      if (have.length + wilds.length < size) continue;
      const cards = allocate([{ have, want: size }], wilds);
      if (!cards) continue;
      const kind = `bomb${size}` as MoveKind;
      push({
        kind,
        cards,
        label: markWild(`${size}炸 ${rankLabel(rank)}`, cards, level),
        rankKey: powerRank(rank, level),
      });
    }
  }

  const small = byRank.get("SJ") ?? [];
  const big = byRank.get("BJ") ?? [];
  if (small.length === 2 && big.length === 2) {
    push({
      kind: "jokerBomb",
      cards: [...small, ...big],
      label: "天王炸",
      rankKey: 100,
    });
  }

  if (drafts.length === 0 && hand.length > 0) {
    for (const card of sortCards(hand, level)) {
      push({
        kind: "single",
        cards: [card],
        label: `单张 ${rankLabel(card.rank)}`,
        rankKey: powerRank(card.rank, level),
      });
    }
  }

  const plays: Move[] = drafts
    .map((draft) => ({
      ...draft,
      id: "",
      bombTier: bombTierOf(draft.kind),
      finishes: draft.cards.length === hand.length,
    }))
    .sort((a, b) => {
      const kind = KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind);
      if (kind !== 0) return kind;
      if (a.rankKey !== b.rankKey) return a.rankKey - b.rankKey;
      return fingerprint(a.cards).localeCompare(fingerprint(b.cards));
    });

  const usable = current ? plays.filter((move) => beats(move, current)) : plays;
  const withPass = current
    ? [
        {
          id: "",
          kind: "pass" as const,
          cards: [],
          label: "过牌",
          rankKey: -1,
          bombTier: 0,
          finishes: false,
        },
        ...usable,
      ]
    : usable;

  return withPass.map((move, index) => ({ ...move, id: `m${index}` }));
}

export function leadAfterTrick(counts: number[], winner: number): number {
  if (counts[winner] > 0) return winner;
  const partner = (winner + 2) % 4;
  if (counts[partner] > 0) return partner;
  for (let step = 1; step <= 3; step += 1) {
    const seat = (winner + step) % 4;
    if (counts[seat] > 0) return seat;
  }
  return winner;
}

export function nextSeatWithCards(counts: number[], from: number): number | null {
  for (let step = 1; step <= 3; step += 1) {
    const seat = (from + step) % 4;
    if (counts[seat] > 0) return seat;
  }
  return null;
}
