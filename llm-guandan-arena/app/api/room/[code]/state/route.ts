import { getRoom, stateForToken } from "@/lib/room";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const room = getRoom(code);
  if (!room) return Response.json({ error: "房间不存在" }, { status: 404 });
  const token = new URL(request.url).searchParams.get("seatToken");
  return Response.json(stateForToken(room, token), { headers: { "cache-control": "no-store" } });
}
