"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, site } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const home = pathname === "/";

  return (
    <header className={`fixed inset-x-0 top-0 z-50 ${home ? "bg-transparent" : "bg-void/78 backdrop-blur-md"}`}>
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-3 md:px-10">
        <Link href="/" className="font-serif text-[0.95rem] tracking-[0.38em] text-bone no-underline">
          {site.name}
        </Link>
        <nav className="flex items-center gap-5 text-[12px]">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`tracking-[0.18em] no-underline ${active ? "text-acid" : "text-fog hover:text-bone"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="h-px bg-acid/20" />
    </header>
  );
}
