import { FACE, partnerOf, teamOf, type FaceRank, type TeamId } from "./types";
import type { Match } from "./match";

export interface SeatStats {
  seat: number;
  name: string;
  hands: number;
  teamWins: number;
  teamWinRate: number;
  firsts: number;
  firstRate: number;
  lasts: number;
  lastRate: number;
  avgFinish: number | null;
  bombs: number;
  flushes: number;
  passes: number;
  avgThinkMs: number | null;
  retries: number;
  partnerCardsLeft: number | null;
}

export interface TeamStats {
  team: TeamId;
  name: string;
  level: FaceRank;
  levelsClimbed: number;
  doubleDowns: number;
  timeToA: number | null;
  timeline: number[];
}

export interface HandLog {
  round: number;
  level: FaceRank;
  outcome: string;
  delta: number;
  winner: TeamId;
  nsBefore: FaceRank;
  nsAfter: FaceRank;
  ewBefore: FaceRank;
  ewAfter: FaceRank;
  order: number[];
}

export interface MatchStats {
  seats: SeatStats[];
  teams: TeamStats[];
  hands: HandLog[];
}

function ratio(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 1000) / 1000;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

export function matchStats(match: Match): MatchStats {
  const completed = match.rounds.length;
  const handsPlayed = match.round;
  const seats: SeatStats[] = [0, 1, 2, 3].map((seat) => {
    const team = teamOf(seat);
    const places = match.rounds
      .map((round) => round.order.indexOf(seat))
      .filter((index) => index >= 0)
      .map((index) => index + 1);
    const thinks = match.log
      .filter((event) => event.kind === "reason" && event.seat === seat && typeof event.reason?.latencyMs === "number")
      .map((event) => event.reason?.latencyMs ?? 0);
    const partnerLeft = match.log
      .filter((event) => event.kind === "finish" && event.seat === partnerOf(seat) && event.counts)
      .map((event) => event.counts?.[seat] ?? 0);
    const plays = match.log.filter((event) => event.kind === "play" && event.seat === seat);
    return {
      seat,
      name: match.seats[seat]?.name ?? `${seat}`,
      hands: handsPlayed,
      teamWins: match.rounds.filter((round) => round.winner === team).length,
      teamWinRate: ratio(match.rounds.filter((round) => round.winner === team).length, completed),
      firsts: places.filter((place) => place === 1).length,
      firstRate: ratio(places.filter((place) => place === 1).length, completed),
      lasts: places.filter((place) => place === 4).length,
      lastRate: ratio(places.filter((place) => place === 4).length, completed),
      avgFinish: average(places),
      bombs: plays.filter((event) => (event.bombTier ?? 0) > 0 && !event.zh.includes("同花顺")).length,
      flushes: plays.filter((event) => event.zh.includes("同花顺")).length,
      passes: match.log.filter((event) => event.kind === "pass" && event.seat === seat).length,
      avgThinkMs: average(thinks),
      retries: match.log.filter((event) => event.kind === "reject" && event.seat === seat).length,
      partnerCardsLeft: average(partnerLeft),
    };
  });

  const teams: TeamStats[] = (["ns", "ew"] as const).map((team) => {
    const hit = match.rounds.find((round) => (team === "ns" ? round.nsAfter : round.ewAfter) === "A");
    return {
      team,
      name: team === "ns" ? "南北" : "东西",
      level: match.levels[team],
      levelsClimbed: FACE.indexOf(match.levels[team]) - FACE.indexOf(match.startLevel),
      doubleDowns: match.rounds.filter((round) => round.winner === team && round.delta === 3).length,
      timeToA: hit ? hit.round : null,
      timeline: match.rounds.map((round) => FACE.indexOf(team === "ns" ? round.nsAfter : round.ewAfter)),
    };
  });

  return {
    seats,
    teams,
    hands: match.rounds.map((round) => ({
      round: round.round,
      level: round.level,
      outcome: round.outcome,
      delta: round.delta,
      winner: round.winner,
      nsBefore: round.nsBefore,
      nsAfter: round.nsAfter,
      ewBefore: round.ewBefore,
      ewAfter: round.ewAfter,
      order: round.order,
    })),
  };
}

function cell(value: string | number | null): string {
  if (value === null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function statsToCsv(stats: MatchStats): string {
  const lines = [
    "type,seat,name,hands,teamWinRate,firstRate,lastRate,avgFinish,bombs,flushes,passes,avgThinkMs,retries,partnerCardsLeft",
  ];
  for (const seat of stats.seats) {
    lines.push(
      [
        "seat",
        seat.seat,
        seat.name,
        seat.hands,
        seat.teamWinRate,
        seat.firstRate,
        seat.lastRate,
        seat.avgFinish,
        seat.bombs,
        seat.flushes,
        seat.passes,
        seat.avgThinkMs,
        seat.retries,
        seat.partnerCardsLeft,
      ]
        .map(cell)
        .join(","),
    );
  }
  lines.push("type,team,name,level,levelsClimbed,doubleDowns,timeToA,timeline");
  for (const team of stats.teams) {
    lines.push(
      ["team", team.team, team.name, team.level, team.levelsClimbed, team.doubleDowns, team.timeToA, team.timeline.join(" ")]
        .map(cell)
        .join(","),
    );
  }
  lines.push("type,round,level,outcome,delta,winner,nsBefore,nsAfter,ewBefore,ewAfter,order");
  for (const hand of stats.hands) {
    lines.push(
      [
        "hand",
        hand.round,
        hand.level,
        hand.outcome,
        hand.delta,
        hand.winner,
        hand.nsBefore,
        hand.nsAfter,
        hand.ewBefore,
        hand.ewAfter,
        hand.order.join(" "),
      ]
        .map(cell)
        .join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}
