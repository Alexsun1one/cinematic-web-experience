# Image Generation Prompt Pack

Use when the web experience depends on a generated hero plate, future-state simulation, material macro, or atmosphere extension.

## Prompt Contract

```text
image prompt:
- source material:
- preserve exactly:
- transform:
- output component:
- web layer role:
- camera:
- material/light:
- composition:
- web use:
- negative constraints:
- truth label:
```

If the final webpage needs interaction, prompt for usable parts, not only a beautiful monolithic hero.

## Product Hero Plate

```text
Create a premium product presentation image based on the provided product reference. Preserve the product silhouette, proportions, logo placement, and material cues. Place it in a refined environment that amplifies [material/brand route]. Camera: [macro/three-quarter/orthographic/low-angle]. Light: [specific]. Leave clean negative space for HTML labels. Do not invent product controls, text, logos, or claims. Output should work as a web hero plate and remain inspectable at rest.
```

## Subject Cutout / Component Plate

```text
Create a clean isolated component plate of the primary subject from the provided reference: [subject]. Preserve silhouette, proportions, material cues, color family, logo/text placement if relevant, and distinctive hardware/details. Output should be usable as a foreground web layer for parallax, drag, rotate, zoom, or focus. Keep background transparent if supported, or plain neutral with strong separation. Do not change the subject into a different product. Do not add text, logos, claims, props, or a full scene.
```

## Clean Backplate

```text
Create a cleaned backplate from the provided reference image after removing or visually de-emphasizing [subject/clutter]. Preserve perspective, lighting direction, vanishing lines, floor/road/facade rhythm, landmarks, and material atmosphere. Repair the exposed area believably. Leave room for the extracted moving subject or HTML overlays. Do not introduce new hero subjects, signs, fake brands, crowds, or readable text.
```

## Linework / Depth Scaffold

```text
Create a clean linework/depth scaffold from the provided [street/product/interior] reference. Preserve the main silhouette, perspective, facade rhythm, road/floor edges, seams, openings, and important landmarks. Simplify noise into elegant architectural/product linework suitable for SVG/WebGL path reveal, particles, extrusion, or camera rail. No shading-heavy illustration, no decorative doodles, no fake labels.
```

## Foreground Glint / Shadow / Detail Layer

```text
Create a separate web layer for [glints/shadows/material detail/foreground accent] from the provided subject/reference. It should support compositing over the clean backplate and moving subject. Preserve light direction and material character. Keep it sparse and useful; no new product, no extra text, no decorative smoke.
```

## Component Sheet For No Reference

```text
Create separate components for a web-based interactive demo of [product/place/service]. Required outputs: hero subject plate, clean backplate, macro/detail plate, foreground glints/shadows, and line/depth guide. Make every component stylistically consistent and leave negative space for HTML labels. Do not merge everything into one static poster; each output must have a declared web layer role.
```

## Street Lighting Future-State

```text
Create a concept visualization of the same street after a lighting intervention. Preserve the street geometry, facade rhythm, sidewalk, entrances, trees, and recognizable landmarks from the source photo. Add warm/cool lighting according to [design intent], with visible pools of light on key pedestrian zones and facade highlights. Keep the result believable, not fantasy. Do not add crowds, signage, brands, or architectural changes unless specified. This is a concept visualization, not photometric simulation.
```

## Material Macro

```text
Create a high-end macro material plate from the provided [fabric/wood/glass/liquid/metal/ceramic] reference. Preserve color family and surface character. Emphasize tactile detail, controlled highlights, shallow depth, and premium restraint. Leave room for web overlays. Avoid generic luxury clichés, excessive gold, neon, smoke, or unrelated props.
```

## Evidence / Document World

```text
Create a visual proof world from the provided document anchors: [anchors]. The image should feel like an inspectable evidence theater, with source fragments, paths, and hierarchy. Keep text blocks as abstract or leave labels to HTML unless exact typography is required. Avoid fake charts or invented numbers.
```

## Negative Defaults

- no generic dark sci-fi dashboard unless the source demands it
- no meaningless particles
- no illegible text in generated images
- no fake measurements
- no invented brand marks
- no over-cropped source product
- no monolithic beauty background when the subject must be interactive
- no replacing the source subject with a different generic object
- no hiding clutter cleanup assumptions
