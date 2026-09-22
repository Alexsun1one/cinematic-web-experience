import { matchStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const match = matchStore().get(id);
  if (!match) return Response.json({ error: "对局不存在" }, { status: 404 });
  return Response.json(
    {
      id: match.id,
      seed: match.seed,
      createdAt: match.createdAt,
      seats: match.seats,
      jevAssist: match.jevAssist,
      startLevel: match.startLevel,
      levels: match.levels,
      dealer: match.dealer,
      status: match.status,
      winner: match.winner,
      rounds: match.rounds,
      log: match.log,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
