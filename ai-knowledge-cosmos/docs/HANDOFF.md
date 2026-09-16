# Handoff — 夜览馆 motion

## Current goal

Interaction and motion craft on locked 夜览馆 direction. No art-direction reboot.

## Changed this pass

- Entrance: slit breathe width/glow, stepped grain, double 「向前」chevrons, inertia jump into first hall.
- Corridor: dwell 0.14/0.86, adaptive catchup lerp, DOM transform via ref, plate tracks distance, spotlight crossfade, arrow-key inertia (cancels previous tween).
- Exhibits: glyph critically-damped lift + click overshoot + grab cursor; lamp velocity, damping, snap to 猫/它, `ew-resize`/`grabbing`, touch-none.
- Pages: acid slit-travel wipe gallery ↔ lesson ↔ zine (widens then collapses).
- Micro: stamp thud, workbench stamp settle, floor-plan 您在此处 pulse, hall-link press, toy button press, rail dots.
- A11y: `prefers-reduced-motion` kills animations/wipes/inertia; acid 1px/3px focus rings; reduced typecase is a static grid; lamp snaps instantly.
- Perf: LiveCanvas DPR [1, 1.5] + IntersectionObserver pause; lamp settle rAF only after drag; no new deps.

## Evidence

- `docs/previews/motion-*.png` (home mid-breath, chamber handoff, exhibit, lesson)
- `npm run build` must pass

## Blockers

None.
