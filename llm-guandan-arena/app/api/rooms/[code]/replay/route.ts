import { loadRequestRoom } from "@/lib/room";
import { readMatch } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const room = await loadRequestRoom(request, code);
  if (!room) return Response.json({ error: "房间不存在" }, { status: 404 });
  const match = await readMatch(room.matchId);
  return Response.json(
    {
      code: room.code,
      tenantId: room.tenantId,
      status: room.status,
      series: room.series,
      startLevel: room.startLevel,
      matchId: room.matchId,
      levels: match?.levels ?? null,
      aceFails: match?.aceFails ?? null,
      rounds: match?.rounds ?? [],
      events: room.replay ?? [],
      metrics: room.metrics ?? [],
    },
    { headers: { "cache-control": "no-store" } },
  );
}
