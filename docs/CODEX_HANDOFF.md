# Codex Handoff

## Current Goal

Make `cinematic-web-experience` a reusable, high-quality Skill product for premium client-facing web prototypes.

## Core Correction Captured

The failed globe demo taught the central rule:

```text
reference image as background + unrelated procedural object = failure
```

Correct pipeline:

```text
source/reference -> subject map -> extraction/cleanup/componentization -> depth/line/3D/particle transform -> page
```

## Important Files

- `SKILL.md`
- `references/strategy/source-spatialization-pipeline.md`
- `references/strategy/component-grammar.md`
- `references/strategy/material-alchemy.md`
- `references/build/material-transforms.md`
- `references/prompts/imagegen-prompt-pack.md`
- `references/qa/sss-quality-gates.md`
- `scripts/route_skill_plan.py`
- `scripts/validate_cinematic_page.py`
- `templates/asset-manifest.md`

## Next Work

- Build 2-3 showcase cases:
  - product/object manipulation demo
  - complex street/interior fake-3D or linework intervention demo
  - evidence/service/brand route demo if time allows
- Validate with desktop screenshots and active interaction evidence.
- Push GitHub repo after local validation.

## Guardrails

- Do not spend all context on image blobs.
- Use generated assets as files, not embedded base64.
- Prefer component assets over monolithic hero plates.
- Do not claim real engineering/financial/medical/geographic accuracy unless modeled from source.
- Desktop excellence is primary unless user asks for mobile.
