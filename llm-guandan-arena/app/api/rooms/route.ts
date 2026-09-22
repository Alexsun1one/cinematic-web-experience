import { createRoom, listRooms, openOperatorTable, toRoomView } from "@/lib/room";
import { matchStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

export function GET() {
  return json({
    rooms: listRooms().slice(0, 12).map((room) => ({
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
  };
  const series = body.series === "full" || body.series === "three" || body.series === "open" ? body.series : "three";
  if (body.operator === true || typeof body.operatorSeat === "number") {
    const opened = openOperatorTable({
      seat: typeof body.operatorSeat === "number" ? body.operatorSeat : 2,
      series: body.series === "full" || body.series === "three" || body.series === "open" ? body.series : "open",
      startLevel: body.startLevel,
    });
    return json({
      hostSecret: opened.hostSecret,
      operator: {
        seat: opened.seat,
        wind: opened.wind,
        name: "知识",
        seatToken: opened.seatToken,
      },
      ...toRoomView(opened.room, { isHost: true, match: null }),
    });
  }
  const { room, hostSecret } = createRoom({
    series,
    startLevel: body.startLevel,
    seatsOpen: body.seatsOpen !== false,
    autoFillMock: body.autoFillMock !== false,
  });
  const match = room.matchId ? matchStore().get(room.matchId) : null;
  return json({
    hostSecret,
    ...toRoomView(room, { isHost: true, match }),
  });
}
