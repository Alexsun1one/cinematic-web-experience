import { ensureRoomDriver } from "@/lib/room-driver";
import { isHost, loadRequestRoom, startRoomMatch, toRoomView } from "@/lib/room";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { hostSecret?: string; tenantId?: unknown };
  const room = await loadRequestRoom(request, code, body);
  if (!room) return json({ error: "房间不存在" }, 404);
  if (!isHost(room, body.hostSecret || request.headers.get("x-room-host"))) {
    return json({ error: "仅房主可开打" }, 403);
  }
  try {
    const match = await startRoomMatch(room);
    ensureRoomDriver(room.code, room.tenantId);
    return json(toRoomView(room, { isHost: true, match }));
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "开打失败" }, 400);
  }
}
