import type { MoveKind } from "./legal";
import { teamOf } from "./types";

export type FxKind = "whoosh" | "burst" | "streak" | "plate" | "bomb" | "flush" | "royal" | "pass";

const BANNER_RANK = ["天王炸", "钢板", "同花顺", "翻盘炸", "首炸", "打A", "头游", "抗贡", "进贡", "还贡", "接风", "双下", "升级"] as const;

export function fxForMove(kind: string): FxKind {
  if (kind === "pass") return "pass";
  if (kind === "jokerBomb") return "royal";
  if (kind === "straightFlush") return "flush";
  if (kind.startsWith("bomb")) return "bomb";
  if (kind === "plate") return "plate";
  if (kind === "straight" || kind === "tube") return "streak";
  if (kind === "fullhouse") return "burst";
  return "whoosh";
}

export function bannerFromHighlight(highlight: string | null | undefined): string | null {
  if (!highlight) return null;
  const tags = highlight.split("·").map((part) => part.trim());
  for (const name of BANNER_RANK) {
    if (tags.includes(name)) return name;
  }
  return null;
}

export function playHighlight(input: {
  kind: MoveKind | string;
  bombTier: number;
  seat: number;
  level: string;
  priorBomb: boolean;
  opponentFinished: boolean;
}): string | null {
  const tags: string[] = [];
  if (input.kind === "jokerBomb") tags.push("天王炸");
  else if (input.kind === "plate") tags.push("钢板");
  else if (input.kind === "straightFlush") tags.push("同花顺");
  if (input.bombTier > 0 && !input.priorBomb) tags.push("首炸");
  if (input.bombTier > 0 && input.opponentFinished) tags.push("翻盘炸");
  if (input.level === "A" && (input.bombTier > 0 || input.kind === "straightFlush" || input.kind === "jokerBomb")) {
    tags.push("打A");
  }
  if (input.seat < 0) return tags[0] ?? null;
  return tags.length ? tags.join(" · ") : null;
}

export function opponentHasFinished(order: number[], seat: number): boolean {
  return order.some((finished) => teamOf(finished) !== teamOf(seat));
}
