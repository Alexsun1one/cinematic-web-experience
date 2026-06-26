# Performance and QA

Use this before claiming a cinematic webpage is done.

## Static Checks

For single HTML:

```bash
python3 /path/to/cinematic-web-experience/scripts/validate_cinematic_page.py /path/to/output.html
```

Fix failures. Warnings may be acceptable only if explained.

## Browser Checks

For any canvas, WebGL, or heavy animation page:

- Open desktop viewport around 1440x900.
- Open mobile viewport around 390x844.
- Confirm the hero is nonblank.
- Confirm no text overlaps or escapes controls.
- Confirm the primary canvas/3D scene is framed and visible.
- Confirm scroll does not trap the page.
- Confirm reduced-motion mode still shows all content.

When Playwright is available, take screenshots and inspect them. For WebGL/canvas pages, a pixel check is useful: the canvas should contain varied non-background pixels after load.

## Motion Budget

Good defaults:

- One primary continuous effect.
- One scroll-linked choreography.
- Small hover/focus interactions only where meaningful.
- No more than two independently animated background systems.

Avoid:

- Multiple full-screen canvases fighting each other.
- Scroll-jacking that prevents normal reading.
- Cursor effects that cover text.
- Particle counts that look good on desktop but melt mobile.
- Text animation that delays comprehension.

## Performance Defaults

- Respect `prefers-reduced-motion`.
- Cap device pixel ratio for canvas/WebGL, usually `Math.min(window.devicePixelRatio, 2)`.
- Pause or reduce background animation when tab is hidden if the page is long-running.
- Use `ResizeObserver` or robust resize handlers for canvas.
- Lazy-load heavy images/models.
- Avoid huge base64 assets in single HTML unless portability matters more than file size.
- Use CSS transforms and opacity for DOM animation.

## Accessibility

- Keep semantic `header`, `main`, `section`, and clear heading order.
- Interactive canvas effects must not be the only way to access content.
- Icon-only controls need labels.
- Ensure contrast in dark cinematic themes.
- Provide focus states for links/buttons.

## Acceptance Checklist

```text
subject visible in first viewport:
single memorable effect:
storyboard beats present:
desktop screenshot checked:
mobile screenshot checked:
canvas/3D nonblank:
reduced motion supported:
no obvious text overlap:
offline claim true:
dependencies/licenses noted:
```
