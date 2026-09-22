import { redactSecrets } from "./telemetry";

export type SeatPhase =
  | "idle"
  | "waiting"
  | "thinking"
  | "jev"
  | "llm"
  | "playing"
  | "played"
  | "passed"
  | "timeout"
  | "error";

export interface SeatLive {
  phase: SeatPhase;
  since: number;
  line: string;
  thought: string;
  jevMs: number | null;
  thinkMs: number | null;
  reactionMs: number | null;
  costUsd: number | null;
  tokens: number | null;
  retries: number;
}

const BUSY = new Set<SeatPhase>(["thinking", "jev", "llm", "playing"]);

export function emptySeatLive(now = 0): SeatLive {
  return {
    phase: "idle",
    since: now,
    line: "空闲",
    thought: "",
    jevMs: null,
    thinkMs: null,
    reactionMs: null,
    costUsd: null,
    tokens: null,
    retries: 0,
  };
}

export function blankSeatLives(now = 0): [SeatLive, SeatLive, SeatLive, SeatLive] {
  return [emptySeatLive(now), emptySeatLive(now), emptySeatLive(now), emptySeatLive(now)];
}

export function phaseLabel(phase: SeatPhase): string {
  switch (phase) {
    case "idle":
      return "空闲";
    case "waiting":
      return "等待";
    case "thinking":
      return "思考中";
    case "jev":
      return "Jev 快判中";
    case "llm":
      return "LLM 决策中";
    case "playing":
      return "出牌中";
    case "played":
      return "已出";
    case "passed":
      return "过";
    case "timeout":
      return "超时 Mock";
    case "error":
      return "错误/重试";
  }
}

export function isSeatPhase(value: unknown): value is SeatPhase {
  return value === "idle" || value === "waiting" || value === "thinking" || value === "jev" || value === "llm" || value === "playing" || value === "played" || value === "passed" || value === "timeout" || value === "error";
}

/** Short chip. Busy phases append elapsed milliseconds. */
export function chipText(live: SeatLive, now: number): string {
  const label = live.line || phaseLabel(live.phase);
  if (live.phase === "thinking" || live.phase === "jev" || live.phase === "llm" || live.phase === "playing") {
    return `${phaseLabel(live.phase)} ${Math.max(0, now - live.since)}ms`;
  }
  if (live.phase === "error" && live.retries > 0) return `错误/重试 ${live.retries}`;
  if (live.costUsd !== null && live.phase === "played") return label;
  return label;
}

export function normalizeSeatLives(raw: SeatLive[] | undefined, now = 0): [SeatLive, SeatLive, SeatLive, SeatLive] {
  const blank = blankSeatLives(now);
  if (!raw) return blank;
  return [0, 1, 2, 3].map((index) => {
    const row = raw[index];
    if (!row || !isSeatPhase(row.phase)) return blank[index];
    return {
      ...emptySeatLive(now),
      ...row,
      line: redactSecrets(row.line || phaseLabel(row.phase)).slice(0, 80),
      thought: redactSecrets(row.thought || "").slice(0, 240),
    };
  }) as [SeatLive, SeatLive, SeatLive, SeatLive];
}

export function nextSeatLives(
  lives: SeatLive[],
  seat: number,
  patch: Partial<SeatLive> & { phase: SeatPhase },
  now: number,
): { lives: [SeatLive, SeatLive, SeatLive, SeatLive]; changed: boolean } {
  const copy = normalizeSeatLives(lives, now);
  const prev = copy[seat];
  const line = redactSecrets(patch.line || phaseLabel(patch.phase)).slice(0, 80);
  const thought = patch.thought !== undefined ? redactSecrets(patch.thought).slice(0, 240) : prev.thought;
  const phaseChanged = prev.phase !== patch.phase;
  const next: SeatLive = {
    ...prev,
    phase: patch.phase,
    line,
    thought,
    since: phaseChanged ? now : prev.since,
    jevMs: patch.jevMs !== undefined ? patch.jevMs : prev.jevMs,
    thinkMs: patch.thinkMs !== undefined ? patch.thinkMs : prev.thinkMs,
    reactionMs: patch.reactionMs !== undefined ? patch.reactionMs : prev.reactionMs,
    costUsd: patch.costUsd !== undefined ? patch.costUsd : prev.costUsd,
    tokens: patch.tokens !== undefined ? patch.tokens : prev.tokens,
    retries: patch.phase === "error" ? prev.retries + (phaseChanged ? 1 : 0) : prev.retries,
  };
  copy[seat] = next;
  if (phaseChanged && BUSY.has(patch.phase)) {
    for (let index = 0; index < 4; index += 1) {
      if (index === seat) continue;
      if (BUSY.has(copy[index].phase)) {
        copy[index] = { ...copy[index], phase: "waiting", line: "等待", since: now };
      }
    }
  }
  const changed = phaseChanged || prev.line !== line || prev.thought !== thought || prev.costUsd !== next.costUsd || prev.jevMs !== next.jevMs || prev.retries !== next.retries;
  return { lives: copy, changed };
}
