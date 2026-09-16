import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-ivory/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-mute md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-serif text-ivory">{site.name}</p>
          <p className="mt-2 max-w-xl leading-7">{site.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/learn" className="text-mist no-underline hover:text-teal">
            六站课程
          </Link>
          <Link href="/knowledge" className="text-mist no-underline hover:text-teal">
            知识星图
          </Link>
          <Link href="/about" className="text-mist no-underline hover:text-teal">
            方法与来源
          </Link>
        </div>
      </div>
    </footer>
  );
}
