import { isRed, isWild, rankCompact, suitGlyph } from "@/lib/guandan/cards";
import type { Card, FaceRank } from "@/lib/guandan/types";

export function CardView({
  card,
  level,
  size = "mini",
}: {
  card: Card;
  level: FaceRank;
  size?: "mini" | "play";
}) {
  const wild = isWild(card, level);
  const joker = card.suit === "J";
  const levelMark = !wild && !joker && card.rank === level;
  return (
    <div className={`playing-card ${size} ${isRed(card) ? "red" : "black"} ${wild ? "wild" : ""} ${joker ? "joker" : ""}`}>
      <span className="rank">{rankCompact(card.rank)}</span>
      <span className="suit">{joker ? "王" : suitGlyph(card.suit)}</span>
      {wild ? <em>配</em> : levelMark ? <em>级</em> : null}
    </div>
  );
}
