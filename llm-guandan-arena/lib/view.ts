import { sortCards } from "./guandan/cards";
import { currentLegal, type Match } from "./guandan/match";
import { SEAT_WIND, SEAT_WIND_EN, teamOf } from "./guandan/types";

export function toView(match: Match) {
  const legalCount = match.status === "playing" ? currentLegal(match).length : 0;
  return {
    id: match.id,
    seed: match.seed,
    createdAt: match.createdAt,
    jevAssist: match.jevAssist,
    startLevel: match.startLevel,
    levels: match.levels,
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
      active: match.status === "playing" && match.trick.currentSeat === index,
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
          cards: match.pile.move.cards,
        }
      : null,
    legalCount,
    log: match.log,
    rounds: match.rounds,
  };
}

export type MatchView = ReturnType<typeof toView>;
