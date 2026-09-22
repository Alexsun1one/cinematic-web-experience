import { cardToken, sortCards } from "../guandan/cards";
import type { AssistNote } from "../guandan/match";
import type { Move } from "../guandan/legal";
import { SEAT_WIND_EN, partnerOf, teamOf, type Card, type FaceRank, type TeamId } from "../guandan/types";

export interface PromptContext {
  seat: number;
  seatName: string;
  level: FaceRank;
  round: number;
  levels: Record<TeamId, FaceRank>;
  hand: Card[];
  counts: number[];
  finishOrder: number[];
  lastLabel: string | null;
  lastSeat: number | null;
  recent: string[];
}

export function buildPrompt(
  ctx: PromptContext,
  moves: Move[],
  assist: AssistNote | null,
  rejection?: string,
): string {
  const partner = partnerOf(ctx.seat);
  const hand = sortCards(ctx.hand, ctx.level)
    .map((card) => cardToken(card, ctx.level))
    .join(" ");
  const lines = [
    "You are playing Guandan (掼蛋). Reply with JSON only: {\"moveId\":\"m0\",\"note\":\"short reason\"}.",
    `You are seat ${ctx.seat} (${SEAT_WIND_EN[ctx.seat]}, ${ctx.seatName}), team ${teamOf(ctx.seat)}.`,
    `Partner is seat ${partner}. Cooperate: pass when your partner is winning the trick unless you can empty your hand.`,
    `Round ${ctx.round}. Level rank ${ctx.level}. Hearts of that rank are wild (逢人配) and cannot become jokers.`,
    `Team levels: NS ${ctx.levels.ns}, EW ${ctx.levels.ew}.`,
    `Hand counts [N,E,S,W]: ${ctx.counts.join(", ")}. Finished seats: ${ctx.finishOrder.join(", ") || "none"}.`,
    `Your hand: ${hand}`,
    ctx.lastLabel
      ? `Current trick: seat ${ctx.lastSeat} played ${ctx.lastLabel}. Beat it with a higher same pattern or a bomb, or pass.`
      : "You are leading. Any listed combo is legal. Passing is not legal.",
    `Recent plays: ${ctx.recent.slice(-8).join(" | ") || "none"}`,
  ];
  if (assist && !assist.error) {
    lines.push(
      `Jev heuristic (optional, you may ignore it): noul(pass)=${assist.noul ?? "n/a"}, choice=${assist.choice ?? "n/a"} ${assist.choiceLabel ?? ""} confidence=${assist.confidence ?? "n/a"}.`,
    );
  }
  if (rejection) {
    lines.push(`Your previous move was illegal: ${rejection}. Pick a moveId from the list.`);
  }
  lines.push("Legal moves:");
  for (const move of moves) {
    const cards = move.cards.map((card) => card.id).join(",");
    lines.push(`${move.id} ${move.label}${cards ? ` [${cards}]` : ""}`);
  }
  return lines.join("\n");
}
