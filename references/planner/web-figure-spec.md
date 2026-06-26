# Web Figure Spec

This is the canonical artifact between planning and building. It adapts `article-visual-grammar` figure specs to full webpages.

## Page Package Spec

```text
web package:
  client:
  product/brand route:
  output language:
  primary material:
  secondary materials:
  page thesis:
  desired reaction:
  delivery mode:
  visual spine:
  hero preset:
  linked skill plan:
  shared tokens:
    material family:
    palette:
    typography:
    motion:
    label/overlay mode:
  sections:
    - id:
      role:
      source anchor:
      material fragment:
      web mechanism:
      proof purpose:
      fallback:
  skipped material:
    - material:
      reason:
```

## Section Spec

```text
section:
- id:
- role: hero | mechanism | proof | comparison | material detail | case | human consequence | finale
- source anchor:
- viewer takeaway:
- misunderstanding prevented:
- asset used:
- material transformation:
- interaction:
- motion removal test: what breaks if removed?
- linked skill artifact:
- layout:
- typography:
- accessibility/fallback:
- QA risk:
```

## Hero Spec

```text
hero:
- source material:
- hero preset:
- focal object:
- transformation:
- first three seconds:
- motion signature:
- user action:
- copy:
- exact text overlay:
- mobile composition:
- static fallback:
- reject if:
```

## Required Fields

Do not build until filled:

- source material inventory
- brand/product route
- material -> mechanism map
- hero preset
- visual spine
- linked skill plan with concrete outputs
- section roles and source anchors
- motion removal test for each major animation
- mobile composition
- QA/repair plan
