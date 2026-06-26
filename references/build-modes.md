# Build Modes

Choose the build mode before choosing effects.

## Mode A: Single HTML, Zero Dependency

Use when the user wants local/offline, one file, fast share, or no build step.

Pattern:

- Inline CSS and JS.
- Use Canvas 2D particles, CSS 3D transforms, SVG line effects, and IntersectionObserver.
- Use system fonts or embedded safe font stacks.
- Include `prefers-reduced-motion`.
- Keep the file below a few MB unless images are essential.

Starter:

- Copy `assets/single-html-cinematic/index.html` into the output location.
- Replace the sample content and visual metaphor.
- Keep the canvas, scroll reveal, reduced-motion, and responsive patterns.

Strength:

- Portable and offline.
- Easy to send to a client.
- No dependency risk.

Limit:

- Not true WebGL 3D.
- Complex models, shaders, and asset pipelines are impractical.

## Mode B: Single HTML with CDN Imports

Use when a one-file deliverable is acceptable but internet access is allowed.

Pattern:

- Inline CSS and app code.
- Import Three.js, GSAP, Lenis, or tsParticles from stable CDN URLs.
- Include a visible offline fallback if CDN import fails.
- Pin versions when possible.

Strength:

- Stronger effects than zero-dependency.
- Still easy to share.

Limit:

- Not offline.
- Some corporate networks block CDNs.

## Mode C: Offline Local Folder

Use when the result can be a folder but must run locally without internet.

Pattern:

- Use Vite or plain HTML folder.
- Vendor JS/CSS/assets into `vendor/`.
- Keep a `README` or launch note outside the skill if needed.
- Use relative paths only.

Strength:

- Real libraries with offline behavior.
- Can include images, model files, fonts, and videos.

Limit:

- Not a single file.
- Need to preserve license notices for vendored libraries.

## Mode D: Full App Build

Use when the request needs reusable components, rich 3D, multiple pages, interactive data, or future iteration.

Pattern:

- Vite + React when starting from scratch.
- Three.js directly for raw scenes; React Three Fiber + Drei for React.
- GSAP/ScrollTrigger or Motion for animation.
- Start a dev server and verify screenshots.

Strength:

- Best for sophisticated client demos and future productization.

Limit:

- More setup and dependencies.
- Must test build/dev server.

## Offline Decision

When the user says "offline":

- If they say "single HTML", use Mode A unless they explicitly accept inlined/vendored library payload.
- If they accept a folder, use Mode C.
- Do not call a CDN page "offline".

## Asset Decision

Use real/generative bitmap assets when the page needs emotional impact:

- Product/customer imagery.
- Generated hero scene.
- Abstract background plate.
- Section illustrations.

Keep generated assets local and reference them with relative paths in folder builds. For a single HTML, either inline small SVG/CSS/canvas effects or embed small images as data URIs only when file size remains reasonable.
