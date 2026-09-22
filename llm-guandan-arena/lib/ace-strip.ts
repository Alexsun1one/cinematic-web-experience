/** Visible 打A line. `limit` is the engine's aceStrikeLimit, not a hard-coded 3. */
export function aceStripLabel(fails: number, limit: number): string {
  const n = Math.max(0, Math.floor(fails));
  if (limit <= 0) return `目标 A · 本方已试 ${n} · 一直停在 A`;
  return `目标 A · 本方已试 ${n}/${Math.floor(limit)} · 三不过 → 回 2`;
}

export function shouldFlashAceDrop(previousLevel: string | null, nextLevel: string): boolean {
  return previousLevel === "A" && nextLevel === "2";
}
