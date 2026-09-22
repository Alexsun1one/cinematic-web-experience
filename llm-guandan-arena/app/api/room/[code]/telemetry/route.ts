import { loadRequestRoom, noteMetric, RoomRevisionError, saveRoom, seatIndexByToken, setSeatPhase, stateForToken } from "@/lib/room";
import { isSeatPhase } from "@/lib/seat-live";
import { metricsToCsv } from "@/lib/telemetry";
import { readMatch } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const room = await loadRequestRoom(request, code);
  if (!room) return json({ error: "房间不存在" }, 404);
  const metrics = room.metrics ?? [];
  const format = new URL(request.url).searchParams.get("format");
  if (format === "csv") {
    return new Response(metricsToCsv(metrics), {
      headers: { "content-type": "text/csv; charset=utf-8", "cache-control": "no-store" },
    });
  }
  return json({ code: room.code, tenantId: room.tenantId, matchId: room.matchId, metrics });
}

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    seatToken?: string;
    apiKey?: string;
    authorization?: string;
    kind?: "jev" | "decision" | "play";
    moveId?: string;
    outcome?: "success" | "fail" | "timeout";
    jevMs?: number;
    reactionMs?: number;
    thinkMs?: number;
    tokens?: number;
    costUsd?: number;
    phase?: string;
    line?: string;
    thought?: string;
    tenantId?: unknown;
  };
  const room = await loadRequestRoom(request, code, body);
  if (!room) return json({ error: "房间不存在" }, 404);
  if (body.apiKey || body.authorization) return json({ error: "不要把密钥发给服务器" }, 400);
  if (!body.seatToken) return json({ error: "缺少 seatToken" }, 400);
  const seat = seatIndexByToken(room, body.seatToken);
  if (seat < 0) return json({ error: "seatToken 无效" }, 404);
  const match = await readMatch(room.matchId);
  if (isSeatPhase(body.phase)) {
    setSeatPhase(
      room,
      seat,
      {
        phase: body.phase,
        line: body.line,
        thought: body.thought,
        jevMs: typeof body.jevMs === "number" ? body.jevMs : undefined,
        thinkMs: typeof body.thinkMs === "number" ? body.thinkMs : undefined,
        reactionMs: typeof body.reactionMs === "number" ? body.reactionMs : undefined,
        tokens: typeof body.tokens === "number" ? body.tokens : undefined,
        costUsd: typeof body.costUsd === "number" ? body.costUsd : undefined,
      },
      match?.round ?? 0,
    );
  }
  if (body.kind) {
  const kind = body.kind === "jev" || body.kind === "decision" || body.kind === "play" ? body.kind : "decision";
  const outcome = body.outcome === "fail" || body.outcome === "timeout" || body.outcome === "success" ? body.outcome : "success";
  noteMetric(room, {
    hand: match?.round ?? 0,
    seat,
    kind,
    moveId: body.moveId ?? null,
    outcome,
    thinkMs: typeof body.thinkMs === "number" ? body.thinkMs : null,
    jevMs: typeof body.jevMs === "number" ? body.jevMs : null,
    reactionMs: typeof body.reactionMs === "number" ? body.reactionMs : null,
    tokens: typeof body.tokens === "number" ? body.tokens : null,
    costUsd: typeof body.costUsd === "number" ? body.costUsd : null,
    text: kind === "jev" ? "Jev" : "决策",
  });
  }
  try {
    await saveRoom(room);
  } catch (error) {
    if (!(error instanceof RoomRevisionError)) throw error;
  }
  return json(await stateForToken(room, body.seatToken));
}
