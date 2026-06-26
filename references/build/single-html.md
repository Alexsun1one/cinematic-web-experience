# Single HTML Build Lane

Use when the user needs one portable file or simple offline sharing.

## Suitable For

- particle portrait/logo from one local image
- lightweight evidence constellation
- CSS 3D layered planes
- before/after slider with two local images
- image pan/zoom/focus hotspots
- lightweight Matter.js-style 2D component lab if vendored
- SVG path/brand reveal
- simple scroll story

## Not Suitable For

- real 3D globe with high quality textures unless using vendored/inlined library code
- heavy post-processing
- multiple large assets embedded as base64
- complex productized reuse

## Rules

- Inline CSS/JS.
- No CDN if claiming offline.
- Use canvas/SVG/CSS transforms.
- Include `prefers-reduced-motion`.
- Use source assets as relative files unless truly embedding.
- If using a library, vendor it locally and state license/offline truth.
- Do not deliver the bundled scaffold unchanged.

## Single HTML QA

- Run `validate_cinematic_page.py`.
- Run `beauty_gate.py` with evidence JSON.
- Screenshot desktop and mobile.
- Confirm no horizontal overflow and no text clipping.
