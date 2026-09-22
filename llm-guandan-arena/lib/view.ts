import { sortCards } from "./guandan/cards";
import { currentLegal, type Match } from "./guandan/match";
import { presentCards } from "./guandan/present";
import { aceStrikeLimit } from "./guandan/score";
import { matchStats } from "./guandan/stats";
import { SEAT_WIND, SEAT_WIND_EN, teamOf } from "./guandan/types";

function trickZones(match: Match) {
  const events = match.log.filter(
    (event) => event.round === match.round && (event.kind === "play" || event.kind === "pass"),
  );
  const trick = events.reduce((max, event) => Math.max(max, event.trick ?? 0), 0);
  return [0, 1, 2, 3].map((seat) => {
    const event = [...events].reverse().find((item) => (item.trick ?? 0) === trick && item.seat === seat);
    if (!event || trick === 0) return null;
    return {
      id: event.id,
      seat,
      kind: event.kind,
      label: event.zh.split("·").slice(1).join("·").trim() || event.zh,
      bombTier: event.bombTier ?? 0,
      moveKind: event.moveKind ?? "",
      highlight: event.highlight ?? null,
      cards: event.cards ? presentCards(event.cards, event.zh, match.level) : [],
    };
  });
}

export function toView(match: Match) {
  const legalCount = match.status === "playing" ? currentLegal(match).length : 0;
  return {
    id: match.id,
    seed: match.seed,
    createdAt: match.createdAt,
    jevAssist: match.jevAssist,
    startLevel: match.startLevel,
    handLimit: match.handLimit,
    levels: match.levels,
    aceFails: match.aceFails ?? { ns: 0, ew: 0 },
    aceLimit: aceStrikeLimit(),
    dealer: match.dealer,
    level: match.level,
    round: match.round,
    status: match.status,
    winner: match.winner,
    seats: match.seats.map((seat, index) => ({
      index,
      name: seat.name,
      short: seat.short,
      wind: SEAT_WIND[index],
      windEn: SEAT_WIND_EN[index],
      team: teamOf(index),
      provider: seat.provider,
      vendor: seat.vendor,
      model: seat.model,
      cards: match.hands[index].length,
      finished: match.finishOrder.indexOf(index),
      active:
        (match.status === "playing" || match.status === "tribute" || match.status === "return") &&
        match.trick.currentSeat === index,
    })),
    hands: match.hands.map((hand) => sortCards(hand, match.level)),
    finishOrder: match.finishOrder,
    trick: {
      currentSeat: match.trick.currentSeat,
      closed: match.trick.closed,
      lastLabel: match.trick.lastPlay?.label ?? null,
      lastSeat: match.trick.lastSeat,
    },
    pile: match.pile
      ? {
          seat: match.pile.seat,
          label: match.pile.move.label,
          bombTier: match.pile.move.bombTier,
          cards: presentCards(match.pile.move.cards, match.pile.move.label, match.level),
        }
      : null,
    zones: trickZones(match),
    legalCount,
    log: match.log,
    rounds: match.rounds,
    tribute: match.tribute
      ? {
          mode: match.tribute.mode,
          leader: match.tribute.leader,
          payments: match.tribute.payments.map((payment) => ({
            from: payment.from,
            to: payment.to,
            give: payment.give,
            back: payment.back,
          })),
        }
      : null,
    stats: matchStats(match),
  };
}

export type MatchView = ReturnType<typeof toView>;
