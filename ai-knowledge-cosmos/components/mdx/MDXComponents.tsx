import type { HTMLAttributes, ReactNode } from "react";
import { FactCheckToy } from "@/components/learn/FactCheckToy";
import { PromptCompare } from "@/components/learn/PromptCompare";
import { TokenSplitter } from "@/components/learn/TokenSplitter";

function Callout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <aside className="my-6 rounded-2xl border border-teal/25 bg-teal/5 px-5 py-4">
      <p className="text-xs tracking-[0.22em] text-teal uppercase">{title}</p>
      <div className="mt-2 text-[0.98rem] leading-8 text-ivory">{children}</div>
    </aside>
  );
}

function Practice({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="my-6 rounded-2xl border border-amber/25 bg-amber/5 px-5 py-4">
      <p className="text-xs tracking-[0.22em] text-amber uppercase">{title}</p>
      <div className="mt-2 text-[0.98rem] leading-8 text-ivory">{children}</div>
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
};
