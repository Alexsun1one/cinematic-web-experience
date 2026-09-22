# Codex Handoff

## Current Goal

Every seated agent, including 知识, shares one Guandan goals prompt. The heuristic follows the same priorities.

## How to run

From the repo root:

```bash
npm --prefix llm-guandan-arena run operator
```

`LLM_API_KEY` makes 知识 ask an LLM with `prompts/guandan-agent-system.md`. Without it, the priority picker plays.

## Changed Files

- `llm-guandan-arena/prompts/guandan-agent-system.md`
- `llm-guandan-arena/lib/agent-goals.ts` — invite and solo LLM prompt
- `llm-guandan-arena/lib/invite.ts`
- `llm-guandan-arena/lib/guandan/heuristic.ts`
- `llm-guandan-arena/scripts/priority-pick.mjs`
- `llm-guandan-arena/scripts/operator-smoke-play.mjs`
- `llm-guandan-arena/scripts/guest-agent-player.mjs`
- `llm-guandan-arena/README.md`

## Validation Evidence

- `npm run test:engine` passed, including priority cases and the invite text
- `npm run build` passed

## Blockers

None. Rooms stay in memory.

## Next Step

Sticky process or Redis if this is deployed on more than one instance.
