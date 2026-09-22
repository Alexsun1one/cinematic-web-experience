import { issueInvite, isHost, loadRequestRoom } from "@/lib/room";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const room = await loadRequestRoom(request, code);
  if (!room) return json({ error: "房间不存在" }, 404);
  if (!isHost(room, request.headers.get("x-room-host"))) return json({ error: "仅房主可复制邀请" }, 403);
  const origin = new URL(request.url).origin;
  try {
    return json(await issueInvite(room, origin));
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "无法生成邀请" }, 400);
  }
}
