# Research Stack

Use this as a selection map, not a shopping list. A cinematic website feels expensive when each effect has a job.

Research checked on 2026-06-26 against GitHub and official project pages.

## Core 3D and WebGL

| Tool | Repository | Use When | Notes |
|---|---|---|---|
| Three.js | https://github.com/mrdoob/three.js | Raw WebGL scenes, 3D object reveals, shader materials, particle geometry | MIT, broadest ecosystem, best default for 3D. |
| React Three Fiber | https://github.com/pmndrs/react-three-fiber | React app needs componentized Three.js scene graph | MIT; pair with Drei for controls, environment, text, helpers. |
| Drei | https://github.com/pmndrs/drei | Need helpers for R3F scenes | MIT; avoid importing helpers blindly. |
| OGL | https://github.com/oframe/ogl | Very small custom WebGL pages where Three.js feels too heavy | Minimal and elegant; requires more WebGL comfort. |
| Shader Park | https://github.com/shader-park/shader-park-core | Procedural shader objects, creative code, "alive" surfaces | Use for special hero moments, not content-heavy pages. |

## Animation and Scroll

| Tool | Repository | Use When | Notes |
|---|---|---|---|
| GSAP | https://github.com/greensock/GSAP | Complex timelines, scroll choreography, SVG/DOM/WebGL coordination | Check current GSAP Standard License for animation-builder products; normal client pages are usually fine. |
| GSAP AI Skills | https://github.com/greensock/gsap-skills | Need agent guidance for GSAP best practices | Official AI skill repo. Good pattern to emulate. |
| Motion | https://github.com/motiondivision/motion | Modern React/JS transitions, layout motion, gestures | MIT; good when GSAP would be overkill. |
| Motion.dev Skill | https://github.com/199-biotechnologies/motion-dev-animations-skill | Want a focused agent skill for Motion.dev | MIT; narrower than this skill. |
| anime.js | https://github.com/juliangarnier/anime | Lightweight timeline-style DOM/SVG animations | MIT; simple, portable, single-page friendly. |
| Lenis | https://github.com/darkroomengineering/lenis | Smooth scroll that drives cinematic sections | MIT; pair with ScrollTrigger only when scroll feel matters. |
| Theatre.js | https://github.com/theatre-js/theatre | Director-style keyframes for cameras, lights, staged proposal simulations | Best for app builds; check current docs/version before adopting. |

## Before/After, Inspection, and Focus

| Tool | Repository | Use When | Notes |
|---|---|---|---|
| img-comparison-slider | https://github.com/sneas/img-comparison-slider | Web component for before/after lighting, renovation, treatment, proof comparison | Good for single HTML/local folders; preserve both states. |
| react-compare-slider | https://github.com/nerdyman/react-compare-slider | React before/after comparison | Good in R3F/React app shells. |
| Panzoom | https://github.com/timmywil/panzoom | Image/plan/product detail zoom and pan | Use for inspectable stills and fallback states. |
| medium-zoom | https://github.com/francoischalifour/medium-zoom | Lightweight image focus zoom | Good for simple proof/details; not enough for complex simulation. |

## Particles, Vectors, and Designed Motion Assets

| Tool | Repository | Use When | Notes |
|---|---|---|---|
| tsParticles | https://github.com/tsparticles/tsparticles | Highly configurable particles, confetti, stars, network fields | MIT; fast route to polished particle backgrounds. |
| particles.js | https://github.com/VincentGarreau/particles.js | Classic lightweight particle background | MIT; older but simple. Prefer tsParticles for new work. |
| Vanta.js | https://github.com/tengbao/vanta | Quick animated 3D background effects | MIT; use as accent, not as the whole concept. |
| Lottie Web | https://github.com/airbnb/lottie-web | After Effects vector animations on web | MIT; needs actual Lottie JSON assets. |
| Rive WASM | https://github.com/rive-app/rive-wasm | Interactive vector animation runtime | MIT; good if a Rive asset exists. |
| Vivus | https://github.com/maxwellito/vivus | SVG line drawing reveals | MIT; useful for diagrams and signature line moments. |

## Physics and Component Freedom

| Tool | Repository | Use When | Notes |
|---|---|---|---|
| Rapier | https://github.com/dimforge/rapier | 2D/3D physics engine for collisions, rigid bodies, and interaction | WASM/runtime packaging matters for offline builds. |
| @react-three/rapier | https://github.com/pmndrs/react-three-rapier | Physics inside React Three Fiber scenes | Best default for 3D assembly/collision labs. |
| cannon-es | https://github.com/pmndrs/cannon-es | Simpler 3D physics concepts | Consider only when Rapier is too heavy. |
| Matter.js | https://github.com/liabru/matter-js | 2D drag, collide, snap, and tactile proof pieces | Good for single-page component labs. |

## Globes, Maps, and Data Worlds

| Tool | Repository | Use When | Notes |
|---|---|---|---|
| three-globe | https://github.com/vasturiano/three-globe | Three.js globe with arcs, points, polygons, labels | Fastest route for Earth/global proof scenes. |
| globe.gl | https://github.com/vasturiano/globe.gl | Standalone globe component | Good for data demos; assets/textures affect offline truth. |
| react-globe.gl | https://github.com/vasturiano/react-globe.gl | React globe component | Use when the whole build is React. |
| deck.gl | https://github.com/visgl/deck.gl | Heavy geospatial/data layers | Use only when real geospatial data matters. |

## Creative Coding and Inspiration

| Source | Link | Use When | Notes |
|---|---|---|---|
| canvas-sketch | https://github.com/mattdesl/canvas-sketch | Generative sketches and visual experiments | MIT; better for prototyping art direction than final business UI. |
| Codrops | https://tympanus.net/codrops/ | Need interaction patterns and effect inspiration | Treat as inspiration; rebuild with local constraints and licenses. |
| Claude Design Skills | https://github.com/freshtechbro/claudedesignskills | Want a broad existing skill collection for 3D/animation/web experiences | MIT; useful reference, but this skill is tailored to Sun's document-to-site flow. |

## Selection Rules

- Start with the delivery mode. Single HTML offline cannot rely on npm packages unless vendored or inlined.
- Use Three.js only when depth, object motion, shaders, or WebGL particles create meaning.
- Use GSAP when the experience is a timeline. Use Motion/anime.js when it is ordinary UI motion.
- Use particles as atmosphere or data metaphor, not confetti wallpaper.
- Use Theatre.js when camera/light timing needs a director timeline, not just scroll triggers.
- Use Rapier/Matter.js only when physical response explains the offer.
- Use comparison sliders for real before/after. Do not fake comparison by cross-fading unrelated images.
- Prefer one primary engine plus one helper. Avoid Three.js + GSAP + Motion + tsParticles unless the page truly needs all of them.
- For customer-facing demos, bias toward stable, inspectable, maintainable effects over fragile one-off tricks.

## License and Dependency Notes

- MIT libraries are usually safe for prototypes and client demos, but always preserve license notices when bundling vendored code.
- GSAP became much more permissive after Webflow's acquisition, but its Standard License still defines prohibited competitive animation-builder uses. Check the current license page before embedding GSAP inside a product that helps users build animations.
- CDN imports are not offline. For offline delivery, vendor dependencies or use the zero-dependency template.
- Do not copy Codrops/demo code wholesale into client work. Extract the interaction idea and rebuild.
