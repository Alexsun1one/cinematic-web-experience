# Source Spatialization Pipeline

Use this whenever the page starts from a reference image, product photo, street/block photo, interior photo, generated plate, or "no asset yet" request. The goal is to turn source imagery into movable spatial material, not a static background.

## Core Correction

Hard failure:

```text
reference image -> full-screen background
unrelated code object -> placed on top
```

Correct route:

```text
source/reference -> subject map -> extraction/cleanup/componentization -> depth/line/3D/particle transform -> interactive page
```

The subject must come from the source or from an explicit generated component plan. Decorative Three.js, particles, glow, or cards cannot replace the subject.

## Subject Map

Before building, write:

```text
subject map:
- primary subject:
- secondary subjects:
- clutter to remove:
- background to preserve:
- exact visual cues to keep:
- can be reimagined:
- extraction route:
- spatial route:
- fallback still:
```

Reject the plan if the primary subject is vague or if the subject can be removed without breaking the page.

## Asset Routes

### A. Reference Image With Clear Subject

Examples: product photo, person, car, globe, furniture, device, building facade.

1. Crop or mask the subject.
2. Repair the backplate where the subject was removed or dimmed.
3. Create 2-5 foreground/depth planes: subject, details, shadows, glints, background.
4. Animate the subject with restrained 2.5D transform: parallax, tilt, orbit, scale, focus, light sweep.
5. Add code-generated geometry only as a support layer: shadow catcher, hotspot positions, particle edge, brass/glass/line accent.

Acceptance: the moving foreground still looks like the source subject.

### B. Complex Street / Block / Interior

Examples: street lighting, retail block, exhibition hall, campus, room.

1. Separate the scene into spatial layers: sky/deep background, buildings, road/floor, trees/signage/people, proposed fixtures, foreground.
2. Clean visual noise: remove irrelevant vehicles, signs, crowds, wires, trash, or clutter when they do not serve the proposal.
3. Preserve geometry cues: facade rhythm, road edges, vanishing point, entrances, landmarks.
4. Create a fake 3D scene using CSS/Canvas/WebGL planes aligned to perspective, or redraw a simplified line/mesh model.
5. Add meaningful interaction: camera pan, before/after scrub, hotspot focus, lighting cone toggle, route walk-through.

Acceptance: the viewer can understand the original place and the proposed intervention without a static PPT slide.

### C. No Reference Image

If the user has no reference image, do not generate one monolithic pretty background when interactivity is needed.

Generate or construct components:

- hero subject/object plate
- clean background/backplate
- material macro/detail plate
- foreground glints/shadows
- linework/depth guide
- optional UI/proof labels as HTML, not baked text

Then composite them in the webpage as separate layers. A single generated image is acceptable only when the deliverable is primarily cinematic stillness, not inspection or interaction.

### D. Linework / Sketch / Edge Route

Use this when the source is cluttered, perspective matters, or realistic segmentation is too expensive.

1. Extract or redraw dominant edges: skyline, facade rhythm, road edges, product silhouette, structural seams.
2. Simplify into a clean technical/architectural line drawing.
3. Use the line drawing as a depth scaffold: SVG paths, CSS 3D planes, Three.js line segments, or particle paths.
4. Add material plates or colors behind it only after the structure reads.
5. Animate along the lines: reveal, scan, extrusion, particle travel, light-path, camera rail.

Acceptance: the linework explains the object/place better than the raw photo.

## Technique Menu

Choose the lightest route that gives spatial control:

| Need | Technique |
|---|---|
| product/person/object moves but stays recognizable | cutout PNG + CSS/Three plane tilt/parallax |
| product has cylindrical/spherical form | photo cutout + procedural mesh support or approximate 3D rebuild |
| complex street becomes navigable | perspective planes + cleaned backplate + SVG route/hotspots |
| cluttered scene needs clarity | linework extraction/redraw + particle/path animation |
| real product has no model | Image Gen component sheet + code approximate mesh |
| exact geometry matters | ask for CAD/model or keep as 2.5D proof, label assumptions |

## Prompt Requirements

For Image Gen/editing, prompts must name:

- primary subject and preserved cues
- what is removed or cleaned
- separate output component needed
- camera/perspective/depth role
- web layer role
- negative constraints

Do not prompt only for "beautiful cinematic hero". Prompt for usable parts.

## QA Gate

Fail if:

- the source/reference is only a background
- a generic code object replaces the provided subject
- no extraction, cleanup, component, line, or depth plan exists
- the subject is less recognizable after animation
- clutter hides the intended intervention
- linework/3D stylization loses the original geometry
- generated components have no declared web layer role

Pass evidence:

- source image
- subject map
- extracted/cleaned/generated component paths
- material -> spatial mechanism map
- desktop screenshot showing the subject as the moving/inspectable center
- reduced-motion still that still reads
