let token = 0;

export function inertiaScroll(to: number, duration = 980) {
  const id = ++token;
  const start = window.scrollY;
  const dist = to - start;
  if (Math.abs(dist) < 1) {
    window.scrollTo(0, to);
    return;
  }
  const t0 = performance.now();
  function step(now: number) {
    if (id !== token) return;
    const t = Math.min(1, (now - t0) / duration);
    const eased = 1 - (1 - t) ** 3;
    window.scrollTo(0, start + dist * eased);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
