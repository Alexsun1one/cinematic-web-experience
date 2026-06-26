# Component Grammar

Use this when the experience needs freedom: rotate, zoom, inspect, compare, scrub, drag, assemble, collide, or enter focus.

## Interaction Verbs

| Verb | Use For | Implementation | Gate |
|---|---|---|---|
| rotate | globe, product, artifact | Three.js controls, CSS 3D, pointer drag | object readable at rest |
| zoom | product detail, photo, map, plan | camera dolly, Panzoom, CSS transform | no text/image blur at focus |
| focus | hotspots, components, proof nodes | raycast/pointer, DOM overlay, modal/detail pane | focus target has source anchor |
| compare | before/after, old/new, claim/proof | slider, toggle, scrub timeline | both states preserved |
| scrub | construction, lighting, process, reveal | GSAP timeline, Theatre.js, custom state | timeline labels meaningful |
| assemble | product parts, system modules | spring/physics or choreographed transform | final state exact |
| collide | playful assembly, physical proof, tactile demo | Matter.js/Rapier only when useful | collision explains the offer |
| enter | street, exhibition, product world | camera move, section transition, focus tunnel | user can exit/back out |

## Component Tags

Use these as planning language, not necessarily literal React components:

```text
<World> scene container, scale, camera, light, background truth
<Subject> hero object/product/space/document/portrait
<Lens target="detail|zone"> zoom, cutaway, material inspection
<Compare mode="wipe|slider|morph"> before/after or claim/proof
<Sim state="proposal|built"> future state or scenario mode
<Hotspot anchor="source"> clickable proof/focus point
<FocusCard> exact detail surfaced after a hotspot
<Assembly physics="snap|collide|free"> component lab
<ProofTag anchor="real-source"> evidence label tied to source
<CameraRail> choreographed camera positions
<Fallback still> reduced motion / low-performance state
```

## Freedom Levels

```text
level 0: cinematic scroll only
level 1: toggle/scrub/compare
level 2: rotate/zoom/focus hotspots
level 3: draggable components / assembly
level 4: physics collision / sandbox
```

Default to the lowest level that proves the offer. Higher freedom increases QA cost.

## Interaction Purpose Test

Every interactive element must serve at least one verb:

- see clearly
- compare states
- enter focus
- assemble/change
- verify proof

If it does none of these, remove it.

## Object Contracts

Every inspectable object needs:

- identity: what it is
- source: original asset or generated assumption
- subject pipeline: extraction/cutout, generated component, approximate mesh, linework, or source-backed plane
- rest state: readable still
- active state: what user can do
- detail state: what new proof appears
- fallback: static still or comparison

## Physical Product Manipulation Contract

For product/object demos, "interactive" means the object itself is controllable. Page zoom, background parallax, or decorative spin are not enough.

Required:

- primary object is source-derived or explicitly generated as a component
- drag rotates or moves the object, not the whole page
- wheel/pinch or visible +/- controls zoom the object/camera locally
- pointer capture is used during drag so the object stays controlled until release/cancel
- rotation, zoom, and placement have min/max bounds
- reset returns object, camera, zoom, chapter, and focus to a readable default
- inertia settles quickly into a polished still; no endless drift
- if object placement is allowed, define bounds, snap targets, and collision/contact rules
- hotspots reveal real product detail, material, dimensions, use case, or source-backed proof
- reduced motion disables flourish but preserves inspection, zoom, reset, and hotspots

Reject if:

- a generic Three.js mesh replaces the real product/reference subject
- whole-page zoom masquerades as product zoom
- object rotates but cannot be focused, zoomed, reset, or inspected
- free drag has no semantic purpose
- physics does not teach assembly, placement, scale, or material behavior
- hover-only controls hide important proof

## Anti-Patterns

- free drag that does not teach anything
- physics added for spectacle only
- object can rotate but has no details
- zoom reveals pixelated or fake content
- comparison slider compares two unrelated images
- hotspots hide critical content behind hover only
