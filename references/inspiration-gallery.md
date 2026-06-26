# Inspiration Gallery

Use this when the user asks for "炫技", a visual precedent, or a template direction. These are references for pattern extraction, not a license to copy visual identity, copywriting, models, or proprietary assets.

Checked on 2026-06-26. Re-check URLs and licenses before vendoring code.

## Adaptation Rule

For every reference, record:

```text
reference:
- route:
- what to learn:
- what not to copy:
- how it becomes the user's material:
- license/offline risk:
```

If the result still looks like the reference after swapping in user assets, the adaptation failed.

## Open-Source / Implementation References

| Reference | Route | Learn | Adaptation |
|---|---|---|---|
| Three.js repo/docs/examples, https://github.com/mrdoob/three.js | Core 3D/WebGL | scene/camera/render loop, WebGL/WebGPU/CSS3D/SVG addon lanes | use as implementation foundation |
| R3F examples, https://r3f.docs.pmnd.rs/getting-started/examples | React 3D components | shopping selection, cards, reusable interactive scene patterns | use for inspectable product UI grammar |
| Drei, https://github.com/pmndrs/drei | R3F helper layer | cameras, controls, HTML overlays, loaders, environments | use helpers intentionally, not as visual identity |
| react-postprocessing, https://github.com/pmndrs/react-postprocessing | Premium rendering finish | bloom, depth of field, color treatment with less boilerplate | use only when material/light benefits |
| ParticleSaga, https://github.com/blakecarroll/particle-saga | Particle image/model gallery | images/models rendered as particles in Three.js | adapt to photo/logo/product silhouette particles |
| Codrops dreamy GPGPU particles, https://tympanus.net/codrops/2024/12/19/crafting-a-dreamy-particle-effect-with-three-js-and-gpgpu/ | High-end particle field | GPU-driven glowing particles and interactivity | use for photo-to-particles or material aura |
| Codrops dissolve shader + particles, https://tympanus.net/codrops/2025/02/17/implementing-a-dissolve-effect-with-shaders-and-particles-in-three-js/ | Material transform / reveal | object dissolve, emissive edge, particles from mesh | use for product transformation, before/after reveal |
| Codrops tropical particles, https://tympanus.net/codrops/2021/03/17/tropical-particles-rain-animation-with-three-js/ | Particle rain / image atmosphere | dense particle field with physics-like behavior | use as texture/weather/material effect, not wallpaper |
| Bruno Simon public repos, https://github.com/brunosimon | Game-like portfolio/world | vehicle/world interaction, room-scale WebGL, physics-like navigation | learn "操控世界" paradigm; do not clone the portfolio world |
| Bruno Simon folio-2025, https://github.com/brunosimon/folio-2025 | Full world architecture | Blender export, compression, grouped objects, rendering/monitoring thinking | learn production pipeline for high-end 3D |
| Three.js 3D room forum example, https://discourse.threejs.org/t/my-personal-portfolio-website-3d-room/63822 | Room/world portfolio | lightmaps, CSS3D, room navigation, source code shared | adapt for showroom/interior/exhibition route |
| 3D product configurator, https://github.com/Madewill/3d-product-configurator | Inspectable product | R3F/Drei product model, color picker, view angles | adapt to rotate/zoom/material swatches |
| img-comparison-slider, https://github.com/sneas/img-comparison-slider | Before/after | simple web component for wipe comparison | adapt to street lighting, renovation, treatment proof |
| three-globe, https://github.com/vasturiano/three-globe | Earth/global proof | arcs, points, polygons, labels on a globe | adapt to globe products, export, logistics, tourism |
| react-three-rapier, https://github.com/pmndrs/react-three-rapier | Physics/object freedom | collision, rigid bodies, component assembly | adapt to assembly lab or tactile interaction |
| kr8tiv 3D Product Website Builder skill, https://github.com/kr8tiv-io/kr8tiv-ai-website/blob/master/SKILL.md | Skill precedent | product image/video -> scroll-orbit website framing | learn skill scope; keep our material-routing harness stricter |

## Public Inspiration Galleries

Use these for art direction and current visual vocabulary, then rebuild from the user's material.

| Gallery | Use | Caution |
|---|---|---|
| Codrops Three.js hub, https://tympanus.net/codrops/hub/tag/three-js/ | current creative WebGL/Three patterns: pixel effects, fluid reveal, 3D galleries, R3F grids, physics, tunnels | individual demos have separate code/license; inspect before reuse |
| Awwwards Three.js, https://www.awwwards.com/websites/three-js/ | high-end 3D websites, product showcases, visual polish | inspiration only unless code/license is explicit |
| Awwwards WebGL, https://www.awwwards.com/websites/webgl/ | cutting-edge WebGL art direction and interaction | often proprietary; do not copy assets or layout |
| Awwwards 3D, https://www.awwwards.com/websites/3d/ | broad 3D web references across industries | use for mood and interaction vocabulary only |

## Route Presets From References

### Product Showroom

Reference mix: R3F examples + Drei + product configurator + react-postprocessing.

Adapt:

- hero product is the user's object
- user can rotate, zoom, focus hotspots
- optional material/color swatches
- proof labels sit near real product details

### Photo / Logo To Particles

Reference mix: ParticleSaga + Codrops GPGPU particles + Codrops tropical particles.

Adapt:

- sample the user's image, logo, silhouette, or texture
- resolved state must be recognizable
- scatter/gather motion must explain identity or transformation

### Proposal Before/After

Reference mix: img-comparison-slider + Codrops dissolve + GSAP/Three timeline.

Adapt:

- preserve original state
- generated future state is labeled
- slider/scrub/toggle exposes intervention
- focus hotspots explain the proposed work

### Globe / Global Proof

Reference mix: three-globe + Three.js/R3F scene.

Adapt:

- use real product/map/world data when available
- globe can transform into physical globe product
- arcs/labels must map to source facts

### Interactive World

Reference mix: Bruno Simon repos + Three.js room example + Rapier.

Adapt:

- user moves through a client-specific world
- movement reveals evidence and details
- reset/fallback states are mandatory

## Anti-Copy Policy

- Do not copy proprietary Awwwards layouts, assets, text, or 3D models.
- Do not ship Codrops demo code unmodified as client work.
- Do not use a reference if its license is unclear and code reuse is required.
- Preserve license notices when vendoring open-source code.
- The user's material must be more visible than the reference style.
