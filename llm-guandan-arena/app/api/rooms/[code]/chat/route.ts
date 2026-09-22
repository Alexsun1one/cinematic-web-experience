import { getRoom, isHost, postChat, toRoomView } from "@/lib/room";
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
  const body = (await request.json().catch(() => ({}))) as {
    text?: string;
    name?: string;
    hostSecret?: string;
  };
  const host = isHost(room, body.hostSecret || request.headers.get("x-room-host"));
  try {
    postChat(room, body.name || (host ? "房主" : "观众"), body.text || "", host ? "host" : "spectator");
    const match = room.matchId ? matchStore().get(room.matchId) ?? null : null;
    return json(toRoomView(room, { isHost: host, match }));
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "发送失败" }, 400);
  }
}
