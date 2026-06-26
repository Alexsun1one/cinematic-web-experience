# Material Transform Build Recipes

Use after `strategy/material-alchemy.md`.

## Particle Image Sampling

1. Load image into offscreen canvas.
2. Sample alpha/luminance/edges into target points.
3. Store target position and source color.
4. Animate from scatter/orbit/noise into target.
5. Add pointer/scroll only after recognizability works.
6. Reduced motion: render resolved state.

Acceptance:

- subject recognizable at rest
- particles are source-material-driven
- mobile particle count reduced

## Globe / Product Reveal

1. Verify texture suitability.
2. If a source/reference photo contains the product, extract or rebuild the product before creating any generic mesh.
3. Create one of: source cutout plane, approximate mesh, textured sphere from approved map, component sheet, or line/depth scaffold.
4. Repair/dim the backplate if the product remains duplicated behind the moving layer.
5. Add object-local controls: drag/rotate, local zoom, focus hotspots, reset, optional placement.
6. Add real proof orbits from source anchors.
7. Reduced motion: static source/product comparison plus usable hotspots.

Acceptance:

- no fake geography
- product appears in hero sequence
- hero object is traceable to source or declared generated component
- object can be locally controlled without whole-page zoom
- labels tied to facts

## Layered Asset Depth

1. Separate or fake 3-5 planes.
2. Keep exact text/logos in HTML overlay if needed.
3. Use parallax/camera movement to reveal hierarchy.
4. Provide inspectable still state.

Acceptance:

- asset stays recognizable
- depth clarifies mechanism
- no generic floating-card wall

## Source Photo Spatialization

Use for product photos, street photos, interiors, or generated reference plates.

1. Write a subject map.
2. Produce a material-to-layer table:

```text
| Source fragment | Web layer | Mechanism | Interaction | Fallback |
|---|---|---|---|---|
| product/body | subject cutout / mesh | rotate / tilt / zoom | drag + reset | still image |
| original background | clean backplate | parallax / camera rail | scroll / none | still image |
| detail area | macro layer | focus lens | click hotspot | detail card |
| perspective edges | SVG/linework | reveal / extrusion | scrub / scroll | static line drawing |
```

3. Choose the lightest spatial representation that preserves identity:
   - cutout PNG + CSS/Three plane for product/person/object
   - approximate mesh only when shape matters and can be made to resemble source
   - perspective planes for street/interior
   - linework first when segmentation is messy
4. Add shadows/contact/glints so the layer belongs to the scene.
5. Validate screenshot and reduced-motion still.

Acceptance:

- source-derived subject is the moving/inspectable center
- component asset paths are listed
- background is not a passive dump
- linework or fake 3D preserves original geometry

Reject:

- reference image as background + unrelated procedural hero
- monolithic generated beauty image for an inspectable product
- whole-page zoom pretending to be product zoom
- no repair/dim backplate when duplicated subject distracts

## Paper Stage Web World

1. Generate or use a paper-stage visual.
2. Identify carrier path/action stations.
3. Use scroll pan/zoom/hotspots.
4. Overlay exact labels if needed.

Acceptance:

- operator/action remains visible
- web path follows the paper-stage carrier
- image is not just a background
