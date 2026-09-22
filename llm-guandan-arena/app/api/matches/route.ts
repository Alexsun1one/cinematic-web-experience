import { createMatch, parseStartLevel } from "@/lib/guandan/match";
import { keyStatus, seatConfigs } from "@/lib/roster";
import { remember, matchStore } from "@/lib/store";
import { toView } from "@/lib/view";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

export function GET() {
  const matches = [...matchStore().values()].sort((a, b) => b.createdAt - a.createdAt);
  return json({
    keys: keyStatus(),
    matches: matches.map((match) => ({
      id: match.id,
      status: match.status,
      round: match.round,
      level: match.level,
      createdAt: match.createdAt,
      winner: match.winner,
      levels: match.levels,
    })),
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    live?: unknown;
    jevAssist?: unknown;
    startLevel?: unknown;
    seed?: unknown;
  };
  const live = body.live === true;
  const keys = keyStatus();
  const match = createMatch({
    id: crypto.randomUUID(),
    seats: seatConfigs(live),
    jevAssist: body.jevAssist === true && keys.typesafe,
    startLevel: parseStartLevel(body.startLevel),
    seed: typeof body.seed === "number" ? body.seed : undefined,
  });
  remember(match);
  return json({ ...toView(match), liveRequested: live, keys });
}
