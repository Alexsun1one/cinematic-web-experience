# Material Alchemy

Source asset -> visual mechanism -> interaction -> proof.

## Contract

```text
material alchemy:
- exact source material:
- primary subject:
- subject map:
- strongest visual affordance:
- transformation:
- component outputs:
- web mechanism:
- narrative job:
- what breaks if removed:
- preservation risk:
- fallback:
```

If source material is a photo/reference/generation, read `source-spatialization-pipeline.md` before choosing effects.

## Core Routes

### Photo / Portrait -> Particle Identity

Use for people, experts, founders, product silhouettes, or recognizability.

- Sample image pixels into particles.
- Gather into recognizable subject; scatter into proof markers or case nodes.
- Keep face/product recognizable at resolved state.
- Use source colors or a luxury mapped palette.
- Reject if particles are just a starfield.

### Earth / Map / Globe Product -> Rotating World

Use for globe products, global reach, cultural export, tourism, logistics, markets.

- If texture is suitable, wrap to Three.js sphere.
- If product photo is a physical globe, start as cosmic Earth then transform/resolve into the actual product silhouette or product stage.
- If a reference image already contains a physical globe, extract/componentize that globe or rebuild an approximate controllable object that preserves its silhouette, color, material, ring, and base cues. Do not place an unrelated procedural globe over the reference.
- Use orbit labels tied to real facts, not fake satellites.
- Reject if texture stretches, geography lies, or product disappears.

### Product Photo -> Hero Object Theater

Use for physical products and luxury goods.

- Preserve product proportions.
- Create or declare a subject cutout / approximate mesh / component plate before building.
- Repair or dim the backplate if the product is removed from the original reference.
- Object-local controls are required when promising inspection: drag/rotate, zoom, focus detail, reset, optional placement.
- Build a staged environment from material cues: glass, metal, fabric, wood, ceramic, paper, light.
- Use scroll to reveal craft, layers, function, or proof.
- Reject if it becomes generic dark product render.

### Complex Photo -> Spatial Asset System

Use for streets, blocks, interiors, exhibitions, campuses, retail, or architectural proposals.

- Identify primary subject and intervention area.
- Clean clutter only when it does not carry proof.
- Split into depth planes or redraw linework when segmentation is too messy.
- Preserve vanishing point, facade rhythm, road/floor edges, landmarks, entrances, and material seams.
- Add before/after, camera rail, hotspot focus, light cones, route particles, or line extrusion only when they clarify the proposal.
- Reject if the raw photo is just a background or geometry is lost.

### Screenshot / Interface -> Layered Artifact

Use for SaaS and product UIs.

- Screenshot stays inspectable in at least one state.
- Layer into shell, decision flow, evidence, outcome.
- Use lens/cutaway for the decisive mechanism.
- Reject floating dark cards with no relation.

### Document / Deck / PDF -> Evidence Theater

Use for reports, proposals, whitepapers, education, consulting.

- Extract source anchors and proof clusters.
- Build constellation, route, cutaway, atlas, or paper-stage world.
- Each section maps to a claim/proof.
- Reject generic marketing copy.

### Texture / Material Sample -> Material Desire

Use for cosmetics, textile, furniture, food, craft.

- Make material visible: macro, weave, grain, liquid, surface, light.
- Motion reveals tactile quality: thread pull, droplet gather, wood cutaway, fabric fold.
- Reject if texture is a background only.

### Logo / Mark -> Kinetic Seal

Use for brand identity.

- Preserve proportions.
- Animate assembly from particles/SVG paths/foil layers.
- Resolve into still readable mark.
- Reject if logo is distorted.

## Asset Weakness Handling

If user assets are weak:

1. Preserve exact product/brand facts.
2. Generate components separately when interaction matters: subject plate, clean backplate, macro material plate, foreground glints, depth/line guide.
3. Use Image Gen to create supporting hero plate, material world, or background stage only after the subject/component plan is clear.
4. Embed original assets as proof artifacts, labels, texture samples, or product reference.
5. State that generated assets are interpreted, not official visuals.

## Anti-Pattern From Incident

```text
generated globe library plate as background
+ hand-coded generic globe in foreground
= failure
```

Why it fails:

- the reference subject is not extracted or controlled
- the procedural object does not preserve source identity
- generated asset has no component role
- interaction is spectacle rather than product manipulation

Correct repair:

- use the reference globe as subject cutout or approximate rebuild
- dim/repair the backplate
- build 2.5D/3D controls around the source-derived subject
- use generated scene only as environment, not product truth

## Removal Test

For every transformation, answer:

```text
If this transformation is removed, the page loses:
- identity recognition
- product truth
- proof structure
- emotional charge
- material desire
- global scale
- mechanism clarity
```

If none apply, remove the transformation.
