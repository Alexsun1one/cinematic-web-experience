---
name: cinematic-web-experience
description: "Orchestrate premium all-industry client-presentation webpages and interactive visual prototypes from user-provided materials, images, products, brands, PDFs, decks, documents, data, service proposals, spaces, campaigns, or vague ideas. Use when the user wants one skill to create an extremely beautiful, luxury, cinematic, smooth, material-driven webpage or client demo: single HTML, offline local site, WebGL/Three.js, particles, rotating globe/earth/product, photo-to-particles, before/after simulation, data command center, evidence theater, service journey, scroll storytelling, Image Gen assisted hero scenes, 客户展示网页, 全行业方案可视化, 炫技网页, 丝滑特效, 粒子效果, 3D旋转, 奢华网页, 素材做进网页里. Routes into Image Gen, master-styles, paper-operators, article-visual-grammar, cover/card/sticker skills, and frontend QA so source materials become the core web mechanism rather than a generic animated landing page."
---

# Cinematic Web Experience

Create a browser experience where client material becomes the visual mechanism. This is a total-control skill: research, planning, brand route, material alchemy, linked visual skills, image prompts, asset generation, frontend build, screenshot QA, and repair loop.

It is not a library list and not a landing-page template. It is industry-agnostic: it turns any product, proposal, space, service, document, data story, campaign, institution, personal brand, or vague commercial idea into an interactive visual prototype: the thing a PPT/Word document cannot show. A successful result should feel like a bespoke product presentation, proof theater, simulation, or brand world that could not exist without the user's material.

## Operating Sequence

For every non-trivial request, run this sequence:

```text
1. intake        -> read materials and extract source anchors
2. research      -> look up product/domain/technical references when current facts matter
3. route         -> choose product/brand route and material/proposal transformation
4. orchestration -> split research, visual direction, build, and QA when useful
5. skill plan    -> choose linked skills and exact jobs
6. asset plan    -> extract, clean, componentize, generate, or prepare hero/detail/spatial assets
7. reference     -> choose inspiration/template family without copying
8. web spec      -> create the canonical web figure spec
9. build         -> implement page around the transformed material
10. QA           -> screenshot, nonblank canvas/3D, beauty gate
11. repair loop  -> fix the highest-leverage failure and re-verify
```

Do not skip from user request directly to code.

## Hard Gates

These are blockers, not advice:

- **Material Transform Gate**: name the exact source material and what it becomes. If removing the transformation leaves a usable page, reject the plan.
- **Subject Spatialization Gate**: if a reference image/photo/generated plate exists, name the primary subject, how it is extracted/cleaned/componentized, and how it becomes movable/depth/line/3D material. Reject any page where the reference is just a background and an unrelated code object is placed on top.
- **Background Plate Ban**: if a source or generated reference contains the hero subject, that subject must become the manipulated/inspectable object, or be intentionally removed and replaced with declared components. No "pretty scene as background + procedural object on top".
- **Component Evidence Gate**: every image-led build must list component outputs: subject cutout or generated subject, clean backplate, depth/line guide, detail/macro layers, shadows/glints, foreground/background planes, and fallback still.
- **Subject Identity Gate**: the manipulated object must preserve the source subject's silhouette, material cues, geography, interface, facade rhythm, or other identity cues that make it recognizable.
- **Physical Manipulation Gate**: inspectable products need object-local control: drag/rotate, local zoom, focus/detail, optional placement/assembly, bounds, inertia/settle, reset, and reduced-motion equivalent. Whole-page zoom or decorative spin does not pass.
- **SSS Quality Gate**: for premium/client-facing requests, run repair loops until the route, subject, mechanism, interaction, visual craft, proof, and performance gates all pass with evidence.
- **First Viewport Specificity Gate**: the hero screenshot must be client/material-specific. If it could belong to any AI startup, reject.
- **Linked Skill Proof Gate**: every linked skill used must produce a concrete artifact: `master-styles` tokens, `article-visual-grammar` source anchors/spec, `paper-operators` what-breaks-if-removed, Image Gen output path, etc.
- **Template Contamination Gate**: do not ship the bundled scaffold materially unchanged. Generic prism/orbit/panel/card patterns are failures unless rebuilt around source material.
- **Proof Density Gate**: every major section after the hero binds to a real source anchor, asset fragment, quote, number, stakeholder, map point, screenshot region, product feature, or generated visual asset.
- **Simulation Truth Gate**: if showing a proposed future state, label assumptions and preserve the original source. Do not imply engineering accuracy unless actually modeled.
- **Inspection Freedom Gate**: if the offer is inspectable, the user must be able to rotate, zoom, compare, focus, scrub, toggle, or enter detail meaningfully.
- **Context Budget Gate**: do not load every reference. Route first, then read only the relevant planner, strategy, linked-skill, build, and QA files.
- **Beauty Gate**: desktop and mobile screenshots must score 4/5+ on memorability, typography, composition, material specificity, and non-genericness.

## Minimal Read Plan

Read only the route-needed references:

1. Always read `references/route-engine.md`.
2. Always read `references/industry-atlas.md` unless the request is clearly a narrow follow-up to an existing route.
3. Always read `references/planner/intake-schema.md`, `references/planner/web-figure-spec.md`, and `references/planner/context-budget.md`.
4. Read `references/orchestration/loop-harness.md` for non-trivial builds.
5. Read one strategy file:
   - `references/strategy/universal-brief-router.md` for cross-industry routing or vague requests.
   - `references/strategy/material-alchemy.md` for asset transformations.
   - `references/strategy/brand-register.md` for product/industry route.
   - `references/strategy/experience-archetypes.md` for hero/spine preset.
   - `references/strategy/proposal-to-simulation.md` for street, lighting, architecture, space, service, or future-state demos.
   - `references/strategy/component-grammar.md` for free interaction, inspection, physics, and component assembly.
6. Read linked-skill briefs selected by the route in `references/linked-skills/`.
7. Read `references/interaction-feel-atlas.md` and `references/effects-catalog.md` when the user asks for dynamics, real handfeel, interaction, animation, 3D, particles, physicality, or "高级感".
8. Read `references/strategy/source-spatialization-pipeline.md` whenever the task involves a reference image, product photo, street/block/interior photo, generated plate, missing reference assets, subject extraction, cleanup, fake 3D, linework, or making a photo move.
9. Read prompt packs from `references/prompts/` only if generating/editing assets or doing domain research.
10. Read `references/inspiration-gallery.md` when the route needs a visual/technical precedent.
11. Read `references/template-families.md` before choosing a scaffold or reusable pattern.
12. Read one build file from `references/build/`.
13. Read `references/qa/beauty-gate.md`, `references/qa/perf-a11y.md`, `references/qa/interaction-feel-gate.md`, and `references/qa/sss-quality-gates.md`.

Cap linked skills at two primary engines plus one style helper unless the user explicitly asks for a broad exploration.

## Subagent Orchestration

When the task is broad, high-stakes, or asset-rich, split work instead of stuffing all thinking into one context window. Use `references/orchestration/multi-agent-workflow.md`:

- researcher: domain examples, current libraries, references, client/product facts.
- designer: visual paradigm, interaction grammar, aesthetic register, failure critique.
- architect: route, build lane, data contracts, context budget.
- builder: implement only after route/spec/assets are concrete.
- verifier/critic: screenshot evidence, hard gates, mobile, genericness, source anchoring.

The main agent owns synthesis. Subagents provide evidence and options; they do not decide the final route alone.

## Product Paradigm

Treat every output as one of these products:

- **Inspectable Object**: a product, artifact, globe, device, furniture, or craft object that users can rotate, zoom, open, compare, and inspect.
- **Future-State Simulation**: a street, shop, interior, campus, service, or operation shown before/after the proposed intervention.
- **Evidence Theater**: a document, report, pitch, method, or proof package turned into a navigable proof world.
- **Identity World**: a person, team, brand, logo, or place turned into a material/particle/scene identity system.
- **Interactive Proposal**: a client plan where users scrub, toggle, focus, assemble, or enter the outcome instead of reading static slides.

The default promise is "show, touch, inspect, compare, and believe", not "read a prettier deck".

## Subject-First Asset Rule

Do not treat a reference image as a passive backdrop. For product, street, interior, portrait, object, or generated reference images, first decide the subject pipeline:

```text
source/reference -> subject map -> extraction/cleanup/componentization -> depth/line/3D/particle transform -> page
```

Examples:

- Product/globe photo: cut out the product, dim or repair the backplate, create foreground/detail/shadow/glint layers, then animate the cutout as 2.5D or rebuild an approximate mesh that resembles it.
- Complex street/block: preserve geometry and landmarks, clean visual noise, split facades/road/trees/signs/lights into planes, then use camera pan, before/after lighting, hotspots, linework, or particle paths.
- No reference image: generate components separately, not one pretty monolithic image: subject plate, clean backplate, material macro, foreground glints, line/depth guide, and HTML labels.
- Cluttered or hard-to-segment source: extract/redraw linework first, then animate lines, particles, extrusion, camera rails, or simplified 3D planes.

If the source subject is replaced by a generic procedural object, the build fails unless the user explicitly requested an abstract concept demo.

## Real Handfeel Rule

Every interactive demo needs a named feel model, not just "smooth animation".

```text
feel model:
- input: hover / tap / drag / wheel / pinch / scroll / keyboard / pointer lock
- response: immediate / damped / spring / inertial / magnetic / physical collision / cinematic keyframe
- object behavior: rotate / zoom / compare / scrub / assemble / collide / drill down / enter world
- material response: light, shadow, blur, parallax, particle, sound/vibration only when appropriate
- rest state: polished still after interaction settles
- reduced motion: static or low-motion equivalent
```

If interaction does not improve seeing, believing, comparing, inspecting, controlling, or feeling the offer, remove it.

For product demos, the product must be the controlled object. Required controls are object-local: drag to rotate or place the product, wheel/pinch or visible buttons to zoom the object/camera, hotspots to inspect details, and a reset that restores position, rotation, zoom, focus, and chapter. A page-level zoom, passive auto-spin, or parallax background is not "真实物理效果".

## Universal Industry Rule

Never reduce the skill to the example industries in this file. The examples are smoke tests, not scope limits. For any industry, route by:

```text
1. belief job: what must the client believe?
2. subject type: object / place / person / process / data / service / policy / event / identity / future state
3. material: photo / video / CAD / screenshot / deck / PDF / map / spreadsheet / logo / transcript / sketch / no asset
4. proof mode: inspect / compare / simulate / configure / navigate / drill down / assemble / timeline / command center
5. aesthetic register: luxury / clinical / institutional / playful / editorial / industrial / cultural / technical / calm
```

Use `references/industry-atlas.md` and `references/strategy/universal-brief-router.md` to map unfamiliar sectors. If the industry is not listed, classify it through the five dimensions above and continue.

Do not force every route into globe, particle, or 3D. The best route is the mechanism that makes the user's real subject easiest to understand, desire, trust, compare, or control. A regulated finance proof page may need calm evidence, a street proposal may need cleaned before/after spatial planes, a toy may need physics, a textile may need macro material, and a report may need evidence theater.

## Route Examples

These are examples of the expected thinking:

- **地球仪产品**: product photo/map -> rotating Earth/proof globe -> scroll transforms into physical globe product -> orbit labels tied to product facts/markets/materials -> Three.js/R3F route.
- **街区灯光改造**: source street photo/site plan -> before/night lighting simulation -> click-to-focus poles/facades/signage/path safety -> slider/toggle/scrub between old/new -> assumptions labeled.
- **可检查实体产品**: product photo/CAD/detail shots -> interactive object showroom -> rotate, zoom, exploded detail, material swatches, proof labels -> product remains inspectable at rest.
- **服务/方案落地**: proposal/deck/process -> simulated journey or operations room -> user can step through before/after, bottleneck, intervention, result.
- **人物/顾问照片**: portrait -> particle identity reveal -> proof markers and case evidence gather around face -> optional `master-styles` portrait tokens -> canvas/WebGL route.
- **纺织/家具/美妆材料**: fabric/wood/serum textures -> material desire stage -> macro surface/light/cutaway -> generated hero plate if source is weak.
- **PDF/提案/报告**: document -> evidence constellation or paper-stage proof world -> source anchors drive sections -> `article-visual-grammar` route.
- **文化旅游/展览**: place imagery/archive -> cultural route atlas/night world -> `paper-operators` or Image Gen scenes -> scroll gallery/worldbuilding route.
- **SaaS/产品截图**: screenshot -> layered artifact cutaway -> interface remains inspectable -> React/Three or CSS 3D route.
- **复杂街区照片**: raw street photo -> clean clutter, preserve facade/road geometry, split into perspective planes or redraw linework -> fake 3D walkthrough / before-after lighting / route particles -> assumptions labeled.
- **无参考图产品演示**: generate object, backplate, macro detail, foreground glints, and line/depth guide as separate assets -> composite and animate in page -> not a single static hero image.

## Build Expectations

Unless the user asks for strategy only, deliver a working page:

- Single HTML only when portability/offline sharing matters and the effect can meet the beauty gate.
- Vite/React/Three.js for real 3D, globe, spatial gallery, post-processing, multiple assets, or productized reuse.
- Image Gen before code when the hero/world/material asset determines layout.
- Prompt packs before Image Gen when user material must be transformed into a believable scene.
- Physics/interaction libraries only when collision, drag, inertia, assembly, or object handling explains the offer; otherwise use choreographed motion.
- Dev server URL for app builds; absolute file path for HTML deliverables.
- Screenshot evidence and QA notes in the final response.

## Repair Loop

Repair by failure layer:

- Generic page -> redo route and hero mechanism before touching CSS.
- Beautiful but disconnected -> keep composition, replace content with source-bound evidence.
- Weak source asset -> generate/edit asset first, then rebuild around it.
- Over-animated -> freeze motion, inspect static screenshots, reintroduce only meaningful motion.
- Linked-skill failure -> repair upstream spec/image, not downstream with CSS cosmetics.

Always end with: biggest failure named, one repair action chosen, screenshots rerun.

For SSS-level delivery, one loop is rarely enough. Inspect the actual screenshot/recording, name the highest-leverage failure, repair that layer, and rerun evidence. Do not stop at "works" when the user asked for premium or client-facing.

## Resource Map

- `references/route-engine.md`: deterministic routing by material, product type, and delivery mode.
- `references/industry-atlas.md`: cross-industry mapping by belief job, subject, material, proof mode, and aesthetic register.
- `references/planner/intake-schema.md`: source anchors, preserve/transform rules, evidence inventory.
- `references/planner/web-figure-spec.md`: canonical artifact between planning and build.
- `references/planner/context-budget.md`: context discipline for Codex and subagents.
- `references/orchestration/multi-agent-workflow.md`: automatic decomposition roles and handoff contracts.
- `references/orchestration/loop-harness.md`: route, prompt, asset, build, and QA loops.
- `references/inspiration-gallery.md`: public/open-source effect references, adaptation rules, and anti-copy policy.
- `references/template-families.md`: reusable product-template families and when to choose them.
- `references/interaction-feel-atlas.md`: handfeel, motion taste, gesture, camera, physics, and response models.
- `references/effects-catalog.md`: effect-to-purpose catalog for particles, shaders, scroll, physics, comparison, data, and 3D.
- `references/strategy/material-alchemy.md`: source-material to web-mechanism harness.
- `references/strategy/source-spatialization-pipeline.md`: subject extraction, cleanup, component assets, linework, fake 3D, and reference-image-to-moving-page rules.
- `references/strategy/universal-brief-router.md`: industry-agnostic router for vague or novel client requests.
- `references/strategy/brand-register.md`: product/brand routes and examples.
- `references/strategy/experience-archetypes.md`: hero ownership and visual-spine presets.
- `references/strategy/proposal-to-simulation.md`: turn proposals, spaces, and future states into interactive visual prototypes.
- `references/strategy/component-grammar.md`: rotation, zoom, focus, comparison, physics, assembly, and free component rules.
- `references/linked-skills/*.md`: exact job contracts for master-styles, article-visual-grammar, paper-operators, cover/card/sticker skills, and Image Gen.
- `references/prompts/*.md`: prompt packs for Image Gen, style direction, technical research, and asset repair.
- `references/build/*.md`: single HTML, React/Three, and material transform implementation guidance.
- `references/qa/*.md`: beauty, proof, performance, accessibility, and screenshot gates.
- `references/qa/sss-quality-gates.md`: evidence-based SSS repair loop and non-negotiable delivery gates.
- `scripts/asset_manifest.py`: inspect image assets for dimensions, alpha, palette, and possible routes.
- `scripts/route_skill_plan.py`: produce a minimal route/read plan from a compact brief.
- `scripts/beauty_gate.py`: structured page evidence and beauty-gate checker.
- `scripts/interaction_plan.py`: map desired dynamic feel to interaction/effect stack and gates.
- `scripts/validate_cinematic_page.py`: static HTML QA with material-transform flags.
- `assets/template-kits/*.html`: runnable local scaffolds for selected families; must be rebuilt around user material before delivery.
- `templates/*.md`: reusable specs for route plans, web figure specs, smoke cases, and decision briefs.

## Delivery Contract

```text
delivery:
path or URL:
source material inventory:
material -> mechanism map:
brand/product route:
linked skills used and concrete outputs:
generated/edited assets:
web stack:
motion signature:
source anchors per section:
desktop screenshot:
mobile screenshot:
reduced/no-motion evidence:
canvas/3D nonblank evidence:
offline truth:
beauty gate score:
validation:
remaining risk:
```

For non-trivial work, include a concise decision brief for Sun: one-liner, what changed, risks and mitigation, the 1-2 decisions that are his to make, and what could not be verified.
