import { getRoom, heartbeatSpectator, isHost, pruneSpectators, toRoomView } from "@/lib/room";
import { matchStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

function hostFrom(request: Request): string | null {
  return request.headers.get("x-room-host") || request.headers.get("x-host-secret");
}

function spectatorFrom(request: Request): string | null {
  return request.headers.get("x-spectator-id");
}

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const room = getRoom(code);
  if (!room) return json({ error: "房间不存在" }, 404);
  pruneSpectators(room);
  const spectatorId = spectatorFrom(request);
  if (spectatorId) heartbeatSpectator(room, spectatorId);
  const host = isHost(room, hostFrom(request));
  const match = room.matchId ? matchStore().get(room.matchId) ?? null : null;
  if (room.matchId && match && match.status === "finished" && room.status === "playing") {
    room.status = "finished";
  }
  return json(toRoomView(room, { isHost: host, match }));
}
