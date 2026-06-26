# Multi-Agent Workflow

Use this when the brief is broad, high-value, asset-heavy, or technically uncertain.

The main agent is the **Conductor**. It creates one route card, delegates narrow jobs, then synthesizes. No subagent is allowed to independently invent and ship a different page.

## Roles

| Role | Owns | Must Return | Must Not Do |
|---|---|---|---|
| Conductor | intake, route card, final synthesis | route, decisions, web figure spec, delivery | delegate the final judgment |
| Research Scout | domain, current references, libraries, examples | source anchors, proof gaps, cited constraints | choose final design alone |
| Visual Director | brand register, hero mechanism, material/light, image prompts | style tokens, prompt jobs, motion signature, failure risks | handwave implementation |
| Experience Architect | section loop, routing, interaction spine, component grammar | web figure spec, interaction freedoms, state model | inflate scope |
| Build QA Agent | build lane, performance, screenshot plan, nonblank checks | stack choice, validation commands, repair target | start before spec/assets exist |
| Image/Visual Worker | prompt variants, asset repair, generated hero/detail plates | prompt, image path, inspection notes | treat generated image as fact |
| Builder | frontend implementation | path/url, changed files, stack notes | redesign route alone |
| Verifier/Critic | screenshots, hard gates, mobile, genericness | failures, scores, repair target | rubber-stamp |

## Default Parallel Split

For a complex job, run these in parallel:

```text
researcher -> domain + current tech/library references
designer   -> visual route + interaction grammar + aesthetic failure modes
architect  -> context budget + build lane + artifact schema
```

Then synthesize into one web figure spec before building.

## Route Card

The Conductor creates this before any build:

```text
route card:
- source materials:
- route:
- material/proposal transform:
- hero object:
- interaction freedoms:
- linked skills:
- build lane:
- proof gaps:
- assumptions:
- reject if:
```

## Context Discipline

- Main agent keeps the canonical route and web figure spec.
- Subagents receive compact, self-contained tasks.
- Subagents return artifacts, not essays.
- Do not ask every subagent to inspect every file.
- Do not allow subagents to overwrite the same output files in parallel.

## Handoff Contract

```text
subagent:
role:
question:
files/sources inspected:
artifact returned:
decision implications:
risks:
```

## When To Reuse Subagents

- same route but missing evidence -> ask researcher
- beautiful but unusable -> ask designer/critic
- build failing or too slow -> ask architect/build-fixer
- screenshots fail gate -> ask verifier/critic

The main agent remains accountable for the final route, implementation, and delivery.

## Repair Ownership

- route wrong -> Conductor rewrites route card
- asset weak -> Visual Director/Image Worker repairs prompt or asset
- structure empty -> Experience Architect repairs section loop
- implementation broken -> Builder/Build QA Agent repairs stack or code
- screenshot ugly/generic -> Verifier/Critic names the highest-leverage failure

Each repair loop fixes one highest-leverage point, then reruns desktop, mobile, reduced-motion, and nonblank evidence.
