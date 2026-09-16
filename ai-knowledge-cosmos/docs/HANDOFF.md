# Handoff — 夜览馆 motion 2

## Current goal

Second motion-only pass. Art direction locked. No content reboot.

## What felt wrong / what changed

See `docs/MOTION.md`. Short version: planted corridor (smootherstep dwell + exp follow + rAF CSS vars), tighter glyph spring, lamp that yields to vertical scroll, 360ms interruptible slit wipe, larger hitboxes, WebGL still pauses offscreen.

## Evidence

- `npm run build` must pass
- No new `motion2-*.png`: still frames would look the same; the work is timing/physics.

## Blockers

None.
