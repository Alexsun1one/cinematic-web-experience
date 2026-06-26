# Performance And Accessibility QA

## Required Checks

- desktop screenshot around 1440x900
- mobile screenshot around 390x844
- reduced-motion path
- no horizontal overflow
- canvas/3D nonblank if used
- text readable and not clipped
- primary content accessible without canvas interaction
- semantic HTML sections
- focus states for controls
- image alt/aria labels where meaningful
- reset/escape path for focus, zoom, camera, and assembly interactions
- comparison states keyboard/touch accessible

## Motion Budget

- one primary continuous hero effect
- one scroll choreography
- small hover/focus only when meaningful
- no more than two animated background systems
- all animations must have a removal test
- physics/collision only when it explains the offer

## WebGL Defaults

- cap DPR to 2
- reduce particles/segments on mobile
- lazy-load heavy assets
- pause or reduce when tab hidden/offscreen
- static fallback for reduced motion

## Offline Truth

State one:

- true single file, no external URLs
- local folder, relative assets
- CDN-dependent single page
- dev server/app build

Do not call CDN-dependent pages offline.
