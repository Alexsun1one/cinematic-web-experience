# Loop Harness

This skill is loop-driven. Each loop has a stop condition and a repair owner.

## Loop 1: Route Loop

```text
input -> route card -> reject test -> chosen route
```

Stop when:

- source material is named
- material/proposal transform is named
- hero object is client-specific
- reject condition is explicit

Repair:

- if generic, reroute before writing code
- if too many possible routes, ask Research Scout/Visual Director for a short comparison

## Loop 2: Research Loop

```text
unknown fact/library/example -> primary-source check -> route implication
```

Stop when:

- route has enough domain/technical evidence
- library risks are known
- inspiration references are classified as reusable or inspiration-only

Repair:

- if sources are stale or unclear, use conservative stack defaults

## Loop 3: Prompt / Asset Loop

```text
prompt -> generated/edited asset -> inspect -> keep/repair/reject
```

Stop when:

- asset preserves required source facts
- asset supports the web mechanism
- text/logos/measurements are not invented
- generated assumptions are labeled

Repair:

- if weak, rewrite prompt around preserve/transform/camera/light/composition
- if identity fidelity matters, use source asset directly and generate only support plates

## Loop 4: Build Loop

```text
web figure spec -> implement minimal scene -> add interaction -> add polish
```

Stop when:

- hero works as a still
- core interaction works
- sections map to anchors
- fallback works

Repair:

- if interaction does not teach anything, remove it
- if performance fails, reduce fidelity before changing the route

## Loop 5: QA / Beauty Loop

```text
screenshot -> hard gates -> score -> single highest-leverage repair -> rerun
```

Stop when:

- desktop, mobile, reduced-motion, and nonblank evidence exist
- average beauty score >= 4
- no hard gate fails

Repair ownership:

- ugly/generic -> Visual Director
- disconnected evidence -> Experience Architect
- broken runtime -> Builder/Build QA Agent
- weak source/generative asset -> Image/Visual Worker

## Loop Rule

Never run infinite polish. Run at most three repair loops unless the user explicitly asks for refinement. Each loop must name the biggest failure and the chosen repair.
