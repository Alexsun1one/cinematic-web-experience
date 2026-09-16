/** Smootherstep dwell: slow near chamber centers, C1 at integer joins. */
export function dwellMap(progress: number, count: number) {
  const span = Math.max(1, count - 1);
  const x = Math.min(span, Math.max(0, progress * span));
  const index = Math.min(span - 1, Math.floor(x));
  const t = x - index;
  const u = t * t * t * (t * (t * 6 - 15) + 10);
  return index + u;
}

export function presenceAt(along: number, slot: number) {
  return Math.max(0, 1 - Math.abs(along - slot) * 1.08);
}

export function paintCorridor(root: HTMLElement, along: number, velocity: number) {
  const hold = Math.min(0.5, Math.abs(velocity) * 9);
  const shift = `${Math.min(1, along) * -72}px`;
  const rooms = root.querySelectorAll<HTMLElement>("[data-chamber]");
  for (const node of rooms) {
    const slot = Number(node.dataset.chamber);
    if (Number.isNaN(slot)) continue;
    const presence = presenceAt(along, slot);
    const leaving = Math.max(0, Math.min(1, (along - slot) * 1.45));
    const lit = 0.22 + Math.max(presence, hold) * 0.78;
    node.style.setProperty("--presence", presence.toFixed(4));
    node.style.setProperty("--leaving", leaving.toFixed(4));
    node.style.setProperty("--lit", lit.toFixed(4));
    node.style.setProperty("--shift", shift);
  }
}
