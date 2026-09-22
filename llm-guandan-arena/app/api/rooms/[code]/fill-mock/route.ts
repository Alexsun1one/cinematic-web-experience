import { fillMockSeats, getRoom, isHost, toRoomView } from "@/lib/room";
import { matchStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const room = getRoom(code);
  if (!room) return json({ error: "房间不存在" }, 404);
  const body = (await request.json().catch(() => ({}))) as { hostSecret?: string };
  if (!isHost(room, body.hostSecret || request.headers.get("x-room-host"))) {
    return json({ error: "仅房主可填 Mock" }, 403);
  }
  if (room.status !== "lobby") return json({ error: "对局已开始" }, 400);
  fillMockSeats(room);
  const match = room.matchId ? matchStore().get(room.matchId) ?? null : null;
  return json(toRoomView(room, { isHost: true, match }));
}
