import { chooseHeuristic } from "../guandan/heuristic";
import { seatName, type AssistNote, type Match, type MoveMeta } from "../guandan/match";
import type { Move } from "../guandan/legal";
import { parseMoveId } from "./parse";
import { buildPrompt, type PromptContext } from "./prompt";
import { completeVendor } from "./providers";
import { jevAdvise } from "./typesafe";

export interface Decision {
  move: Move;
  meta: MoveMeta;
  rejected: string[];
}

export async function decide(match: Match, moves: Move[]): Promise<Decision> {
  const seat = match.trick.currentSeat;
  const config = match.seats[seat];
  const heuristic = chooseHeuristic(moves, seat, match.trick.lastSeat);
  if (config.provider === "mock") {
    return {
      move: heuristic,
      rejected: [],
      meta: { source: "mock", provider: "mock", retries: 0, note: "mock legal-move player", assist: null },
    };
  }

  let assist: AssistNote | null = null;
  if (match.jevAssist) assist = await jevAdvise(contextOf(match), moves);

  const rejected: string[] = [];
  try {
    const first = await ask(config.provider, config.model, contextOf(match), moves, assist);
    const firstMove = moves.find((move) => move.id === first.moveId);
    if (firstMove) {
      return {
        move: firstMove,
        rejected,
        meta: { source: "llm", provider: config.provider, retries: 0, note: trim(first.note), assist },
      };
    }
    rejected.push(first.moveId ? `${first.moveId} 不在合法列表` : "没有返回 moveId");
    const second = await ask(
      config.provider,
      config.model,
      contextOf(match),
      moves,
      assist,
      rejected[0],
    );
    const secondMove = moves.find((move) => move.id === second.moveId);
    if (secondMove) {
      return {
        move: secondMove,
        rejected,
        meta: { source: "llm", provider: config.provider, retries: 1, note: trim(second.note), assist },
      };
    }
    rejected.push(second.moveId ? `${second.moveId} 仍然非法` : "重试没有返回 moveId");
  } catch (error) {
    rejected.push(error instanceof Error ? error.message : "provider error");
  }

  return {
    move: heuristic,
    rejected,
    meta: {
      source: "fallback",
      provider: config.provider,
      retries: 1,
      note: "heuristic fallback",
      assist,
    },
  };
}

async function ask(
  provider: Match["seats"][number]["provider"],
  model: string,
  ctx: PromptContext,
  moves: Move[],
  assist: AssistNote | null,
  rejection?: string,
) {
  if (provider === "mock") return { moveId: undefined, note: "mock" };
  const text = await completeVendor(provider, model, buildPrompt(ctx, moves, assist, rejection));
  return parseMoveId(text);
}

function contextOf(match: Match): PromptContext {
  const seat = match.trick.currentSeat;
  return {
    seat,
    seatName: seatName(match, seat),
    level: match.level,
    round: match.round,
    levels: match.levels,
    hand: match.hands[seat],
    counts: match.hands.map((hand) => hand.length),
    finishOrder: match.finishOrder,
    lastLabel: match.trick.lastPlay?.label ?? null,
    lastSeat: match.trick.lastSeat,
    recent: match.log.filter((event) => event.kind === "play" || event.kind === "pass").slice(-8).map((event) => event.zh),
  };
}

function trim(note?: string): string | undefined {
  if (!note) return undefined;
  return note.replace(/\s+/g, " ").slice(0, 80);
}
