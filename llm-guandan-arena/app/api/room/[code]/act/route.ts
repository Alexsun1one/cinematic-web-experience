import { commitMove, currentLegal, performSeatAction } from "@/lib/guandan/match";
import { armThink, loadRequestRoom, noteMetric, noteSettlement, notifyAct, peekThink, RoomRevisionError, saveRoom, seatIndexByToken, stateForToken } from "@/lib/room";
import { matchStore, readMatch, withMatchLock } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    seatToken?: string;
    moveId?: string;
    apiKey?: string;
    authorization?: string;
    tenantId?: unknown;
  };
  const room = await loadRequestRoom(request, code, body);
  if (!room) return json({ error: "房间不存在" }, 404);
    if (body.apiKey || "authorization" in body) return json({ error: "不要把密钥发给服务器" }, 400);
  const seatToken = body.seatToken;
  const moveId = body.moveId;
  if (!seatToken || !moveId) return json({ error: "需要 seatToken 和 moveId" }, 400);
  const seat = seatIndexByToken(room, seatToken);
  if (seat < 0) return json({ error: "seatToken 无效" }, 404);
  const match = await readMatch(room.matchId);
  if (!match) return json({ error: "还没开打" }, 409);
  if (match.status === "finished") return json({ error: "对局已结束" }, 409);
  if (match.status === "between_rounds" || match.status === "resist") return json({ error: "现在不能出牌" }, 409);
  return withMatchLock(match.id, async () => {
    const live = matchStore().get(match.id) ?? match;
    if (live.status === "finished") return json({ error: "对局已结束" }, 409);
    if (live.status === "between_rounds" || live.status === "resist") return json({ error: "现在不能出牌" }, 409);
    if (live.status === "tribute" || live.status === "return") {
      if (live.trick.currentSeat !== seat) return json({ error: "还没轮到你" }, 409);
      try {
        performSeatAction(live, seat, moveId);
      } catch (error) {
        noteMetric(room, {
          hand: live.round,
          seat,
          kind: "play",
          moveId,
          outcome: "fail",
          thinkMs: peekThink(room, seat),
          text: "贡牌被拒",
        });
        await touchRoom(room);
        return json({ error: error instanceof Error ? error.message : "贡牌被拒" }, 400);
      }
      noteMetric(room, { hand: live.round, seat, kind: "play", moveId, outcome: "success", text: "贡牌" });
      armThink(room, live.trick.currentSeat);
      await touchRoom(room);
      await notifyAct(room, seat);
      return json(await stateForToken(room, seatToken));
    }
    if (live.status !== "playing" || live.trick.currentSeat !== seat) {
      return json({ error: "还没轮到你" }, 409);
    }
    const move = currentLegal(live).find((item) => item.id === moveId);
    if (!move) {
      noteMetric(room, {
        hand: live.round,
        seat,
        kind: "play",
        moveId,
        outcome: "fail",
        thinkMs: peekThink(room, seat),
        text: "非法着法",
      });
      await touchRoom(room);
      return json({ error: "非法着法，只能出 legal 列表里的 moveId" }, 400);
    }
    commitMove(live, move, {
      source: "llm",
      provider: "guest",
      retries: 0,
      note: "guest",
      assist: null,
    });
    noteMetric(room, { hand: live.round, seat, kind: "play", moveId, outcome: "success", text: move.label });
    noteSettlement(room, live);
    if (live.status === "playing" || live.status === "tribute" || live.status === "return") armThink(room, live.trick.currentSeat);
    await touchRoom(room);
    await notifyAct(room, seat);
    return json(await stateForToken(room, seatToken));
  });
}

async function touchRoom(room: Parameters<typeof saveRoom>[0]) {
  try {
    await saveRoom(room);
  } catch (error) {
    if (!(error instanceof RoomRevisionError)) throw error;
  }
}
