import { createRoom, listRooms, openOperatorTable, toRoomView } from "@/lib/room";
import { TenantRoomLimitError, tenantFromRequest } from "@/lib/room-store";
import { readMatch } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

export async function GET(request: Request) {
  const tenantId = tenantFromRequest(request);
  const rooms = await listRooms(tenantId);
  return json({
    tenantId,
    rooms: rooms.slice(0, 12).map((room) => ({
      code: room.code,
      status: room.status,
      series: room.series,
      spectatorCount: room.spectators.size,
      matchId: room.matchId,
      createdAt: room.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    series?: unknown;
    startLevel?: unknown;
    seatsOpen?: unknown;
    autoFillMock?: unknown;
    operator?: unknown;
    operatorSeat?: unknown;
    tenantId?: unknown;
  };
  const tenantId = tenantFromRequest(request, body);
  const series = body.series === "full" || body.series === "three" || body.series === "open" ? body.series : "three";
  try {
    if (body.operator === true || typeof body.operatorSeat === "number") {
      const opened = await openOperatorTable({
        seat: typeof body.operatorSeat === "number" ? body.operatorSeat : 2,
        series: body.series === "full" || body.series === "three" || body.series === "open" ? body.series : "open",
        startLevel: body.startLevel,
        tenantId,
      });
      return json({
        hostSecret: opened.hostSecret,
        tenantId,
        operator: {
          seat: opened.seat,
          wind: opened.wind,
          name: "知识",
          seatToken: opened.seatToken,
        },
        ...toRoomView(opened.room, { isHost: true, match: null }),
      });
    }
    const { room, hostSecret } = await createRoom({
      series,
      startLevel: body.startLevel,
      seatsOpen: body.seatsOpen !== false,
      autoFillMock: body.autoFillMock !== false,
      tenantId,
    });
    const match = await readMatch(room.matchId);
    return json({
      hostSecret,
      tenantId,
      ...toRoomView(room, { isHost: true, match }),
    });
  } catch (error) {
    if (error instanceof TenantRoomLimitError) return json({ error: error.message }, 429);
    const message = error instanceof Error ? error.message : "开房失败";
    return json({ error: message }, 400);
  }
}
