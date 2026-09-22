import { getRoom, heartbeatSpectator, isHost, pruneSpectators, toRoomView } from "@/lib/room";
import { matchStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** SSE snapshot stream for spectators (and host). Falls back clients can poll GET /api/rooms/[code]. */
export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const room = getRoom(code);
  if (!room) return Response.json({ error: "房间不存在" }, { status: 404 });

  const hostSecret = request.headers.get("x-room-host");
  const spectatorId = request.headers.get("x-spectator-id");
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        if (closed) return;
        const live = getRoom(code);
        if (!live) {
          controller.enqueue(encoder.encode(`event: end\ndata: ${JSON.stringify({ error: "gone" })}\n\n`));
          controller.close();
          closed = true;
          return;
        }
        pruneSpectators(live);
        if (spectatorId) heartbeatSpectator(live, spectatorId);
        const match = live.matchId ? matchStore().get(live.matchId) ?? null : null;
        if (live.matchId && match && match.status === "finished" && live.status === "playing") {
          live.status = "finished";
        }
        const view = toRoomView(live, { isHost: isHost(live, hostSecret), match });
        controller.enqueue(encoder.encode(`event: room\ndata: ${JSON.stringify(view)}\n\n`));
      };
      send();
      const timer = setInterval(send, 700);
      const ping = setInterval(() => {
        if (!closed) controller.enqueue(encoder.encode(`: ping\n\n`));
      }, 15000);
      request.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(timer);
        clearInterval(ping);
        try {
          controller.close();
        } catch {
          /* ignore */
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
