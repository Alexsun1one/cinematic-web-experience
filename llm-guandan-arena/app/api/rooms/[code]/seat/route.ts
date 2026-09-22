import { claimSeat, clearSeat, isHost, loadRequestRoom, toRoomView } from "@/lib/room";
import type { VendorId } from "@/lib/guandan/types";
import { readMatch } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    seat?: unknown;
    kind?: unknown;
    name?: string;
    model?: string;
    baseUrl?: string;
    apiKey?: string;
    vendor?: VendorId;
    clear?: unknown;
    hostSecret?: string;
    tenantId?: unknown;
  };
  const room = await loadRequestRoom(request, code, body);
  if (!room) return json({ error: "房间不存在" }, 404);
  const host = isHost(room, body.hostSecret || request.headers.get("x-room-host"));
  if (!host && !room.seatsOpen) return json({ error: "仅房主可排座" }, 403);
  const index = typeof body.seat === "number" ? body.seat : Number(body.seat);
  if (!Number.isInteger(index) || index < 0 || index > 3) return json({ error: "座位无效" }, 400);
  try {
    if (body.clear === true) {
      if (!host) return json({ error: "仅房主可清空座位" }, 403);
      await clearSeat(room, index);
    } else {
      const kind = body.kind === "env" || body.kind === "openai" || body.kind === "mock" ? body.kind : "mock";
      await claimSeat(room, index, {
        kind,
        name: body.name,
        model: body.model,
        baseUrl: body.baseUrl,
        apiKey: body.apiKey,
        vendor: body.vendor,
      });
    }
    const match = await readMatch(room.matchId);
    return json(toRoomView(room, { isHost: host, match }));
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "入座失败" }, 400);
  }
}
