import type { Match } from "../guandan/match";
import type { Move } from "../guandan/legal";

export interface ReasonQuestion {
  id: string;
  type: "noul" | "choice";
  prompt: string;
  answer: string;
}

export interface QuickBeat {
  source: "jev" | "mock";
  timedOut: boolean;
  latencyMs: number;
  note: string | null;
  questions: ReasonQuestion[];
  lines: string[];
}

interface Asked {
  id: string;
  type: "noul" | "choice";
  prompt: string;
  criteria?: Record<string, string>;
}

const TIMEOUT_MS = 800;

export async function quickReason(match: Match, moves: Move[]): Promise<QuickBeat> {
  const started = Date.now();
  const asked = selectQuestions(match, moves);
  if (!process.env.TYPESAFE_API_KEY) return mockQuickReason(match, moves, Date.now() - started);
  try {
    return await jevQuickReason(match, moves, asked, started);
  } catch (error) {
    const latencyMs = Date.now() - started;
    if (isTimeout(error) || latencyMs >= TIMEOUT_MS) return timeoutBeat(asked, latencyMs);
    return mockQuickReason(match, moves, latencyMs, "Jev 没有返回");
  }
}

export function mockQuickReason(match: Match, moves: Move[], latencyMs = 0, note: string | null = null): QuickBeat {
  const asked = selectQuestions(match, moves);
  const questions = asked.map((item) => ({
    id: item.id,
    type: item.type,
    prompt: item.prompt,
    answer: mockAnswer(match, moves, item),
  }));
  return {
    source: "mock",
    timedOut: false,
    latencyMs,
    note,
    questions,
    lines: questions.map((item) => item.answer),
  };
}

function selectQuestions(match: Match, moves: Move[]): Asked[] {
  const leading = match.trick.lastPlay === null;
  const asked: Asked[] = [];
  if (!leading && moves.some((move) => move.kind === "pass")) {
    asked.push({ id: "should_pass", type: "noul", prompt: "这手过不过？" });
  }
  if (moves.some((move) => move.bombTier > 0)) {
    asked.push({
      id: "bomb_now",
      type: "choice",
      prompt: "现在炸还是留？",
      criteria: { bomb: "现在炸", save: "留炸" },
    });
  }
  const shapes = leadShapes(moves);
  if (leading && Object.keys(shapes).length >= 2) {
    asked.push({ id: "lead_shape", type: "choice", prompt: "先出哪种？", criteria: shapes });
  }
  if (asked.length === 0) {
    asked.push({ id: "tempo", type: "noul", prompt: "这手主动出牌吗？" });
  }
  return asked.slice(0, 3);
}

function leadShapes(moves: Move[]): Record<string, string> {
  const shapes: Record<string, string> = {};
  if (moves.some((move) => move.kind === "single")) shapes.single = "单张";
  if (moves.some((move) => move.kind === "pair")) shapes.pair = "对子";
  if (moves.some((move) => move.kind === "triple")) shapes.triple = "三张";
  if (moves.some((move) => move.kind === "straight" || move.kind === "tube" || move.kind === "plate")) {
    shapes.sequence = "顺子";
  }
  return shapes;
}

function mockAnswer(match: Match, moves: Move[], question: Asked): string {
  const seat = match.trick.currentSeat;
  const handSize = match.hands[seat].length;
  const partner = (seat + 2) % 4;
  const partnerWinning = match.trick.lastSeat === partner;
  const canBeat = moves.some((move) => move.kind !== "pass");
  const canFinishPlain = moves.some((move) => move.finishes && move.bombTier === 0);
  const oppMin = [0, 1, 2, 3]
    .filter((index) => index % 2 !== seat % 2)
    .reduce((min, index) => Math.min(min, match.hands[index].length), 99);

  if (question.id === "should_pass") {
    if (!canBeat) return "只能过";
    if (partnerWinning) return "过。对家已大";
    if (canFinishPlain) return "压。这手能走完";
    if (handSize <= 8) return "压。牌不多了";
    return "压。先走小的";
  }
  if (question.id === "bomb_now") {
    if (oppMin <= 5) return "现在炸";
    if (partnerWinning) return "留炸";
    const onlyBombFinishes =
      moves.some((move) => move.finishes && move.bombTier > 0) && !canFinishPlain;
    return onlyBombFinishes ? "现在炸" : "留炸";
  }
  if (question.id === "lead_shape") {
    if (moves.some((move) => move.kind === "straight" || move.kind === "tube" || move.kind === "plate")) return "顺子";
    if (moves.some((move) => move.kind === "pair")) return "对子";
    if (moves.some((move) => move.kind === "triple")) return "三张";
    return "单张";
  }
  return handSize >= 20 ? "先出长套" : "先出小牌";
}

async function jevQuickReason(match: Match, moves: Move[], asked: Asked[], started: number): Promise<QuickBeat> {
  const seat = match.trick.currentSeat;
  const questions: Record<string, unknown> = {};
  for (const item of asked) {
    questions[item.id] =
      item.type === "noul"
        ? { type: "noul", instructions: item.prompt }
        : { type: "choice", instructions: item.prompt, criteria: item.criteria };
  }
  const base = (process.env.TYPESAFE_BASE_URL || "https://api.typesafe.ai").replace(/\/+$/, "");
  const response = await fetch(`${base}/v1/systemone`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.TYPESAFE_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.TYPESAFE_MODEL || "jev-latest",
      state: {
        game: "guandan",
        seat,
        level: match.level,
        handCount: match.hands[seat].length,
        counts: match.hands.map((hand) => hand.length),
        leading: match.trick.lastPlay === null,
        lastPlay: match.trick.lastPlay?.label ?? null,
        legalCount: moves.length,
        bombs: moves.filter((move) => move.bombTier > 0).length,
      },
      questions,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const latencyMs = Date.now() - started;
  if (!response.ok) return mockQuickReason(match, moves, latencyMs, `Jev ${response.status}`);
  const parsed = (await response.json()) as {
    answers?: Record<string, { noul?: number; choice?: string }>;
  };
  const answers = parsed.answers ?? {};
  const filled = asked.map((item) => ({
    id: item.id,
    type: item.type,
    prompt: item.prompt,
    answer: readAnswer(item, answers[item.id]),
  }));
  const lines = filled.map((item) => item.answer).filter((line) => line.length > 0);
  if (lines.length === 0) return mockQuickReason(match, moves, latencyMs, "Jev 没有答案");
  return { source: "jev", timedOut: false, latencyMs, note: null, questions: filled, lines };
}

function readAnswer(item: Asked, raw: { noul?: number; choice?: string } | undefined): string {
  if (!raw) return "";
  if (item.type === "noul") {
    if (typeof raw.noul !== "number") return "";
    const yes = raw.noul >= 0.5;
    if (item.id === "should_pass") return yes ? "过" : "压";
    return yes ? "出" : "缓";
  }
  if (!raw.choice || !item.criteria) return "";
  return item.criteria[raw.choice] ?? "";
}

function timeoutBeat(asked: Asked[], latencyMs: number): QuickBeat {
  return {
    source: "jev",
    timedOut: true,
    latencyMs,
    note: "超时跳过",
    questions: asked.map((item) => ({
      id: item.id,
      type: item.type,
      prompt: item.prompt,
      answer: "超时跳过",
    })),
    lines: ["超时跳过"],
  };
}

function isTimeout(error: unknown): boolean {
  return error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
}
