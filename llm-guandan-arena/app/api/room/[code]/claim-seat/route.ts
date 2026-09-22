import { ensureRoomDriver } from "@/lib/room-driver";
import { claimByToken, loadRequestRoom, seatsReady, startRoomMatch, stateForToken } from "@/lib/room";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    seatToken?: string;
    name?: string;
    apiKey?: string;
    baseUrl?: string;
    model?: string;
    tenantId?: unknown;
  };
  const room = await loadRequestRoom(request, code, body);
  if (!room) return json({ error: "房间不存在" }, 404);
  if (body.apiKey || body.baseUrl || body.model) {
    return json({ error: "不要把密钥或模型地址发给服务器。Jev 和 LLM 留在你自己的 Agent 上。" }, 400);
  }
  if (!body.seatToken) return json({ error: "缺少 seatToken" }, 400);
  try {
    await claimByToken(room, body.seatToken, body.name);
    if (room.status === "lobby" && seatsReady(room)) {
      await startRoomMatch(room);
      ensureRoomDriver(room.code, room.tenantId);
    }
    return json(await stateForToken(room, body.seatToken));
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "入座失败" }, 400);
  }
}
