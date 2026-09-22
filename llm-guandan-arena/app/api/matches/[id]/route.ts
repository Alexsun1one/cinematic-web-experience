import { readMatch } from "@/lib/store";
import { toView } from "@/lib/view";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const match = await readMatch(id);
  if (!match) return Response.json({ error: "对局不存在" }, { status: 404 });
  return Response.json(toView(match), { headers: { "cache-control": "no-store" } });
}
