import { readFileSync } from "node:fs";
import { join } from "node:path";

let cached: string | undefined;

/** Shared objectives for every seated agent. Source: prompts/guandan-agent-system.md */
export function guandanAgentSystem(): string {
  if (cached !== undefined) return cached;
  const candidates = [
    join(process.cwd(), "prompts", "guandan-agent-system.md"),
    join(process.cwd(), "llm-guandan-arena", "prompts", "guandan-agent-system.md"),
  ];
  for (const file of candidates) {
    try {
      cached = readFileSync(file, "utf8").trim();
      return cached;
    } catch {
      /* try the other root */
    }
  }
  throw new Error("缺少 prompts/guandan-agent-system.md");
}
