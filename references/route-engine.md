# Route Engine

Choose route before choosing effects. The route engine answers: what industry/business intent is present, what material is provided, what subject type it belongs to, what the material becomes, which linked skills own upstream visual work, and which build lane can express it.

## Two-Pass Route

### Pass 1: Material + Brand Route

```text
route:
- industry/domain:
- client belief job:
- material type:
- subject type:
- product/brand category:
- brand route:
- strongest asset:
- weakest asset:
- material transformation:
- hero preset:
- linked skill plan:
- proof anchors needed:
- reject if:
```

If the domain is unfamiliar, read `industry-atlas.md` and `strategy/universal-brief-router.md` before choosing a route.

### Pass 2: Build Lane

| Need | Build Lane |
|---|---|
| Single portable local file, light interaction | `build/single-html.md` |
| Real globe, object, particle depth, shader, post-processing | `build/react-three.md` |
| Product photo/portrait/screenshot/logo transformation | `build/material-transforms.md` |
| Scroll choreography with DOM/WebGL sync | `build/react-three.md` or `build/single-html.md` by complexity |

## Product / Brand Route Matrix

These routes are reusable across industries. They are not a fixed industry list.

| Route | Product Types | Material Alchemy | Hero Preset | Linked Skills |
|---|---|---|---|---|
| Planetary Authority | globe, map, tourism, export, logistics, global service, culture abroad | map/earth/product -> rotating proof globe or orbital atlas | Rotating World | `master-styles`, `article-visual-grammar`, Image Gen |
| Material Desire | cosmetics, furniture, fashion, textile, craft, food, jewelry | texture/product -> luminous material stage, macro closeup, tactile cutaway | Hero Object Theater or Cinematic Gallery | `master-styles`, Image Gen, `cover-pop` |
| Regulated Trust | healthcare, finance, legal, government, insurance, nonprofit, enterprise risk | docs/cases/process -> trust theater, audit trail, calm evidence journey | Trust Theater | `article-visual-grammar`, `master-styles`, `paper-operators` |
| Learning / Service Journey | education, training, onboarding, healthcare journey, consulting delivery, customer service | curriculum/process/persona -> interactive journey, proof checkpoints | Learning / Service Journey | `article-visual-grammar`, `paper-operators`, `master-styles` |
| Command Center / Data World | finance, logistics, energy, sustainability, SaaS ops, market intelligence | data/maps/metrics -> command center, drill-down field, scenario toggles | Command Center | `article-visual-grammar`, `master-styles` |
| Operational Mechanism | manufacturing, industrial, agriculture, food production, maintenance, quality | process/site/equipment -> mechanism cutaway, walkthrough, assembly simulation | Mechanism Cutaway | `article-visual-grammar`, `paper-operators`, `master-styles` |
| Mechanism Prestige | SaaS, AI tools, dashboards, education systems, consulting methods | screenshot/framework -> layered cutaway, transformation tunnel, capability stack | Layered Artifact Cutaway | `article-visual-grammar`, `paper-operators` when action clarifies |
| Spatial Intervention | street lighting, architecture, retail, interior, exhibition, landscaping, campus, urban renewal | site photo/plan -> before/after simulation, focus inspection, intervention layers | Before/After Simulation or Walkable Focus Map | `master-styles`, Image Gen, `article-visual-grammar` |
| Inspectable Product | hardware, furniture, craft object, instrument, toy, globe, device, luxury object | product photo/CAD/detail -> rotate/zoom/exploded detail/material swatches | Interactive Product Showroom | `master-styles`, Image Gen |
| Particle Identity | photo, portrait, logo, silhouette, product outline, campaign image | image/logo/silhouette -> recognizable particle reveal, proof orbit, identity field | Particle Identity Reveal | `master-styles`, Image Gen |
| Human Credibility | consultants, founders, teachers, experts, teams | portrait -> particle identity, trust/evidence field, proof orbit | Particle Identity Reveal | `master-styles`, `article-visual-grammar`, Image Gen |
| Cultural Worldbuilding | heritage, festival, tourism, exhibitions, cultural export | place/archive/ritual -> route atlas, night world, paper-stage scene | Cinematic Gallery or Paper-Stage Scroll World | `paper-operators`, `master-styles`, `cover-pop`, Image Gen |
| Evidence Authority | reports, PDFs, decks, whitepapers, research | document -> evidence constellation, proof theater, source-bound chapters | Evidence Constellation | `article-visual-grammar`, `master-styles` |
| Kinetic Identity | logo, campaign, brand name, personal IP | mark -> particle monogram, SVG path reveal, material seal | Kinetic Seal | `master-styles`, Image Gen |

## Universal Route Matrix

| Belief Job | Common Industries | Subject | Best Experience |
|---|---|---|---|
| desire | consumer, luxury, food, hospitality, tourism, culture | object/place/identity | material reveal, cinematic gallery, inspectable object |
| trust | healthcare, finance, legal, education, public service, enterprise | institution/document/person | evidence theater, audit trail, proof orbit |
| transformation | renovation, wellness, operations, consulting, sustainability | place/process/service | before/after, scenario scrub, staged reveal |
| mechanism clarity | SaaS, AI, manufacturing, biotech, hardware, education | process/system/object | cutaway, layer toggle, assembly, timeline |
| scale | logistics, export, tourism, energy, communities, platforms | map/network/data | globe/map/network field with drill-down |
| control | configurators, dashboards, operations, training, product demos | data/object/system | command center, parameters, rotate/zoom/focus |
| identity | personal brand, campaign, media, sports, creator/IP | person/logo/community | particle identity, kinetic seal, story atlas |

## Material Route Matrix

| Material | Default Transform | Alternative If Weak |
|---|---|---|
| globe/earth/map image | Three.js textured sphere or orbital atlas | generate better planet/atlas texture; use original as reference |
| product photo | 3D-ish product stage, depth planes, macro/cutaway | generate premium hero plate around product |
| site/street/interior photo | before/after lighting or intervention simulation | generate future-state plate; keep original as comparison layer |
| CAD/model/detail shots | inspectable product viewer or exploded layers | use photo planes if true 3D model unavailable |
| portrait | particle portrait or trust field | generate portrait-like brand world only if identity fidelity not critical |
| screenshot | layered artifact cutaway | recreate as stylized inspectable UI plate |
| logo | kinetic seal or particle mark | manually trace SVG or use alpha-mask particles |
| PDF/deck | evidence constellation or scroll proof theater | generate chapter visuals from source anchors |
| textile/material sample | thread/fiber route, macro light stage | `paper-operators` scene or Image Gen material plate |
| place/event images | spatial gallery/world route | Image Gen atmosphere plate + source images as proof artifacts |

## Linked Skill Decision

- Document/PDF/deck -> read `linked-skills/article-visual-grammar.md`.
- Vague or unfamiliar industry -> read `industry-atlas.md` and `strategy/universal-brief-router.md`.
- Tactile physical idea/action -> read `linked-skills/paper-operators.md`.
- Premium art direction or weak asset -> read `linked-skills/master-styles.md`.
- Street/space/proposal future-state -> read `strategy/proposal-to-simulation.md` and `prompts/imagegen-prompt-pack.md`.
- Rotate/zoom/drag/collision/object handling -> read `strategy/component-grammar.md` and `build/physics-components.md`.
- Hero title/cover/chapter card -> read `linked-skills/cover-card-skills.md`.
- Motion loop/sticker energy -> read `linked-skills/sticker-gif-skills.md`, only if brand tone permits.
- Any generated/edited image asset -> read `linked-skills/image-gen.md`.

## Reject Conditions

Reject route if:

- route starts from an effect instead of material
- no source anchor is named
- hero could be made without the product/client
- linked skills are named but no concrete output is requested
- build lane is too heavy for the transformation
- single HTML promise depends on CDN
- mobile fallback is unspecified
- future-state simulation hides the original or presents assumptions as facts
- inspectable product cannot actually be inspected
