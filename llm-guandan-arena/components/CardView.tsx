"use client";

import { useEffect, useRef, useState } from "react";
import { arrangeColumns } from "@/lib/guandan/arrange";
import { isRed, isWild, rankCompact, suitGlyph } from "@/lib/guandan/cards";
import { handOrder } from "@/lib/guandan/present";
import type { Card, FaceRank } from "@/lib/guandan/types";

type Spot = { x: number; y: number; turn?: boolean };

function pair(y: number, turn = false): Spot[] {
  return [
    { x: 32, y, turn },
    { x: 68, y, turn },
  ];
}

function spots(rank: string): Spot[] | null {
  switch (rank) {
    case "A":
      return [{ x: 50, y: 50 }];
    case "2":
      return [
        { x: 50, y: 24 },
        { x: 50, y: 76, turn: true },
      ];
    case "3":
      return [
        { x: 50, y: 22 },
        { x: 50, y: 50 },
        { x: 50, y: 78, turn: true },
      ];
    case "4":
      return [...pair(24), ...pair(76, true)];
    case "5":
      return [...pair(22), { x: 50, y: 50 }, ...pair(78, true)];
    case "6":
      return [...pair(20), ...pair(50), ...pair(80, true)];
    case "7":
      return [...pair(18), { x: 50, y: 34 }, ...pair(52), ...pair(80, true)];
    case "8":
      return [...pair(16), ...pair(36), ...pair(64, true), ...pair(84, true)];
    case "9":
      return [...pair(15), ...pair(33), { x: 50, y: 50 }, ...pair(67, true), ...pair(85, true)];
    case "10":
      return [...pair(14), { x: 50, y: 28 }, ...pair(40), ...pair(60, true), { x: 50, y: 74, turn: true }, ...pair(86, true)];
    default:
      return null;
  }
}

export function CardView({
  card,
  level,
  size = "hand",
}: {
  card: Card;
  level: FaceRank;
  size?: "hand" | "play" | "mini";
}) {
  const wild = isWild(card, level);
  const joker = card.rank === "SJ" || card.rank === "BJ";
  const red = isRed(card);
  const label = rankCompact(card.rank);
  const suit = suitGlyph(card.suit);
  const pip = joker ? null : spots(label);
  const levelNatural = !wild && !joker && card.rank === level;

  return (
    <div className={`poker ${size} ${red ? "red" : "black"} ${wild ? "wild" : ""} ${joker ? "joker" : ""} ${card.rank === "BJ" ? "big-joker" : ""}`}>
      <span className="corner top">
        <b>{joker ? (card.rank === "BJ" ? "大" : "小") : label}</b>
        <i>{joker ? "王" : suit}</i>
      </span>
      {wild ? <em className="wild-star">配</em> : levelNatural ? <em className="level-tab">级</em> : null}
      {joker ? (
        <span className="joker-face">{card.rank === "BJ" ? "大王" : "小王"}</span>
      ) : pip ? (
        <span className="pips" aria-hidden>
          {pip.map((spot, index) => (
            <span key={index} className={spot.turn ? "turn" : ""} style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
              {suit}
            </span>
          ))}
        </span>
      ) : (
        <span className="face-rank">
          {label}
          <small>{suit}</small>
        </span>
      )}
      <span className="corner bot">
        <b>{joker ? (card.rank === "BJ" ? "大" : "小") : label}</b>
        <i>{joker ? "王" : suit}</i>
      </span>
    </div>
  );
}

export function CardBack({ size = "mini" }: { size?: "mini" | "side" }) {
  return (
    <div className={`card-back ${size}`} aria-hidden>
      <span>掼</span>
    </div>
  );
}

function useLeaving(cards: Card[]): Card[] {
  const prev = useRef(cards);
  const [leaving, setLeaving] = useState<Card[]>([]);
  useEffect(() => {
    const ids = new Set(cards.map((card) => card.id));
    const gone = prev.current.filter((card) => !ids.has(card.id));
    prev.current = cards;
    if (gone.length === 0) return;
    setLeaving(gone);
    const timer = window.setTimeout(() => setLeaving([]), 340);
    return () => window.clearTimeout(timer);
  }, [cards]);
  return leaving;
}

const POP_ROLES = new Set(["wild", "jokerBomb", "bomb", "flush"]);

export function HandFan({
  cards,
  level,
  mode,
  size = "hand",
  axis = "row",
  popStructures = false,
}: {
  cards: Card[];
  level: FaceRank;
  mode: "fan" | "columns";
  size?: "hand" | "mini";
  axis?: "row" | "col";
  popStructures?: boolean;
}) {
  const leaving = useLeaving(cards);
  const ordered = handOrder(cards, level);
  if (mode === "columns") {
    const live = new Set(cards.map((card) => card.id));
    const columns = arrangeColumns([...cards, ...leaving], level);
    const squeeze = columns.length > 12 ? Math.min(14, (columns.length - 12) * 1.5) : 0;
    return (
      <div className={`rank-columns ${popStructures ? "pop-structures" : ""}`} data-testid="vertical-hand">
        {columns.map((column, columnIndex) => {
          const pop = popStructures && POP_ROLES.has(column.role);
          const stagger = column.lift + (columnIndex % 2 === 0 ? 0 : 8) + (columnIndex % 3 === 0 ? 3 : 0) + (pop ? 18 : 0);
          const tag = column.role === "flush" ? "同花顺" : column.role === "bomb" || column.role === "jokerBomb" ? "炸" : column.role === "wild" ? "配" : "";
          return (
            <div
              className={`rank-col role-${column.role} ${pop ? "pop" : ""}`}
              key={column.key}
              data-role={column.role}
              style={{
                transform: `translateY(-${stagger}px) scale(${pop ? 1.08 : 1})`,
                marginLeft: columnIndex === 0 ? 0 : -squeeze,
                zIndex: columns.length - columnIndex + (pop ? 2 : 0),
              }}
            >
              {pop ? <em className="col-tag">{tag}</em> : null}
              {column.cards.map((card, index) => (
                <div key={card.id} className={`rank-col-card ${live.has(card.id) ? "" : "depart"}`} style={{ zIndex: index + 1 }}>
                  <CardView card={card} level={level} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  }
  const vertical = axis === "col";
  const peek = vertical ? Math.min(18, Math.max(9, Math.floor(300 / Math.max(ordered.length, 1)))) : 0;
  return (
    <div className={`hand-fan ${size} ${vertical ? "col" : "row"}`}>
      {ordered.map((card, index) => {
        const t = ordered.length <= 1 ? 0.5 : index / (ordered.length - 1);
        const rot = vertical ? 0 : (t - 0.5) * 6;
        const lift = vertical ? 0 : Math.sin(t * Math.PI) * 10;
        return (
          <div
            key={card.id}
            className="fan-slot"
            style={{
              zIndex: index,
              transform: vertical ? undefined : `rotate(${rot}deg) translateY(${-lift}px)`,
              marginTop: vertical && index > 0 ? -(64 - peek) : undefined,
            }}
          >
            <CardView card={card} level={level} size={size === "mini" ? "mini" : "hand"} />
          </div>
        );
      })}
    </div>
  );
}

export function BackRow({ count, axis }: { count: number; axis: "row" | "stack" }) {
  const shown = Math.min(count, axis === "row" ? 14 : 10);
  return (
    <div className={`back-row ${axis}`}>
      {Array.from({ length: shown }, (_, index) => (
        <CardBack key={index} size={axis === "stack" ? "side" : "mini"} />
      ))}
      <b className="count-badge">{count}</b>
    </div>
  );
}
