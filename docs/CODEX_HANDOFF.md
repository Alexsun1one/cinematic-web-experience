# Codex Handoff

## Current Goal

Make `cinematic-web-experience` a reusable, high-quality Skill product for premium client-facing web prototypes.

Status: implemented, validated, and pushed as a local/GitHub-ready Skill repository.

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

## Showcase Cases

- `examples/globe-atelier-physical/`: source-derived globe subject, repaired backplate, object-local drag/rotate/place/zoom/focus/reset, desktop/mobile screenshots.
- `examples/street-linework-intervention/`: complex street route using cleanup, SVG linework, fake-3D perspective planes, before/after scrub, desktop/mobile screenshots.
- `examples/evidence-theater-trust/`: calm proof route for reports/proposals, claim/proof/risk/assumption theater, desktop/mobile screenshots.

## Validation Evidence

- `quick_validate.py` passes for the repo Skill.
- `quick_validate.py` passes for installed Skill at `/Users/sunwuyuan/.codex/skills/cinematic-web-experience`.
- `python3 -m py_compile scripts/*.py` passes.
- `validate_cinematic_page.py` passes all three examples with material-transform and subject-spatialization gates.
- `globe-atelier-physical` additionally passes `--require-object-manipulation`.
- Desktop and mobile screenshots were inspected; failed intermediate screenshots were removed before commit.

## Next Work

- Add short interaction recordings/GIFs for each example.
- Consider a real CV segmentation/depth-estimation helper for source photos, while keeping the current linework/component fallback.
- Add release tag and screenshot gallery before public announcement.

## Guardrails

- Do not spend all context on image blobs.
- Use generated assets as files, not embedded base64.
- Prefer component assets over monolithic hero plates.
- Do not claim real engineering/financial/medical/geographic accuracy unless modeled from source.
- Desktop excellence is primary unless user asks for mobile.
