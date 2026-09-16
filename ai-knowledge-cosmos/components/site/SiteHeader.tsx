"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, site } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="group flex items-baseline gap-3 no-underline">
          <span className="font-serif text-lg tracking-wide text-ivory">{site.name}</span>
          <span className="hidden font-display text-sm text-mute sm:inline">{site.english}</span>
        </Link>
        <nav className="panel flex items-center gap-1 rounded-full px-2 py-1">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-sm no-underline transition-colors ${
                  active ? "bg-ivory/10 text-ivory" : "text-mist hover:text-ivory"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
