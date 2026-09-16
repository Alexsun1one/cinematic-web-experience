"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, site } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-3 md:px-12">
        <Link href="/" className="font-serif text-[1.05rem] tracking-[0.18em] text-ink no-underline">
          {site.name}
        </Link>
        <nav className="flex items-center gap-5 text-[13px]">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`tracking-wide no-underline ${active ? "text-ink" : "text-mist hover:text-ink"}`}
              >
                {active ? <span className="mr-1 text-gold">·</span> : null}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="h-px bg-ink/10" />
    </header>
  );
}
