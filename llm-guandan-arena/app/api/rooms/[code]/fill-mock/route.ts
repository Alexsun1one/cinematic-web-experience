import { fillMockSeats, isHost, loadRequestRoom, toRoomView } from "@/lib/room";
import { readMatch } from "@/lib/store";

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
    return json({ error: "仅房主可填 Mock" }, 403);
  }
  if (room.status !== "lobby") return json({ error: "对局已开始" }, 400);
  await fillMockSeats(room);
  const match = await readMatch(room.matchId);
  return json(toRoomView(room, { isHost: true, match }));
}
