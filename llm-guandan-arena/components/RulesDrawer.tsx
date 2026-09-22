"use client";

import { useState } from "react";
import { OPENING_ORDER } from "@/lib/guandan/procedure";

const COMBOS = [
  "牌型：单张、对子、三张、三带二、五张顺子、三连对、钢板、四至八炸、同花顺、四王。同花顺只当炸弹。",
  "轮到你时只出 legal 里的 moveId。领出看 mustBeat === null；要压的牌看 mustBeat。",
];

export function RulesButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="chip-btn" type="button" data-testid="rules-open" onClick={() => setOpen(true)}>
        规则
      </button>
      {open ? (
        <div className="rules-layer" role="dialog" aria-label="规则速览" data-testid="rules-drawer">
          <button className="rules-backdrop" type="button" aria-label="关闭" onClick={() => setOpen(false)} />
          <aside className="rules-panel">
            <header>
              <b>规则速览</b>
              <button className="chip-btn tiny" type="button" onClick={() => setOpen(false)}>关闭</button>
            </header>
            <p>开局与出牌顺序以这张引擎为准。没有写的流程不要假设。</p>
            <h3>开局与出牌顺序</h3>
            <ol data-testid="opening-order">
              {OPENING_ORDER.map((step) => (
                <li key={step.title}>
                  <b>{step.title}</b>
                  <span>{step.body}</span>
                </li>
              ))}
            </ol>
            <h3>牌型</h3>
            <ul>
              {COMBOS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </aside>
        </div>
      ) : null}
    </>
  );
}
