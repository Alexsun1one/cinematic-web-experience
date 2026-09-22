export type MetricKind = "play" | "jev" | "decision" | "timeout";
export type MetricOutcome = "success" | "fail" | "timeout";

export interface PlayMetric {
  id: number;
  at: number;
  room: string;
  matchId: string | null;
  hand: number;
  seat: number | null;
  kind: MetricKind;
  moveId: string | null;
  outcome: MetricOutcome;
  thinkMs: number | null;
  jevMs: number | null;
  reactionMs: number | null;
  tokens: number | null;
  costUsd: number | null;
}

export interface ReplayEvent {
  id: number;
  at: number;
  kind: "room" | "claim" | "play" | "settle" | "timeout" | "jev" | "fail";
  seat: number | null;
  hand: number;
  text: string;
  moveId: string | null;
}

const SECRET = /bearer\s+[a-z0-9._\-]{8,}|sk-[a-z0-9_\-]{8,}|typesafe_api_key\s*[=:]\s*\S+|api[_-]?key\s*[=:]\s*\S+/gi;

export function redactSecrets(text: string): string {
  return text.replace(SECRET, "[redacted]");
}

function num(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

/** Read token and cost fields when a model response includes them. Never reads credentials. */
export function readModelUsage(body: unknown): { tokens: number | null; costUsd: number | null } {
  if (!body || typeof body !== "object") return { tokens: null, costUsd: null };
  const record = body as { usage?: Record<string, unknown>; cost?: unknown };
  const usage = record.usage;
  const tokens = num(usage?.total_tokens) ?? num(usage?.totalTokens);
  const costUsd = num(usage?.cost_usd) ?? num(usage?.cost) ?? num(usage?.estimated_cost) ?? num(record.cost);
  return { tokens, costUsd };
}

export function metricsToCsv(rows: PlayMetric[]): string {
  const header = "at,room,matchId,hand,seat,kind,moveId,outcome,thinkMs,jevMs,reactionMs,tokens,costUsd";
  const lines = rows.map((row) =>
    [
      row.at,
      row.room,
      row.matchId ?? "",
      row.hand,
      row.seat ?? "",
      row.kind,
      row.moveId ?? "",
      row.outcome,
      row.thinkMs ?? "",
      row.jevMs ?? "",
      row.reactionMs ?? "",
      row.tokens ?? "",
      row.costUsd ?? "",
    ]
      .map((value) => {
        const text = String(value);
        return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
      })
      .join(","),
  );
  return `${[header, ...lines].join("\n")}\n`;
}

export function sparkValues(rows: PlayMetric[], field: "thinkMs" | "jevMs" | "reactionMs"): number[] {
  return rows.map((row) => row[field]).filter((value): value is number => typeof value === "number");
}
