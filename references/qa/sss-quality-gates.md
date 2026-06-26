# SSS Quality Gates

This is a delivery gate, not a score. A page does not ship because it "looks okay"; it ships only after the loop proves that the route, subject, interaction, visual craft, and evidence all hold together.

## SSS Loop

Run the loop until all hard gates pass or the remaining risk is explicitly named.

```text
1. route gate       -> is this the right experience for the user's real job?
2. subject gate     -> is the actual subject extracted, cleaned, componentized, or rebuilt?
3. mechanism gate   -> does the web mechanism make the subject easier to see, believe, compare, or control?
4. interaction gate -> can the user control the object/state, not just watch animation?
5. beauty gate      -> does the screenshot look like a premium designed artifact?
6. proof gate       -> are claims/details tied to source anchors or declared assumptions?
7. performance gate -> is it smooth enough on the target device and honest about offline/runtime truth?
8. repair gate      -> fix the highest-leverage failure, not the easiest CSS symptom.
```

Each loop must produce evidence:

- route card
- subject map
- component asset manifest
- desktop screenshot
- active interaction screenshot or short recording
- reduced-motion still/proof
- hard-gate failure list
- one chosen repair action

No evidence means no pass.

## Target Levels

### A-Level

- page opens
- subject visible
- basic interaction works
- no obvious clipping

Not enough for client-facing delivery.

### S-Level

- subject is source-derived or explicitly generated as a component
- first viewport is specific
- one primary interaction has a clear proof job
- typography, spacing, and palette are coherent
- desktop screenshot is present

Usable internal demo.

### SS-Level

- component asset manifest exists
- object/local state can be controlled and reset
- source anchors/proof labels are visible
- reduced-motion path preserves meaning
- no generic template contamination
- at least one repair loop was run after seeing the screenshot

Acceptable client demo.

### SSS-Level

- route feels inevitable for the product/brief, not effect-driven
- source subject remains recognizable after extraction/rebuild/linework/3D transform
- interactions feel physical or purposeful: drag, rotate, zoom, place, scrub, compare, focus, assemble, or navigate
- user can inspect details without losing orientation
- visual craft is memorable at rest: material, lighting, composition, and type hold up in a still screenshot
- dynamic behavior adds belief, clarity, desire, or control
- every generated asset has a declared web layer role
- the page includes a truthful fallback and assumptions label
- desktop target is excellent; mobile only needs to not break unless requested
- final evidence includes screenshots/recording, validation output, and remaining risks

Ship only at this level for "极其好看 / 炫技 / 客户展示 / premium" requests.

## Repair Ladder

Repair in this order:

1. wrong user job -> reroute, do not polish
2. wrong subject -> extract/clean/rebuild assets before layout
3. static background -> componentize layers or linework
4. fake interaction -> make object/state locally controllable
5. weak visual -> improve material/light/composition before adding effects
6. confusing motion -> simplify and add reset/orientation
7. proof gap -> attach real anchors or label assumptions
8. performance/jank -> reduce geometry/effects/assets

Never repair a route or subject failure with gradients, particles, blur, card styling, or more copy.

## Hard Stops

- background plate with unrelated procedural hero
- primary subject not traceable to source or declared generated component
- no object-local control for an inspectable product
- motion prevents inspection or reading
- generated asset has no web layer role
- fake metrics, geography, engineering, medical, legal, financial, or measured claims
- no screenshot evidence
- no explicit remaining-risk statement
