import type { HTMLAttributes, ReactNode } from "react";
import { PullQuote } from "@/components/blog/PullQuote";
import { AttentionHeatmap } from "@/components/learn/AttentionHeatmap";
import { ClosedLoop } from "@/components/learn/ClosedLoop";
import { FactCheckToy } from "@/components/learn/FactCheckToy";
import { NextTokenToy } from "@/components/learn/NextTokenToy";
import { PromptCompare } from "@/components/learn/PromptCompare";
import { StampGate } from "@/components/learn/StampGate";
import { TokenSplitter } from "@/components/learn/TokenSplitter";
import { ToolLoop } from "@/components/learn/ToolLoop";

function Callout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="my-6 border border-ink/10 bg-paper-2/60 px-5 py-4">
      <p className="font-serif text-gold">{title}</p>
      <div className="mt-2 text-[0.98rem] leading-8 text-ink-soft">{children}</div>
    </aside>
  );
}

function Practice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="my-6 border border-gold/40 bg-gold/5 px-5 py-4">
      <p className="font-serif text-gold-deep">{title}</p>
      <div className="mt-2 text-[0.98rem] leading-8 text-ink-soft">{children}</div>
    </section>
  );
}

function heading(Tag: "h2" | "h3") {
  return function Heading(props: HTMLAttributes<HTMLHeadingElement>) {
    return <Tag {...props} />;
  };
}

export const mdxComponents = {
  h2: heading("h2"),
  h3: heading("h3"),
  Callout,
  Practice,
  TokenSplitter,
  PromptCompare,
  FactCheckToy,
  AttentionHeatmap,
  NextTokenToy,
  StampGate,
  ToolLoop,
  ClosedLoop,
  PullQuote,
};
