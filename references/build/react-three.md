# React / Three Build Lane

Use for real 3D, high-end globe/product scenes, WebGL particles, shader effects, DOM/WebGL scroll sync, and reusable app-like deliverables.

## Default Stack

- Vite + React when starting fresh.
- Three.js directly for raw scenes.
- React Three Fiber + Drei when React component structure helps.
- GSAP ScrollTrigger + Lenis for choreographed scroll scenes.
- Use `r3f-scroll-rig`-style thinking when DOM and WebGL need exact alignment.
- React Postprocessing when bloom, depth of field, filmic color, or material aura is necessary.
- Theatre.js when camera, light, and object timing need director-style keyframes.
- @react-three/rapier when collision, assembly, or physical handling is central.

## Premium Routes

- Globe/product: sphere texture + atmosphere + physical product reveal.
- Particle identity: Three.js points or custom shader, not tsParticles for hero-grade morphs.
- Layered artifact: planes, depth, scroll camera, HTML overlay labels.
- Spatial gallery: image planes, focus transitions, chapter details.
- Before/after space: original/future-state planes, camera focus zones, labeled assumptions.
- Inspectable product: rotate, zoom, exploded detail, material swatches, proof hotspots.

## Performance Ladder

```text
full:
- WebGL scene with DPR cap, animation, scroll sync
reduced:
- 2.5D CSS/DOM or static WebGL pose
fallback:
- static hero image + accessible sections
```

## Rules

- Cap DPR, reduce particles on mobile, pause offscreen/hidden if needed.
- Never make WebGL the only access to content.
- Screenshot and nonblank canvas check are mandatory.
- Preserve exact product/logo/face constraints.
- Add reset/fallback controls for camera and focus interactions.
