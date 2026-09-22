export function parseMoveId(text: string): { moveId?: string; note?: string } {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced?.[1] ?? text).trim();
  try {
    const parsed = JSON.parse(raw) as { moveId?: unknown; move_id?: unknown; id?: unknown; note?: unknown };
    const moveId = firstString(parsed.moveId, parsed.move_id, parsed.id);
    const note = typeof parsed.note === "string" ? parsed.note : undefined;
    return { moveId, note };
  } catch {
    const moveId = raw.match(/"moveId"\s*:\s*"([^"]+)"/)?.[1];
    const note = raw.match(/"note"\s*:\s*"([^"]*)"/)?.[1];
    return { moveId, note };
  }
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}
