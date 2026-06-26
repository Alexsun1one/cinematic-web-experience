# Context Budget

This skill can explode in context. Route before reading.

## Budget Rule

For most jobs, read:

```text
1 router
2 planner refs
1-2 strategy refs
1-3 linked-skill briefs
0-2 prompt packs
1 build ref
2 QA refs
```

Only expand when blocked or when the user asks for broad research.

## Compression Artifact

Before building, create a compact spec:

```text
brief:
source materials:
route:
material/proposal transform:
hero preset:
linked-skill outputs:
build lane:
sections:
interaction freedoms:
hard gates:
assumptions:
```

Use this artifact as the build context instead of carrying every research note forward.

## Split Triggers

Use subagents when:

- route has more than one plausible direction
- domain facts may have changed
- image generation or asset repair determines success
- WebGL/physics/library choice is uncertain
- user supplied many files
- final output will be client-facing

## Stop Conditions

Stop expanding context when:

- material transform is named
- section anchors are mapped
- stack is chosen
- asset needs are known
- QA criteria are explicit

Then build.
