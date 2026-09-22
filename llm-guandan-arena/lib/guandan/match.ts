import type { QuickBeat } from "../llm/quick-reason";
import { createDeck, deal, shuffle, subtract } from "./cards";
import { chooseHeuristic } from "./heuristic";
import { leadAfterTrick, legalMoves, nextSeatWithCards, type Move } from "./legal";
import { bumpLevel, completeOrder, roundIsOver, teamPlaces, upgradeDelta } from "./score";
import {
  FACE,
  SEAT_WIND,
  SEAT_WIND_EN,
  isFaceRank,
  partnerOf,
  teamOf,
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

export type LogKind = "deal" | "play" | "pass" | "reject" | "finish" | "lead" | "round" | "match" | "reason";

export interface LogEvent {
  id: number;
  round: number;
  seat: number | null;
  kind: LogKind;
  zh: string;
  en: string;
  cards?: Move["cards"];
  bombTier?: number;
  source?: string;
  note?: string;
  assist?: AssistNote | null;
  trick?: number;
  reason?: QuickBeat;
}

export interface RoundSummary {
  round: number;
  level: FaceRank;
  dealer: TeamId;
  order: number[];
  winner: TeamId;
  delta: number;
  from: FaceRank;
  to: FaceRank;
  matchWon: boolean;
}

export interface Match {
  id: string;
  seed: number;
  createdAt: number;
  seats: [SeatConfig, SeatConfig, SeatConfig, SeatConfig];
  jevAssist: boolean;
  startLevel: FaceRank;
  levels: Record<TeamId, FaceRank>;
  dealer: TeamId;
  level: FaceRank;
  round: number;
  status: "playing" | "between_rounds" | "finished";
  winner: TeamId | null;
  nextLeader: number;
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
    levels: { ns: start, ew: start },
    dealer: "ns",
    level: start,
    round: 0,
    status: "playing",
    winner: null,
    nextLeader: 0,
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
  match.round += 1;
  match.level = match.levels[match.dealer];
  match.hands = deal(shuffle(createDeck(), match.seed + match.round * 997));
  match.finishOrder = [];
  match.pile = null;
  match.trickSerial = 1;
  match.trick = { currentSeat: match.nextLeader, lastPlay: null, lastSeat: null, closed: false };
  match.status = "playing";
  const leader = SEAT_WIND[match.nextLeader];
  const leaderEn = SEAT_WIND_EN[match.nextLeader];
  const team = match.dealer === "ns" ? "南北" : "东西";
  pushLog(match, {
    seat: match.nextLeader,
    kind: "deal",
    zh: `第 ${match.round} 局发牌 · 打${rankName(match.level)} · ${team}坐庄 · ${leader}先出`,
    en: `Round ${match.round} dealt · level ${rankName(match.level)} · ${match.dealer.toUpperCase()} deals · ${leaderEn} leads`,
  });
}

function rankName(level: FaceRank): string {
  return level === "T" ? "10" : level;
}

export function currentLegal(match: Match): Move[] {
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
  pushLog(match, {
    seat,
    kind: "play",
    zh: `${seatName(match, seat)} · ${played.label}`,
    en: `${seatNameEn(match, seat)} · ${played.label}`,
    trick: match.trickSerial,
    cards: played.cards,
    bombTier: played.bombTier,
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
  const from = match.levels[winner];
  const bumped = bumpLevel(from, delta);
  const dealtBy = match.dealer;
  match.levels[winner] = bumped.level;
  match.dealer = winner;
  match.nextLeader = order[0];
  const summary: RoundSummary = {
    round: match.round,
    level: match.level,
    dealer: dealtBy,
    order,
    winner,
    delta,
    from,
    to: bumped.level,
    matchWon: bumped.won,
  };
  match.rounds.push(summary);
  const names = order.map((seat, index) => `${placeName(index + 1)}${seatName(match, seat)}`).join(" ");
  const namesEn = order
    .map((seat, index) => `${placeNameEn(index + 1)} ${seatNameEn(match, seat)}`)
    .join(", ");
  const team = winner === "ns" ? "南北" : "东西";
  pushLog(match, {
    seat: null,
    kind: "round",
    zh: `本局结束 ${names} · ${team} +${delta}（${rankName(from)} → ${rankName(bumped.level)}）`,
    en: `Round over: ${namesEn}. ${winner.toUpperCase()} +${delta} (${rankName(from)} → ${rankName(bumped.level)})`,
  });
  if (bumped.won) {
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
  match.status = "between_rounds";
}

export function stepLocal(match: Match) {
  if (match.status === "finished") return;
  if (match.status === "between_rounds") {
    beginRound(match);
    return;
  }
  const seat = match.trick.currentSeat;
  const moves = currentLegal(match);
  const move = chooseHeuristic(moves, seat, match.trick.lastSeat);
  commitMove(match, move, {
    source: "mock",
    provider: "mock",
    retries: 0,
    note: "heuristic",
  });
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
