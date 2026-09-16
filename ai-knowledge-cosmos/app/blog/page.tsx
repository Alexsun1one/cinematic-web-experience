import Link from "next/link";
import { getPostMetas } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata = {
  title: "刊物",
};

export default function BlogPage() {
  const posts = getPostMetas();
  const [featured, ...rest] = posts;

  return (
    <main className="pb-24">
      <header className="fold relative min-h-[72vh] overflow-hidden px-5 pt-28 pb-16 md:px-12">
        <p className="spine absolute top-32 right-6 hidden text-gold md:block">观星 · 不定期</p>
        <p className="text-xs tracking-[0.4em] text-gold-deep">刊物 · 00{posts.length}</p>
        <div className="mt-8 grid items-end gap-8 md:grid-cols-[8rem_minmax(0,1fr)]">
          <p className="font-serif text-[7rem] leading-none text-gold">刊</p>
          <div>
            <h1 className="font-serif text-6xl leading-[0.95] text-ink md:text-8xl">观测笔记</h1>
            <p className="mt-6 max-w-lg font-serif text-2xl leading-snug text-ink-soft">
              课文是骨架。这里只留下走路时改过的口吻。
            </p>
            <p className="mt-6 text-sm text-mist">
              {site.author} · {posts.length} 篇 · 不堆卡片
            </p>
          </div>
        </div>
      </header>

      {featured ? (
        <article className="border-y border-ink px-5 py-16 md:px-12">
          <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
            <div>
              <p className="text-xs tracking-[0.3em] text-gold-deep">{featured.kicker} · 头题</p>
              <h2 className="mt-5 font-serif text-4xl leading-[1.12] md:text-6xl">
                <Link href={`/blog/${featured.slug}`} className="text-ink no-underline hover:text-gold-deep">
                  {featured.title}
                </Link>
              </h2>
            </div>
            <div className="flex flex-col justify-end">
              <p className="font-serif text-xl leading-8 text-ink-soft">{featured.summary}</p>
              <p className="mt-6 text-sm text-mist">
                {featured.date} · {featured.reading}
              </p>
            </div>
          </div>
        </article>
      ) : null}

      <ol className="mx-auto max-w-[1400px] px-5 md:px-12">
        {rest.map((post, index) => (
          <li key={post.slug} className="grid gap-4 border-b border-ink/10 py-8 md:grid-cols-[6rem_1fr_12rem]">
            <p className="folio font-serif text-gold">{String(index + 2).padStart(2, "0")}</p>
            <div>
              <p className="text-xs text-mist">{post.kicker}</p>
              <h3 className="mt-2 font-serif text-2xl">
                <Link href={`/blog/${post.slug}`} className="text-ink no-underline hover:text-gold-deep">
                  {post.title}
                </Link>
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-7 text-mist">{post.summary}</p>
            </div>
            <p className="text-sm text-mist md:text-right">{post.date}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}
