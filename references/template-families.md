# Template Families

Templates are not fixed pages. They are reusable cross-industry paradigms with slots, controls, and gates. Pick one primary family and at most one secondary family.

## 1. Inspectable Product Showroom

Use for: globe, hardware, furniture, craft, luxury object, device, physical product.

Slots:

- hero object
- material swatches/details
- rotate/zoom controls
- focus hotspots
- proof labels
- fallback still

Stack:

- R3F/Drei for true 3D
- CSS 3D/image planes for lightweight products
- Image Gen hero/support plate when source photo is weak

Reject if the product is only decorative.

## 2. Before/After Intervention

Use for: street lighting, facade, interior, renovation, operations improvement, service outcome.

Slots:

- original state
- proposed state
- compare slider/toggle/scrub
- focus zones
- assumptions label
- intervention proof

Stack:

- img-comparison-slider or custom canvas wipe
- GSAP timeline for staged transformation
- Three/R3F if camera enters a space

Reject if it hides the original or pretends assumptions are measured facts.

## 3. Particle Identity Reveal

Use for: portrait, logo, product silhouette, place icon, brand mark.

Slots:

- source image
- particle sampling
- scatter/gather state
- resolved recognizable state
- proof orbit or identity labels

Stack:

- Canvas 2D for single HTML and lower counts
- Three.js/GPGPU for premium hero particles

Reject if particles are a generic starfield.

## 4. Rotating World / Globe Proof

Use for: globe products, maps, tourism, logistics, export, global network.

Slots:

- globe or atlas
- real arcs/points/regions
- product transformation
- orbit labels
- detail cards

Stack:

- Three.js sphere for custom art direction
- three-globe/globe.gl for data layers

Reject if labels are fake or the product disappears.

## 5. Evidence Theater

Use for: reports, PDFs, decks, methods, consulting proposals, education.

Slots:

- source anchors
- claim/proof clusters
- chapter navigation
- artifact fragments
- generated/HTML labels

Stack:

- DOM/SVG/canvas for portable proof pages
- R3F planes for spatial proof worlds

Reject if it becomes generic marketing copy.

## 5.5 Trust Theater / Audit Trail

Use for: healthcare, finance, legal, government, insurance, education, enterprise risk, nonprofit.

Slots:

- source evidence
- claim/proof pair
- audit trail or provenance path
- expert/institution credibility
- calm explanation layer
- compliance/truth labels

Stack:

- DOM/SVG/canvas for clarity and accessibility
- R3F/3D only when the evidence benefits from spatial organization

Reject if it invents safety, compliance, medical, legal, financial, or outcome claims.

## 6. Interactive World / Walkthrough

Use for: exhibition, culture, room, campus, experience, high-budget client demo.

Slots:

- world map or scene
- camera rail
- entry/focus/exit controls
- hotspots
- optional physics or movement
- static fallback path

Stack:

- R3F/Drei + GSAP/Theatre.js
- Rapier only when world interaction matters

Reject if the user gets lost or cannot access the core proof.

## 7. Command Center / Data World

Use for: finance, logistics, energy, SaaS, AI, operations, public service, supply chain, market intelligence.

Slots:

- live/representative data surface
- map/network/chart field
- scenario toggles
- drill-down cards
- source/provenance labels
- static evidence fallback

Stack:

- DOM/SVG/canvas for clear dashboards
- Three/R3F only when spatial scale helps

Reject if metrics or maps are invented.

## 8. Learning / Service Journey

Use for: education, training, healthcare journey, consulting delivery, onboarding, public service.

Slots:

- learner/user/persona path
- before state
- intervention moments
- proof/outcome anchors
- step controls
- recap state

Stack:

- DOM/SVG/canvas timeline
- paper-stage or R3F world when the journey benefits from spatial metaphor

Reject if it becomes a linear PPT with animations.

## Family Choice Rule

Choose by the client promise:

- "look at this object" -> Inspectable Product
- "see the change" -> Before/After Intervention
- "recognize this identity" -> Particle Identity
- "understand global scale" -> Rotating World
- "believe the evidence" -> Evidence Theater
- "enter the proposed world" -> Interactive World
- "control a system or understand data" -> Command Center
- "experience a service or learning path" -> Learning / Service Journey
