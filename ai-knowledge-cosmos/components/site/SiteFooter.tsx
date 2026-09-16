"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <footer className="border-t border-acid/15 bg-void">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-5 py-14 text-sm text-fog md:flex-row md:items-end md:justify-between md:px-12">
        <div>
          <p className="font-serif text-lg tracking-[0.28em] text-bone">{site.name}</p>
          <p className="mt-2 max-w-md leading-7">{site.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/learn" className="text-bone/80 no-underline hover:text-acid">
            展墙
          </Link>
          <Link href="/knowledge" className="text-bone/80 no-underline hover:text-acid">
            平面
          </Link>
          <Link href="/about" className="text-bone/80 no-underline hover:text-acid">
            馆务
          </Link>
        </div>
      </div>
    </footer>
  );
}
