# Material Alchemy Harness

Use this before planning any cinematic webpage. The user's material must become the mechanism, not decoration.

## Alchemy Contract

```text
material:
- type:
- subject:
- quality:
- must preserve:
- can transform:
- emotional temperature:
- strongest visual affordance:
- web transformation:
- why this is better than a flat image:
- failure mode:
```

Reject a plan if the transformation can be removed without changing the page.

## Route A: Photo To Particle Identity

Use for portraits, product photos, group photos, architecture, objects, or any image with a strong silhouette.

Transformation:

- Sample the image into particles by alpha/luminance/edge density.
- Let particles gather into the subject, scatter on scroll or pointer, then resolve into a sharp image or label.
- Use source colors sparingly; otherwise map particles into a luxury palette.

Best web mechanisms:

- Canvas 2D for single HTML.
- Three.js points for depth, bloom, and camera movement.
- Optional generated hero plate behind the particle field.

Quality gate:

- The subject is recognizable when particles gather.
- The particle field has a reason: revealing identity, memory, data, aura, or transformation.
- It is not a random star background.

## Route B: Earth / Map To Rotating Globe

Use when the user provides Earth, world map, city map, satellite, geography, export, global business, or cultural travel material.

Transformation:

- Convert a suitable equirectangular/world image into a sphere texture.
- Add subtle atmosphere, rim light, cloud/noise layer, and orbital labels tied to content.
- If the source is not suitable as a globe texture, generate or source a better texture first, then use the provided image as a visual reference or overlay plate.

Best web mechanisms:

- Three.js textured sphere.
- CSS/canvas fallback only for single HTML constraints.
- Scroll can rotate camera from global view to evidence or case-study orbits.

Quality gate:

- Globe texture is not stretched into nonsense.
- The globe serves the story: global reach, distribution, culture, data, time zones, or planetary scale.
- Labels orbit or anchor to meaningful points; no random satellites.

## Route C: Product / UI To Layered Artifact

Use for screenshots, app UIs, dashboards, product surfaces, or SaaS stories.

Transformation:

- Turn screenshots into stacked glass/paper/device planes.
- Use a lens or cutaway to reveal the decisive feature.
- Animate depth on scroll: shell -> workflow -> proof -> outcome.

Best web mechanisms:

- CSS 3D planes for single HTML.
- Three.js planes for camera depth and lighting.
- Image Gen can create a premium device/scene wrapper when screenshots are ugly.

Quality gate:

- The real product/screenshot remains inspectable.
- The depth effect clarifies hierarchy or mechanism.
- It does not become a generic floating dashboard.

## Route D: Document To Evidence Theater

Use for PDFs, reports, decks, proposals, whitepapers, and long briefs.

Transformation:

- Extract thesis, proof points, named entities, numbers, and tensions.
- Build a constellation, spatial cutaway, route map, or evidence gallery.
- Each visual node must bind to a source anchor.

Best web mechanisms:

- Canvas/WebGL constellation.
- Scroll-driven sections that zoom from thesis to evidence clusters.
- Paper Operators or Article Visual Grammar generated scenes for key beats.

Quality gate:

- Every section has a source anchor.
- Evidence is specific, not filler copy.
- The final page leaves one strategic takeaway.

## Route E: Brand / Logo To Kinetic Seal

Use for logos, names, campaign marks, personal brands, and product identities.

Transformation:

- Trace mark geometry into SVG paths, particles, or 3D seal layers.
- Animate assembly/disassembly as brand reveal.
- Build palette and material from brand cues.

Best web mechanisms:

- SVG path drawing.
- Canvas particle monogram.
- CSS/Three bevel or foil material.

Quality gate:

- Logo proportions are not distorted.
- Brand is present in first viewport.
- Motion feels like identity, not a loading spinner.

## Route F: Image Gen As Missing Material

Use when user material is absent, too low quality, or cannot carry the desired luxury.

Transformation:

- Generate one or more hero plates, textures, objects, or scenes.
- Use `master-styles` for art direction tokens.
- Use `paper-operators` or `article-visual-grammar` if the web needs a tactile explainer scene or document-derived visual system.
- Use the generated asset inside the webpage as a texture, scene, card, gallery plane, or scroll chapter.

Quality gate:

- The generated asset is not a standalone poster accidentally placed in a page.
- Web motion reveals, cuts, fragments, lights, or spatializes the asset.
- Text in generated assets is native only when readable; otherwise reserve overlay containers.

## Transformation Table

| Material Affordance | Make It Into |
|---|---|
| strong silhouette | particle identity reveal |
| circular/planetary object | rotating object/globe |
| map/grid/territory | interactive route/terrain |
| screenshot or interface | layered device/cutaway |
| dense report | evidence constellation |
| logo geometry | kinetic emblem/seal |
| texture/material sample | shader/background material |
| multiple photos | depth gallery/spatial wall |
| historical/cultural material | archive theater/paper-stage web scene |
| emotional/personal material | soft room/weather/light field |

## Repair Moves

If it is generic:

```text
Name the exact source material and force it to become a mechanism: particles, globe, layered planes, cutaway, route, seal, or evidence theater.
```

If it is ugly:

```text
Generate or edit a stronger hero plate first; then web-compose it with restrained motion and better typography.
```

If it is all effect:

```text
Bind every motion beat to source anchors and viewer takeaway. Remove effects that do not reveal or transform material.
```
