import type { AssistNote } from "../guandan/match";
import type { Move } from "../guandan/legal";
import type { PromptContext } from "./prompt";

export async function jevAdvise(ctx: PromptContext, moves: Move[]): Promise<AssistNote> {
  const apiKey = process.env.TYPESAFE_API_KEY;
  if (!apiKey) return { noul: null, choice: null, confidence: null, error: "no TYPESAFE_API_KEY" };
  const shortlist = shortlistMoves(moves).slice(0, 40);
  const criteria: Record<string, string> = {};
  for (const move of shortlist) criteria[move.id] = move.label;
  const questions: Record<string, unknown> = {
    play: {
      type: "choice",
      instructions:
        "Which legal Guandan move should this seat play? Prefer a cheap win, keep big bombs, and pass when the partner is already winning the trick.",
      criteria,
    },
  };
  if (moves.some((move) => move.kind === "pass")) {
    questions.should_pass = {
      type: "noul",
      instructions: "Should this seat pass the current trick instead of beating it?",
    };
  }
  const base = (process.env.TYPESAFE_BASE_URL || "https://api.typesafe.ai").replace(/\/+$/, "");
  try {
    const response = await fetch(`${base}/v1/systemone`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.TYPESAFE_MODEL || "jev-latest",
        state: {
          game: "guandan",
          seat: ctx.seat,
          level: ctx.level,
          handCounts: ctx.counts,
          lastPlay: ctx.lastLabel,
          finishOrder: ctx.finishOrder,
        },
        questions,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    const body = await response.text();
    if (!response.ok) {
      return { noul: null, choice: null, confidence: null, error: `jev ${response.status}` };
    }
    const parsed = JSON.parse(body) as {
      answers?: {
        play?: { choice?: string; confidence?: number };
        should_pass?: { noul?: number };
      };
    };
    const choice = parsed.answers?.play?.choice ?? null;
    const chosen = shortlist.find((move) => move.id === choice);
    return {
      noul: typeof parsed.answers?.should_pass?.noul === "number" ? parsed.answers.should_pass.noul : null,
      choice,
      confidence: typeof parsed.answers?.play?.confidence === "number" ? parsed.answers.play.confidence : null,
      choiceLabel: chosen?.label ?? null,
    };
  } catch (error) {
    return {
      noul: null,
      choice: null,
      confidence: null,
      error: error instanceof Error ? error.message : "jev failed",
    };
  }
}

function shortlistMoves(moves: Move[]): Move[] {
  const pass = moves.filter((move) => move.kind === "pass");
  const bombs = moves
    .filter((move) => move.bombTier > 0)
    .sort((a, b) => a.bombTier - b.bombTier || a.rankKey - b.rankKey)
    .slice(0, 12);
  const plain = moves
    .filter((move) => move.kind !== "pass" && move.bombTier === 0)
    .sort((a, b) => a.rankKey - b.rankKey || a.cards.length - b.cards.length);
  const merged = [...pass, ...plain, ...bombs];
  const seen = new Set<string>();
  return merged.filter((move) => {
    if (seen.has(move.id)) return false;
    seen.add(move.id);
    return true;
  });
}
