# Intake Schema

Use this before planning or coding. It prevents vibe-first pages.

## Source Material Inventory

```text
materials:
- id:
  type: image | PDF | deck | doc | screenshot | logo | text | dataset | generated
  path/source:
  visible subject:
  quality:
  dimensions/pages:
  must preserve exactly:
  can reimagine:
  strongest affordance:
  likely route:
```

For images, run `scripts/asset_manifest.py` when local files are available.

## Source Anchor Extraction

Every page section must bind to at least one:

- product fact
- image fragment
- quote or claim
- number or proof point
- stakeholder/customer
- map point / region / route
- screenshot region
- material detail
- brand promise
- generated asset path

```text
source anchors:
- anchor:
  source material id:
  page role:
  why it matters:
  must not distort:
```

## Preserve vs Transform

```text
preserve exactly:
- logo shape/color:
- product proportions:
- face identity:
- legal/financial text:
- geographic truth:
- screenshot inspectability:

safe to transform:
- background:
- lighting:
- material staging:
- surrounding world:
- depth/parallax:
- particles/abstraction:
- generated supporting scenes:
```

## Client Presentation Intent

```text
client / subject:
audience:
desired reaction:
core offer:
proof standard:
brand route:
emotional temperature:
luxury register:
delivery constraints:
```

## Go / No-Go

Do not proceed to implementation until:

- at least one source material or generated-asset plan is named
- at least three source anchors exist for a multi-section page
- must-preserve constraints are explicit
- a brand/product route is selected
- material transformation is stronger than "background image"
