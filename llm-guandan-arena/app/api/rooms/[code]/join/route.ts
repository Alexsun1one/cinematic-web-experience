import { addSpectator, isHost, loadRequestRoom, toRoomView } from "@/lib/room";
import { readMatch } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { name?: string; hostSecret?: string; tenantId?: unknown };
  const room = await loadRequestRoom(request, code, body);
  if (!room) return json({ error: "房间不存在" }, 404);
  if (body.hostSecret && isHost(room, body.hostSecret)) {
    const match = await readMatch(room.matchId);
    return json({ role: "host", ...toRoomView(room, { isHost: true, match }) });
  }
  const spectator = await addSpectator(room, body.name);
  const match = await readMatch(room.matchId);
  return json({
    role: "spectator",
    spectatorId: spectator.id,
    spectatorName: spectator.name,
    ...toRoomView(room, { isHost: false, match }),
  });
}
