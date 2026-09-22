import type { QuickBeat } from "../llm/quick-reason";
import { createDeck, deal, isWild, shuffle, subtract } from "./cards";
import { chooseHeuristic } from "./heuristic";
import { opponentHasFinished, playHighlight } from "./highlight";
import {
  assignDoubleTargets,
  initialTribute,
  returnCards,
  tributeCard,
  tributeLabel,
  type TributeState,
} from "./tribute";
import { leadAfterTrick, legalMoves, nextSeatWithCards, type Move } from "./legal";
import { aceStrikeLimit, applyAceAttempt, completeOrder, outcomeLabel, roundIsOver, teamPlaces, upgradeDelta } from "./score";
import {
  FACE,
  SEAT_WIND,
  SEAT_WIND_EN,
  isFaceRank,
  partnerOf,
  teamOf,
  type Card,
  type FaceRank,
  type SeatConfig,
  type TeamId,
} from "./types";

export interface MoveMeta {
  source: "mock" | "llm" | "fallback";
  provider: string;
  note?: string;
  retries: number;
  assist?: AssistNote | null;
}

export interface AssistNote {
  noul: number | null;
  choice: string | null;
  confidence: number | null;
  choiceLabel?: string | null;
  error?: string;
}

export type LogKind = "deal" | "play" | "pass" | "reject" | "finish" | "lead" | "round" | "match" | "reason" | "tribute";

export interface LogEvent {
  id: number;
  round: number;
  seat: number | null;
  kind: LogKind;
  zh: string;
  en: string;
  cards?: Move["cards"];
  bombTier?: number;
  moveKind?: string;
  highlight?: string;
  source?: string;
  note?: string;
  assist?: AssistNote | null;
  trick?: number;
  reason?: QuickBeat;
  counts?: number[];
}

export interface RoundSummary {
  round: number;
  level: FaceRank;
  dealer: TeamId;
  order: number[];
  winner: TeamId;
  delta: number;
  outcome: string;
  from: FaceRank;
  to: FaceRank;
  nsBefore: FaceRank;
  nsAfter: FaceRank;
  ewBefore: FaceRank;
  ewAfter: FaceRank;
  matchWon: boolean;
}

export interface Match {
  id: string;
  seed: number;
  createdAt: number;
  seats: [SeatConfig, SeatConfig, SeatConfig, SeatConfig];
  jevAssist: boolean;
  startLevel: FaceRank;
  handLimit: number | null;
  levels: Record<TeamId, FaceRank>;
  /** Failed attempts to pass A. Cumulative per side, cleared on a pass or a drop to 2. */
  aceFails: Record<TeamId, number>;
  dealer: TeamId;
  level: FaceRank;
  round: number;
  status: "playing" | "between_rounds" | "tribute" | "return" | "resist" | "finished";
  winner: TeamId | null;
  nextLeader: number;
  /** Finish order of the previous hand. Consumed when the next hand is dealt. */
  previousOrder: number[] | null;
  tribute: TributeState | null;
  hands: [Move["cards"], Move["cards"], Move["cards"], Move["cards"]];
  finishOrder: number[];
  trick: {
    currentSeat: number;
    lastPlay: Move | null;
    lastSeat: number | null;
    closed: boolean;
  };
  trickSerial: number;
  pile: { seat: number; move: Move } | null;
  log: LogEvent[];
  rounds: RoundSummary[];
  seq: number;
}

export interface CreateMatchInput {
  id: string;
  seats: [SeatConfig, SeatConfig, SeatConfig, SeatConfig];
  jevAssist: boolean;
  startLevel: FaceRank;
  handLimit?: number | null;
  seed?: number;
}

function pushLog(match: Match, event: Omit<LogEvent, "id" | "round"> & { round?: number }): LogEvent {
  const entry: LogEvent = {
    ...event,
    id: match.seq,
    round: event.round ?? match.round,
  };
  match.seq += 1;
  match.log.push(entry);
  return entry;
}

export function createMatch(input: CreateMatchInput): Match {
  const start = input.startLevel;
  const match: Match = {
    id: input.id,
    seed: input.seed ?? Math.floor(Math.random() * 1_000_000_000),
    createdAt: Date.now(),
    seats: input.seats,
    jevAssist: input.jevAssist,
    startLevel: start,
    handLimit: input.handLimit ?? null,
    levels: { ns: start, ew: start },
    aceFails: { ns: 0, ew: 0 },
    dealer: "ns",
    level: start,
    round: 0,
    status: "playing",
    winner: null,
    nextLeader: 0,
    previousOrder: null,
    tribute: null,
    hands: [[], [], [], []],
    finishOrder: [],
    trick: { currentSeat: 0, lastPlay: null, lastSeat: null, closed: false },
    trickSerial: 1,
    pile: null,
    log: [],
    rounds: [],
    seq: 1,
  };
  beginRound(match);
  return match;
}

export function beginRound(match: Match) {
  const previous = match.previousOrder;
  match.previousOrder = null;
  match.round += 1;
  match.level = match.levels[match.dealer];
  match.hands = deal(shuffle(createDeck(), match.seed + match.round * 997));
  match.finishOrder = [];
  match.pile = null;
  match.tribute = null;
  match.trickSerial = 1;
  match.trick = { currentSeat: match.nextLeader, lastPlay: null, lastSeat: null, closed: false };
  const leader = SEAT_WIND[match.nextLeader];
  const leaderEn = SEAT_WIND_EN[match.nextLeader];
  const team = match.dealer === "ns" ? "南北" : "东西";
  if (previous && previous.length === 4) {
    pushLog(match, {
      seat: match.nextLeader,
      kind: "deal",
      zh: `第 ${match.round} 局发牌 · 打${rankName(match.level)} · ${team}坐庄`,
      en: `Round ${match.round} dealt · level ${rankName(match.level)} · ${match.dealer.toUpperCase()} deals`,
    });
    enterTribute(match, previous);
    return;
  }
  match.status = "playing";
  pushLog(match, {
    seat: match.nextLeader,
    kind: "deal",
    zh: `第 ${match.round} 局发牌 · 打${rankName(match.level)} · ${team}坐庄 · ${leader}先出`,
    en: `Round ${match.round} dealt · level ${rankName(match.level)} · ${match.dealer.toUpperCase()} deals · ${leaderEn} leads`,
  });
}

export function enterTribute(match: Match, order: number[]) {
  const tribute = initialTribute(order, match.hands, match.level);
  match.tribute = tribute;
  match.nextLeader = tribute.leader;
  if (tribute.mode === "resist") {
    match.status = "resist";
    match.trick.currentSeat = tribute.leader;
    pushLog(match, {
      seat: null,
      kind: "tribute",
      zh: "抗贡 · 进贡方有两张大王 · 不交换 · 头游领出",
      en: "Tribute resisted: the paying side holds both big jokers. No exchange. First-out leads.",
      highlight: "抗贡",
    });
    return;
  }
  match.status = "tribute";
  match.trick.currentSeat = tribute.queue[0];
  const who = tribute.mode === "double" ? "双下进贡" : "单下进贡";
  pushLog(match, {
    seat: tribute.queue[0],
    kind: "tribute",
    zh: `${who} · 先由 ${seatName(match, tribute.queue[0])} 进贡`,
    en: `${tribute.mode === "double" ? "Double" : "Single"} tribute · ${seatNameEn(match, tribute.queue[0])} pays first`,
    highlight: "进贡",
  });
}

export function finishResist(match: Match) {
  if (match.status !== "resist") return;
  startPlay(match, "抗贡后头游领出");
}

export function seatActions(match: Match): { id: string; kind: string; label: string }[] {
  if (match.status === "playing") {
    return currentLegal(match).map((move) => ({
      id: move.id,
      kind: move.kind,
      label: move.label,
      rankKey: move.rankKey,
      bombTier: move.bombTier,
      finishes: move.finishes,
      usesWild: move.cards.some((card) => isWild(card, match.level)),
    }));
  }
  const tribute = match.tribute;
  if (!tribute) return [];
  const seat = match.trick.currentSeat;
  if (match.status === "tribute") {
    const card = tributeCard(match.hands[seat], match.level);
    return [{ id: `t:${card.id}`, kind: "tribute", label: `进贡 ${tributeLabel(card)}` }];
  }
  if (match.status === "return") {
    return returnCards(match.hands[seat], match.level).map((card) => ({
      id: `r:${card.id}`,
      kind: "return",
      label: `还贡 ${tributeLabel(card)}`,
    }));
  }
  return [];
}

export function performSeatAction(match: Match, seat: number, actionId: string) {
  const tribute = match.tribute;
  if (!tribute || (match.status !== "tribute" && match.status !== "return")) throw new Error("现在不是贡牌");
  if (match.trick.currentSeat !== seat) throw new Error("还没轮到你");
  const action = seatActions(match).find((item) => item.id === actionId);
  if (!action) throw new Error("这张牌不能这么交");
  if (match.status === "tribute") payTribute(match, seat, actionId.slice(2));
  else giveBack(match, seat, actionId.slice(2));
}

function rankName(level: FaceRank): string {
  return level === "T" ? "10" : level;
}

export function currentLegal(match: Match): Move[] {
  if (match.status !== "playing") return [];
  const seat = match.trick.currentSeat;
  return legalMoves(match.hands[seat], match.level, match.trick.lastPlay);
}

export function commitMove(match: Match, move: Move, meta: MoveMeta) {
  if (match.status !== "playing") throw new Error("match is not accepting plays");
  const seat = match.trick.currentSeat;
  const legal = currentLegal(match);
  const allowed = legal.find((item) => item.id === move.id);
  if (!allowed) throw new Error(`illegal move ${move.id}`);
  const played = allowed;
  if (played.kind !== "pass" && match.trick.lastPlay === null && match.trick.closed) {
    match.trickSerial += 1;
    match.trick.closed = false;
  }

  if (played.kind === "pass") {
    pushLog(match, {
      seat,
      kind: "pass",
      trick: match.trickSerial,
      zh: `${seatName(match, seat)} 过牌`,
      en: `${seatNameEn(match, seat)} passes`,
      moveKind: "pass",
      source: meta.source,
      note: meta.note,
      assist: meta.assist,
    });
    const lastSeat = match.trick.lastSeat;
    if (lastSeat === null) throw new Error("cannot pass while leading");
    const counts = match.hands.map((hand) => hand.length);
    const others = counts.filter((count, index) => index !== lastSeat && count > 0).length;
    const passes = countTrailingPasses(match);
    if (passes >= others) {
      closeTrick(match, lastSeat);
      return;
    }
    const next = nextSeatWithCards(counts, seat);
    if (next === null) throw new Error("no next seat");
    match.trick.currentSeat = next;
    return;
  }

  match.hands[seat] = subtract(match.hands[seat], played.cards);
  match.trick.lastPlay = played;
  match.trick.lastSeat = seat;
  match.pile = { seat, move: played };
  const priorBomb = match.log.some((event) => event.round === match.round && (event.bombTier ?? 0) > 0);
  const highlight = playHighlight({
    kind: played.kind,
    bombTier: played.bombTier,
    seat,
    level: match.level,
    priorBomb,
    opponentFinished: opponentHasFinished(match.finishOrder, seat),
  });
  pushLog(match, {
    seat,
    kind: "play",
    zh: `${seatName(match, seat)} · ${played.label}`,
    en: `${seatNameEn(match, seat)} · ${played.label}`,
    trick: match.trickSerial,
    cards: played.cards,
    bombTier: played.bombTier,
    moveKind: played.kind,
    highlight: highlight ?? undefined,
    source: meta.source,
    note: meta.note,
    assist: meta.assist,
  });

  if (match.hands[seat].length === 0) {
    match.finishOrder.push(seat);
    const place = match.finishOrder.length;
    pushLog(match, {
      seat,
      kind: "finish",
      zh: `${seatName(match, seat)} ${placeName(place)}`,
      en: `${seatNameEn(match, seat)} finishes ${placeNameEn(place)}`,
      highlight: place === 1 ? "头游" : undefined,
      counts: match.hands.map((hand) => hand.length),
    });
    if (roundIsOver(match.finishOrder)) {
      endRound(match, seat);
      return;
    }
  }

  const counts = match.hands.map((hand) => hand.length);
  const next = nextSeatWithCards(counts, seat);
  if (next === null) {
    endRound(match, seat);
    return;
  }
  match.trick.currentSeat = next;
}

function countTrailingPasses(match: Match): number {
  let passes = 0;
  for (let index = match.log.length - 1; index >= 0; index -= 1) {
    const event = match.log[index];
    if (event.round !== match.round) break;
    if (event.kind === "reason" || event.kind === "reject") continue;
    if (event.kind !== "pass") break;
    passes += 1;
  }
  return passes;
}

export function logReason(match: Match, beat: QuickBeat): LogEvent {
  const seat = match.trick.currentSeat;
  const who = beat.source === "jev" ? "Jev 快推理" : "Mock 快推理";
  const line = beat.timedOut ? "超时跳过" : beat.lines.join(" · ");
  return pushLog(match, {
    seat,
    kind: "reason",
    trick: match.trickSerial,
    zh: `${seatName(match, seat)} · ${who} · ${line}`,
    en: `${seatNameEn(match, seat)} · ${who} · ${line}`,
    source: beat.source,
    note: beat.note ?? undefined,
    reason: beat,
  });
}

function closeTrick(match: Match, winner: number) {
  const counts = match.hands.map((hand) => hand.length);
  const leader = leadAfterTrick(counts, winner);
  const partner = partnerOf(winner);
  if (counts[winner] === 0 && leader === partner) {
    pushLog(match, {
      seat: partner,
      kind: "lead",
      zh: `${seatName(match, partner)} 接风`,
      en: `${seatNameEn(match, partner)} takes the lead`,
      highlight: "接风",
    });
  }
  match.trick = { currentSeat: leader, lastPlay: null, lastSeat: null, closed: true };
}

function endRound(match: Match, lastSeat: number) {
  const order = completeOrder(match.finishOrder, lastSeat);
  match.finishOrder = order;
  const winner = teamOf(order[0]);
  const places = teamPlaces(order, winner);
  const delta = upgradeDelta(places);
  const nsBefore = match.levels.ns;
  const ewBefore = match.levels.ew;
  const from = match.levels[winner];
  if (!match.aceFails) match.aceFails = { ns: 0, ew: 0 };
  const attempt = applyAceAttempt(from, delta, match.aceFails[winner] ?? 0);
  const dealtBy = match.dealer;
  match.levels[winner] = attempt.level;
  match.aceFails[winner] = attempt.fails;
  match.dealer = winner;
  match.nextLeader = order[0];
  const outcome = outcomeLabel(delta);
  const summary: RoundSummary = {
    round: match.round,
    level: match.level,
    dealer: dealtBy,
    order,
    winner,
    delta,
    outcome,
    from,
    to: attempt.level,
    nsBefore,
    nsAfter: match.levels.ns,
    ewBefore,
    ewAfter: match.levels.ew,
    matchWon: attempt.won,
  };
  match.rounds.push(summary);
  const names = order.map((seat, index) => `${placeName(index + 1)}${seatName(match, seat)}`).join(" ");
  const namesEn = order
    .map((seat, index) => `${placeNameEn(index + 1)} ${seatNameEn(match, seat)}`)
    .join(", ");
  const team = winner === "ns" ? "南北" : "东西";
  const strikeNote = attempt.dropped
    ? ` · 打A未过已满 ${aceStrikeLimit()} 次，退回打2`
    : from === "A" && !attempt.won
      ? ` · 打A未过，第 ${attempt.fails} 次`
      : "";
  pushLog(match, {
    seat: null,
    kind: "round",
    zh: `本局结束 ${names} · ${outcome} · ${team} +${delta}（打${rankName(from)} → 打${rankName(attempt.level)}）${strikeNote}`,
    en: `Round over: ${namesEn}. ${outcome} · ${winner.toUpperCase()} +${delta} (${rankName(from)} → ${rankName(attempt.level)})${strikeNote}`,
    highlight: attempt.won ? "打A" : delta >= 3 ? "双下" : "升级",
  });
  if (attempt.won) {
    match.status = "finished";
    match.winner = winner;
    pushLog(match, {
      seat: null,
      kind: "match",
      zh: `${team} 过 A，赢得比赛`,
      en: `${winner.toUpperCase()} passes A and wins the match`,
    });
    return;
  }
  if (match.handLimit !== null && match.round >= match.handLimit) {
    const ns = FACE.indexOf(match.levels.ns);
    const ew = FACE.indexOf(match.levels.ew);
    const seriesWinner = ns === ew ? winner : ns > ew ? "ns" : "ew";
    match.status = "finished";
    match.winner = seriesWinner;
    const lead = seriesWinner === "ns" ? "南北" : "东西";
    pushLog(match, {
      seat: null,
      kind: "match",
      zh: `打满 ${match.handLimit} 局 · ${lead} 领先`,
      en: `Series of ${match.handLimit} hands · ${seriesWinner.toUpperCase()} leads`,
    });
    return;
  }
  match.previousOrder = order;
  match.status = "between_rounds";
}

export function stepLocal(match: Match) {
  if (match.status === "finished") return;
  if (match.status === "between_rounds") {
    beginRound(match);
    return;
  }
  if (match.status === "resist") {
    finishResist(match);
    return;
  }
  if (match.status === "tribute" || match.status === "return") {
    const action = seatActions(match)[0];
    if (!action) throw new Error("没有可交的贡牌");
    performSeatAction(match, match.trick.currentSeat, action.id);
    return;
  }
  const seat = match.trick.currentSeat;
  const moves = currentLegal(match);
  const move = chooseHeuristic(moves, seat, match.trick.lastSeat, {
    counts: match.hands.map((hand) => hand.length),
    level: match.level,
  });
  commitMove(match, move, {
    source: "mock",
    provider: "mock",
    retries: 0,
    note: "heuristic",
  });
}

function payTribute(match: Match, seat: number, cardId: string) {
  const tribute = match.tribute;
  if (!tribute) throw new Error("没有贡牌");
  const payment = tribute.payments.find((item) => item.from === seat && !item.give);
  if (!payment) throw new Error("这个座位不用进贡");
  const expected = tributeCard(match.hands[seat], match.level);
  if (expected.id !== cardId) throw new Error("进贡必须是最大的非逢人配");
  payment.give = takeCard(match.hands[seat], cardId);
  pushLog(match, {
    seat,
    kind: "tribute",
    zh: `${seatName(match, seat)} 进贡 ${tributeLabel(payment.give)}`,
    en: `${seatNameEn(match, seat)} tributes ${tributeLabel(payment.give)}`,
    cards: [payment.give],
    moveKind: "tribute",
    highlight: "进贡",
  });
  if (tribute.payments.some((item) => !item.give)) {
    tribute.queue = tribute.payments.filter((item) => !item.give).map((item) => item.from);
    match.trick.currentSeat = tribute.queue[0];
    return;
  }
  if (tribute.mode === "double") assignDoubleTargets(tribute, match.level);
  for (const item of tribute.payments) {
    if (!item.give || item.to === null) throw new Error("贡牌没有接收人");
    match.hands[item.to].push(item.give);
  }
  const receivers = [tribute.leader, tribute.second].filter((to) => tribute.payments.some((item) => item.to === to));
  tribute.queue = receivers;
  match.status = "return";
  match.trick.currentSeat = receivers[0];
  pushLog(match, {
    seat: receivers[0],
    kind: "tribute",
    zh: `还贡 · ${seatName(match, receivers[0])} 还牌`,
    en: `Return tribute · ${seatNameEn(match, receivers[0])}`,
    highlight: "还贡",
  });
}

function giveBack(match: Match, seat: number, cardId: string) {
  const tribute = match.tribute;
  if (!tribute) throw new Error("没有贡牌");
  const payment = tribute.payments.find((item) => item.to === seat && !item.back);
  if (!payment || payment.from === undefined) throw new Error("这个座位不用还贡");
  const legal = returnCards(match.hands[seat], match.level);
  if (!legal.some((card) => card.id === cardId)) throw new Error("还贡须是 2–10 且不是级牌；没有则还最小的非王");
  payment.back = takeCard(match.hands[seat], cardId);
  match.hands[payment.from].push(payment.back);
  pushLog(match, {
    seat,
    kind: "tribute",
    zh: `${seatName(match, seat)} 还贡 ${tributeLabel(payment.back)} → ${seatName(match, payment.from)}`,
    en: `${seatNameEn(match, seat)} returns ${tributeLabel(payment.back)}`,
    cards: [payment.back],
    moveKind: "return",
    highlight: "还贡",
  });
  tribute.queue = tribute.payments.filter((item) => item.to !== null && !item.back).map((item) => item.to as number);
  if (tribute.queue.length > 0) {
    match.trick.currentSeat = tribute.queue[0];
    return;
  }
  startPlay(match, "进贡结束 · 头游领出");
}

function startPlay(match: Match, zh: string) {
  match.status = "playing";
  match.trick = { currentSeat: match.nextLeader, lastPlay: null, lastSeat: null, closed: false };
  pushLog(match, {
    seat: match.nextLeader,
    kind: "lead",
    zh,
    en: `${seatNameEn(match, match.nextLeader)} leads`,
  });
}

function takeCard(hand: Card[], id: string): Card {
  const index = hand.findIndex((card) => card.id === id);
  if (index < 0) throw new Error("手里没有这张牌");
  return hand.splice(index, 1)[0];
}

export function pushReject(match: Match, seat: number, detail: string) {
  pushLog(match, {
    seat,
    kind: "reject",
    zh: `${seatName(match, seat)} 出牌被拒：${detail}`,
    en: `${seatNameEn(match, seat)} move rejected: ${detail}`,
  });
}

export function seatName(match: Match, seat: number): string {
  const seatConfig = match.seats[seat];
  const short = seatConfig?.short || seatConfig?.name || SEAT_WIND[seat];
  return `${SEAT_WIND[seat]} ${short}`;
}

export function seatNameEn(match: Match, seat: number): string {
  return SEAT_WIND_EN[seat];
}

function placeName(place: number): string {
  return ["头游", "二游", "三游", "末游"][place - 1] ?? `${place}`;
}

function placeNameEn(place: number): string {
  return ["1st", "2nd", "3rd", "4th"][place - 1] ?? `${place}`;
}

export function parseStartLevel(value: unknown): FaceRank {
  if (typeof value === "string" && isFaceRank(value)) return value;
  return "2";
}

export function levelOptions(): FaceRank[] {
  return [...FACE];
}
