# Effect Recipes

Use these as implementation recipes after the material route is selected.

## Particle Image Reveal

Use for portraits, logos, product photos, and objects.

Implementation outline:

1. Load image into an offscreen canvas.
2. Fit image into a sampling rectangle.
3. Sample pixels every `gap` pixels.
4. Keep points where alpha > threshold and luminance/edge density passes the route.
5. Store target `{x, y, color}` plus random scatter origin.
6. Animate particles from scatter/orbit/noise into target positions.
7. Add pointer disturbance and scroll progress only if it does not hurt recognizability.
8. On reduced motion, render the resolved image/particles statically.

Quality defaults:

- Start with 2,000-8,000 particles, fewer on mobile.
- Cap DPR to 2.
- Use source colors for recognizability, or map to a curated palette for luxury.
- Ensure resolved state is recognizable within 2 seconds.

## Rotating Globe From Image

Use for Earth, maps, global business, export, cultural travel, or planetary metaphors.

Implementation outline:

1. Prefer an equirectangular texture.
2. Create Three.js scene, perspective camera, renderer.
3. Add sphere geometry with texture material.
4. Add atmosphere shell using transparent additive material.
5. Add subtle directional/rim light.
6. Rotate slowly; let scroll or pointer adjust rotation only subtly.
7. Add orbiting labels or pins from actual source anchors.
8. On mobile, reduce geometry segments and pixel ratio.

Quality defaults:

- Use dark background only if it helps the globe; avoid generic space wallpaper.
- Pin labels to meaningful coordinates only when coordinates are known.
- If coordinates are not known, use orbit cards detached from the sphere, not fake geography.

## Layered Image Depth

Use for screenshots, product photos, generated hero plates, and paper-stage images.

Implementation outline:

1. Separate source into planes: background, object, labels, glow, foreground cards.
2. If no depth layers exist, create 3-5 clipped planes from the image or use Image Gen to produce a layered plate.
3. Use CSS 3D or Three.js planes.
4. Scroll moves camera or planes at different rates.
5. Keep a crisp inspectable state where the user can understand the content.

Quality defaults:

- No more than 5 major planes.
- Keep text on HTML overlay when exactness matters.
- Motion should reveal hierarchy, not wobble.

## Paper-Stage Scroll World

Use when `paper-operators` or `article-visual-grammar` creates a tactile scene.

Implementation outline:

1. Generate or use a 16:9 paper-stage plate.
2. Identify carrier path, action stations, labels, and focal module.
3. Build scroll sections that zoom/pan through these stations.
4. Overlay exact labels/hotspots in HTML if model text is imperfect.
5. Use subtle parallax, not aggressive camera movement.

Quality defaults:

- The paper operator action remains visible.
- The carrier/path becomes the web visual spine.
- Do not crop away labels or focal action on mobile.

## Evidence Constellation

Use for documents, PDFs, pitch decks, and reports.

Implementation outline:

1. Extract 5-12 source anchors.
2. Cluster anchors into 3-5 themes.
3. Render nodes with semantic color roles.
4. Use connecting lines only for real relations.
5. Scroll zooms from thesis -> cluster -> evidence -> final synthesis.

Quality defaults:

- Avoid hairball networks.
- Every node label maps to source material.
- Use hover/focus details on desktop and tap/accordion details on mobile.

## Kinetic Brand Seal

Use for logos and brand marks.

Implementation outline:

1. Use SVG paths when logo vector exists.
2. If raster only, trace manually or use particles from alpha mask.
3. Animate assembly: fragments -> mark -> material seal.
4. Use brand palette and one premium material.
5. Preserve proportions.

Quality defaults:

- Do not distort the logo.
- Do not add fake brand elements.
- The final resolved mark must remain still long enough to read.
