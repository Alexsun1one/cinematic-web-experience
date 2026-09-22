import { commitMove, currentLegal, logReason, pushReject, stepLocal } from "@/lib/guandan/match";
import { decide } from "@/lib/llm/decide";
import { quickReason } from "@/lib/llm/quick-reason";
import { matchStore, withMatchLock } from "@/lib/store";
import { toView } from "@/lib/view";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return withMatchLock(id, async () => {
    const match = matchStore().get(id);
    if (!match) return Response.json({ error: "对局不存在" }, { status: 404 });
    if (match.status === "finished") {
      return Response.json(toView(match), { headers: { "cache-control": "no-store" } });
    }
    try {
      if (match.status !== "playing") {
        stepLocal(match);
        return Response.json(toView(match), { headers: { "cache-control": "no-store" } });
      }
      const seat = match.trick.currentSeat;
      const moves = currentLegal(match);
      logReason(match, await quickReason(match, moves));
      const decision = await decide(match, moves);
      for (const reason of decision.rejected) pushReject(match, seat, reason);
      commitMove(match, decision.move, decision.meta);
      return Response.json(toView(match), { headers: { "cache-control": "no-store" } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "step failed";
      return Response.json({ error: message }, { status: 500 });
    }
  });
}
