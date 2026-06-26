# Physics And Component Build Lane

Use when component freedom, collision, assembly, or tactile handling is central to the offer.

## Library Routes

- `@react-three/rapier`: 3D physics inside React Three Fiber; use for real object collisions, gravity, assembly, or spatial toys.
- `matter-js`: 2D rigid body physics; use for cards, parts, labels, draggable proof pieces, or lightweight single-page demos.
- direct pointer + springs: use when the motion only needs drag, inertia, snap, or focus without true collision.
- choreographed timeline: use when the user must see a precise proposal sequence rather than a sandbox.

## Build Rules

- physics must have a narrative job.
- deterministic rest state matters more than chaotic realism.
- provide reset and reduced-motion/static fallback.
- never hide source content inside an unstable simulation.
- cap object counts and DPR on mobile.

## Acceptance

- user can complete the core inspection/assembly without instructions
- motion settles into a polished still
- focus/zoom does not clip labels
- fallback communicates the same proposition
