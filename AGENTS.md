# AGENTS.md

## Mission

This repo productizes the `cinematic-web-experience` Codex Skill. The goal is not a generic animated landing page. The goal is a premium client-demo engine that turns real or generated material into an inspectable, believable, beautiful web prototype.

## Non-Negotiables

- Read `SKILL.md` first.
- For image/photo/reference work, read `references/strategy/source-spatialization-pipeline.md`.
- For product/object interaction, read `references/strategy/component-grammar.md`.
- For premium delivery, read `references/qa/sss-quality-gates.md`.
- Do not ship "reference image as background + unrelated procedural object".
- Do not force every brief into globe, particles, black-gold 3D, or WebGL.
- Build around the subject and the user's real belief job.
- Keep code and docs elegant: small files, clear routes, no duplicated spaghetti.

## Workflow

1. Write a route card.
2. Write a subject map.
3. Write a component asset manifest.
4. Choose the minimum visual mechanism that proves the offer.
5. Build a working page.
6. Capture desktop evidence and interaction evidence.
7. Run SSS repair loop until hard gates pass.

## Validation

Use the smallest meaningful checks:

```bash
python3 scripts/route_skill_plan.py --brief "<brief>" --delivery "<delivery>"
python3 scripts/validate_cinematic_page.py <html> --require-material-transform --require-subject-spatialization
python3 -m py_compile scripts/*.py
```

When a page uses product controls, also require:

```bash
python3 scripts/validate_cinematic_page.py <html> --require-object-manipulation
```

## Handoff

Update `docs/CODEX_HANDOFF.md` before pausing substantial work. Include current goal, changed files, validation evidence, blockers, and next step.
