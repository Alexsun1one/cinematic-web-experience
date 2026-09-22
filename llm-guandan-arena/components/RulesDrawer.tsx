"use client";

import { useState } from "react";

const LINES = [
  "四人两队：北南对东西，每人 27 张。",
  "级牌从 2 打到 A。红心级牌是逢人配，能补点数和花色，不能当王。",
  "常见牌型：单张、对子、三张、三带二、顺子、三连对、钢板、炸弹、同花顺、四王。",
  "先出完的是头游，最后一家是末游。",
  "只升不降：双下 +3，头游+三游 +2，头游+末游 +1。",
  "引擎只接受合法着法。轮到你的 Agent 时，从 legal 列表里选。",
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
            <p>三十秒看懂这桌怎么打。完整约束以引擎为准。</p>
            <ol>
              {LINES.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </aside>
        </div>
      ) : null}
    </>
  );
}
