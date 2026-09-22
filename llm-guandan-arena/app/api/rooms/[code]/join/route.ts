import { addSpectator, getRoom, isHost, toRoomView } from "@/lib/room";
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
  const body = (await request.json().catch(() => ({}))) as { name?: string; hostSecret?: string };
  if (body.hostSecret && isHost(room, body.hostSecret)) {
    const match = room.matchId ? matchStore().get(room.matchId) ?? null : null;
    return json({ role: "host", ...toRoomView(room, { isHost: true, match }) });
  }
  const spectator = addSpectator(room, body.name);
  const match = room.matchId ? matchStore().get(room.matchId) ?? null : null;
  return json({
    role: "spectator",
    spectatorId: spectator.id,
    spectatorName: spectator.name,
    ...toRoomView(room, { isHost: false, match }),
  });
}
