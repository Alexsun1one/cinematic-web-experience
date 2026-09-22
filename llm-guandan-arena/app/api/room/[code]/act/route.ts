import { commitMove, currentLegal, performSeatAction } from "@/lib/guandan/match";
import { getRoom, notifyAct, seatIndexByToken, stateForToken } from "@/lib/room";
import { matchStore, withMatchLock } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const room = getRoom(code);
  if (!room) return json({ error: "房间不存在" }, 404);
  const body = (await request.json().catch(() => ({}))) as { seatToken?: string; moveId?: string; apiKey?: string };
  if (body.apiKey) return json({ error: "不要把密钥发给服务器" }, 400);
  const seatToken = body.seatToken;
  const moveId = body.moveId;
  if (!seatToken || !moveId) return json({ error: "需要 seatToken 和 moveId" }, 400);
  const seat = seatIndexByToken(room, seatToken);
  if (seat < 0) return json({ error: "seatToken 无效" }, 404);
  const match = room.matchId ? matchStore().get(room.matchId) : undefined;
  if (!match) return json({ error: "还没开打" }, 409);
  if (match.status === "finished") return json({ error: "对局已结束" }, 409);
  if (match.status === "between_rounds" || match.status === "resist") return json({ error: "现在不能出牌" }, 409);
  return withMatchLock(match.id, async () => {
    if (match.status === "tribute" || match.status === "return") {
      if (match.trick.currentSeat !== seat) return json({ error: "还没轮到你" }, 409);
      try {
        performSeatAction(match, seat, moveId);
      } catch (error) {
        return json({ error: error instanceof Error ? error.message : "贡牌被拒" }, 400);
      }
      notifyAct(room, seat);
      return json(stateForToken(room, seatToken));
    }
    if (match.status !== "playing" || match.trick.currentSeat !== seat) {
      return json({ error: "还没轮到你" }, 409);
    }
    const move = currentLegal(match).find((item) => item.id === moveId);
    if (!move) return json({ error: "非法着法，只能出 legal 列表里的 moveId" }, 400);
    commitMove(match, move, {
      source: "llm",
      provider: "guest",
      retries: 0,
      note: "guest",
      assist: null,
    });
    notifyAct(room, seat);
    return json(stateForToken(room, seatToken));
  });
}
