import Link from "next/link";
import { getPostMetas } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata = {
  title: "夜刊",
};

export default function BlogPage() {
  const posts = getPostMetas();
  const [featured, ...rest] = posts;

  return (
    <main className="pb-24">
      <header className="relative min-h-[88vh] overflow-hidden px-5 pt-28 pb-16 md:px-12">
        <p className="pointer-events-none absolute top-[18%] -left-8 select-none font-serif text-[min(48vw,20rem)] leading-none text-acid/20">
          夜刊
        </p>
        <p className="spine absolute top-36 right-6 hidden text-fog md:block">观星 · 不定期</p>
        <div className="relative z-10 mt-[28vh] max-w-3xl">
          <p className="text-[10px] tracking-[0.42em] text-acid">夜刊 · 00{posts.length}</p>
          <h1 className="mt-5 font-serif text-6xl leading-[0.92] text-bone md:text-8xl">灯下的口吻</h1>
          <p className="mt-6 max-w-lg font-serif text-2xl leading-snug text-fog">
            展墙是骨架。这里只留下走路时改过的句子。
          </p>
          <p className="mt-6 text-sm text-fog">
            {site.author} · {posts.length} 篇 · 不是目录博客
          </p>
        </div>
      </header>

      {featured ? (
        <article className="border-y border-acid/30 bg-hall px-5 py-16 md:px-12">
          <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
            <div>
              <p className="text-[10px] tracking-[0.3em] text-acid">{featured.kicker} · 头版</p>
              <h2 className="mt-5 font-serif text-4xl leading-[1.08] md:text-6xl">
                <Link href={`/blog/${featured.slug}`} className="text-bone no-underline hover:text-acid">
                  {featured.title}
                </Link>
              </h2>
            </div>
            <div className="flex flex-col justify-end">
              <p className="font-serif text-xl leading-8 text-fog">{featured.summary}</p>
              <p className="mt-6 text-sm text-fog">
                {featured.date} · {featured.reading}
              </p>
            </div>
          </div>
        </article>
      ) : null}

      <ol className="mx-auto max-w-[1400px] px-5 md:px-12">
        {rest.map((post, index) => (
          <li key={post.slug} className="grid gap-4 border-b border-acid/12 py-8 md:grid-cols-[6rem_1fr_12rem]">
            <p className="folio font-serif text-acid">{String(index + 2).padStart(2, "0")}</p>
            <div>
              <p className="text-xs text-fog">{post.kicker}</p>
              <h3 className="mt-2 font-serif text-2xl">
                <Link href={`/blog/${post.slug}`} className="text-bone no-underline hover:text-acid">
                  {post.title}
                </Link>
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-7 text-fog">{post.summary}</p>
            </div>
            <p className="text-sm text-fog md:text-right">{post.date}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}
