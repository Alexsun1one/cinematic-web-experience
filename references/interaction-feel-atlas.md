# Interaction Feel Atlas

Use this whenever the user asks for "真实手感", "丝滑", "动画感", "高级", "炫技", "可以交互", "像真的", or any page where the client should touch/control the experience.

## Feel Is A System

```text
feel spec:
- desired feel:
- user input:
- immediate feedback:
- motion model:
- material response:
- camera behavior:
- settle/rest state:
- fallback/reduced motion:
- failure risk:
```

## Motion Taste Families

| Taste | Best For | Motion Model | Visual Language | Reject If |
|---|---|---|---|---|
| liquid luxury | luxury, fashion, hospitality, culture, premium services | slow damped camera, soft parallax, material shimmer, restrained bloom | silence, macro texture, exquisite spacing | becomes purple/black generic luxury |
| physical tactile | products, tools, education, playful demos, configurators | drag, inertia, elastic constraints, snap, collision, magnetic grouping | shadows, contact, mass, friction | physics does not teach anything |
| cinematic scroll | proposals, big launches, stories, transformation | pinned chapters, camera rail, scrubbed timeline, staged reveals | full-bleed scenes, focus shifts | user only watches and cannot inspect |
| industrial precision | manufacturing, hardware, energy, automotive, biotech | cutaway, exploded assembly, deterministic easing, measured timing | grids, labels, metal/glass, diagram depth | claims are not source-backed |
| calm trust | healthcare, finance, legal, government, education | small purposeful transitions, evidence reveal, no aggressive motion | clarity, calm spacing, source labels | spectacle undermines credibility |
| data command | SaaS, finance, logistics, energy, operations | drill-down, scenario toggles, map/globe pan, cross-filter | dashboards, map fields, provenance tags | metrics/maps are fake |
| playful toy | campaigns, games, youth brands, informal education | bouncy springs, collision, toss, snap, particles | bright but controlled, responsive objects | becomes childish for serious domains |
| poetic culture | heritage, art, tourism, personal essays | slow pan, archival layers, dust/light particles, gentle focus | texture, story path, atmosphere | loses source specificity |

## Gesture Models

| Input | Use | Feel Requirements | Libraries |
|---|---|---|---|
| hover/focus | reveal detail, preview affordance | no layout shift, visible focus state | CSS, Motion |
| tap/click | hotspot, focus card, toggle | instant response under perceptual delay, clear selected state | DOM, Motion |
| drag | rotate product, move component, compare slider | capture pointer, resistance, release behavior, reset | Motion drag, GSAP Draggable, @use-gesture |
| wheel/pinch | zoom, plan/map/photo inspection | bounded scale, origin-aware zoom, no page trap | @use-gesture, Panzoom |
| scroll | chapter choreography, camera rail | scrub/pin only when meaningful, no scroll hijack | GSAP ScrollTrigger, Lenis |
| scrub slider | before/after, timeline, process | labels at key states, keyboard accessible | native range, GSAP timeline |
| keyboard | accessibility and power use | tab order, arrows when spatial, escape/reset | DOM events |

## Response Models

- immediate: button state, hotspot select, toggle, proof reveal
- damped: camera orbit, product rotation, scroll parallax
- spring: UI panels, cards, small objects, focus entry
- inertial: drag release, carousel, product spin, map pan
- magnetic: snap-to detail, assembly, component grouping
- collision: physical sandbox, tactile proof, playful assembly
- keyframed: camera rail, launch narrative, precise service sequence

## Realness Checklist

- object has mass: acceleration and deceleration make sense
- contact has consequence: shadow, scale, sound/vibration only if appropriate
- camera has intent: it reveals proof, not just motion
- materials respond: light, depth, blur, reflection, or particle field changes with state
- user never loses orientation
- interaction settles into a beautiful still
- reset is always available

## Stack Selection

- Motion: React UI gestures, spring/tap/drag, layout motion, lighter than GSAP for app UI.
- GSAP ScrollTrigger: pinned scroll, scrub, snap, multi-stage timelines.
- GSAP Draggable + Inertia: drag/toss/spin/flick; check licensing for Inertia.
- @use-gesture + react-spring/Motion: drag, pinch, wheel, move; good for custom tactile controls.
- Drei controls: OrbitControls, PresentationControls, CameraControls for 3D object/world inspection.
- Theatre.js: director timeline for camera/light/object choreography.
- Rapier / react-three-rapier: 3D physics when collision/assembly matters.
- Matter.js: 2D physics for tactile cards, parts, proof pieces.

## Failure Modes

- scroll theater with no control
- drag feels dead because release has no inertia/settle
- physics objects keep moving and never compose
- parallax causes nausea or hides content
- mobile touch conflicts with page scroll
- hover-only proof on mobile
- beautiful motion but no source-specific proof
- no reduced-motion equivalent
