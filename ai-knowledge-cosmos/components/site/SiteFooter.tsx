import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-5 py-14 text-sm text-mist md:flex-row md:items-end md:justify-between md:px-12">
        <div>
          <p className="font-serif text-lg text-ink">{site.name}</p>
          <p className="mt-2 max-w-md leading-7">{site.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/learn" className="text-ink-soft no-underline hover:text-gold-deep">
            八课课文
          </Link>
          <Link href="/knowledge" className="text-ink-soft no-underline hover:text-gold-deep">
            图录
          </Link>
          <Link href="/about" className="text-ink-soft no-underline hover:text-gold-deep">
            方法
          </Link>
        </div>
      </div>
    </footer>
  );
}
