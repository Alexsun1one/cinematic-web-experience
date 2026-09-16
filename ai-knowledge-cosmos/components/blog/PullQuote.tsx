import type { ReactNode } from "react";

export function PullQuote({ children, cite }: { children: ReactNode; cite?: string }) {
  return (
    <figure className="pull-quote my-12 border-y border-acid/20 py-9">
      <blockquote className="font-serif text-[1.65rem] leading-snug text-bone md:text-[2rem] md:leading-[1.35]">
        {children}
      </blockquote>
      {cite ? <figcaption className="mt-5 text-sm text-fog">{cite}</figcaption> : null}
    </figure>
  );
}
