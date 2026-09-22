import { isWild, powerRank, rankLabel } from "./cards";
import { FACE, teamOf, type Card, type FaceRank, type Rank } from "./types";

const SUIT_TIE: Record<Card["suit"], number> = { S: 4, H: 3, C: 2, D: 1, J: 0 };

export interface TributePayment {
  from: number;
  to: number | null;
  give: Card | null;
  back: Card | null;
}

export interface TributeState {
  mode: "single" | "double" | "resist";
  leader: number;
  second: number;
  /** 末游 of the previous hand. On a tie, this card goes to 头游. */
  last: number;
  payments: TributePayment[];
  queue: number[];
}

export function tributePlan(order: number[]): {
  mode: "single" | "double";
  leader: number;
  second: number;
  third: number;
  last: number;
  payers: number[];
} {
  const leader = order[0];
  const second = order[1];
  const third = order[2];
  const last = order[3];
  if (teamOf(leader) === teamOf(second)) {
    return { mode: "double", leader, second, third, last, payers: [last, third] };
  }
  return { mode: "single", leader, second, third, last, payers: [last] };
}

export function bothBigJokers(hands: Card[][], payers: number[]): boolean {
  let count = 0;
  for (const seat of payers) count += hands[seat].filter((card) => card.rank === "BJ").length;
  return count >= 2;
}

export function compareTribute(a: Card, b: Card, level: FaceRank): number {
  const power = powerRank(a.rank, level) - powerRank(b.rank, level);
  if (power !== 0) return power;
  const suit = SUIT_TIE[a.suit] - SUIT_TIE[b.suit];
  if (suit !== 0) return suit;
  return a.deck - b.deck;
}

/** Largest card that is not a heart level-card (逢人配). */
export function tributeCard(hand: Card[], level: FaceRank): Card {
  const ordinary = hand.filter((card) => !isWild(card, level));
  const pool = ordinary.length > 0 ? ordinary : hand;
  return pool.slice().sort((a, b) => compareTribute(b, a, level))[0];
}

export function canReturn(card: Card, level: FaceRank): boolean {
  if (card.rank === "SJ" || card.rank === "BJ") return false;
  if (card.rank === level || isWild(card, level)) return false;
  return faceIndex(card.rank) >= 0 && faceIndex(card.rank) <= FACE.indexOf("T");
}

/** Legal 还贡 cards, smallest first. If none are ≤10 and non-level, the smallest non-joker non-wild. */
export function returnCards(hand: Card[], level: FaceRank): Card[] {
  const legal = hand.filter((card) => canReturn(card, level));
  const fallback = hand.filter((card) => card.rank !== "SJ" && card.rank !== "BJ" && !isWild(card, level));
  const pool = legal.length > 0 ? legal : fallback.length > 0 ? fallback : hand;
  return pool.slice().sort((a, b) => compareTribute(a, b, level));
}

export function tributeLabel(card: Card): string {
  return rankLabel(card.rank);
}

export function initialTribute(order: number[], hands: Card[][], level: FaceRank): TributeState {
  const plan = tributePlan(order);
  if (bothBigJokers(hands, plan.payers)) {
    return {
      mode: "resist",
      leader: plan.leader,
      second: plan.second,
      last: plan.last,
      payments: plan.payers.map((from) => ({ from, to: null, give: null, back: null })),
      queue: [],
    };
  }
  if (plan.mode === "single") {
    return {
      mode: "single",
      leader: plan.leader,
      second: plan.second,
      last: plan.last,
      payments: [{ from: plan.last, to: plan.leader, give: null, back: null }],
      queue: [plan.last],
    };
  }
  return {
    mode: "double",
    leader: plan.leader,
    second: plan.second,
    last: plan.last,
    payments: plan.payers.map((from) => ({ from, to: null, give: null, back: null })),
    queue: [...plan.payers],
  };
}

export function assignDoubleTargets(state: TributeState, level: FaceRank) {
  const left = state.payments[0];
  const right = state.payments[1];
  if (!left?.give || !right?.give) throw new Error("双下进贡还没齐");
  const cmp = compareTribute(left.give, right.give, level);
  if (cmp > 0) {
    left.to = state.leader;
    right.to = state.second;
  } else if (cmp < 0) {
    right.to = state.leader;
    left.to = state.second;
  } else {
    const lastPay = state.payments.find((payment) => payment.from === state.last);
    const other = state.payments.find((payment) => payment.from !== state.last);
    if (!lastPay || !other) throw new Error("贡牌座位缺失");
    lastPay.to = state.leader;
    other.to = state.second;
  }
}

function faceIndex(rank: Rank): number {
  if (rank === "SJ" || rank === "BJ") return -1;
  return FACE.indexOf(rank);
}
