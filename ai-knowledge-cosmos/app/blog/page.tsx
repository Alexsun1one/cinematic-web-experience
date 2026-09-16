import Link from "next/link";
import { getPostMetas } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata = {
  title: "笔记",
};

export default function BlogPage() {
  const posts = getPostMetas();
  const [featured, ...rest] = posts;

  return (
    <main className="mx-auto max-w-5xl px-5 pt-24 pb-20">
      <header className="relative overflow-hidden rounded-[2rem] border border-ivory/10 bg-ink/50 px-6 py-12 md:px-12 md:py-16">
        <p className="text-xs tracking-[0.32em] text-violet uppercase">Field Notes · Vol. 01</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight text-ivory md:text-7xl">观测笔记</h1>
        <p className="mt-6 max-w-2xl font-serif text-xl leading-9 text-mist">
          课程是骨架，笔记是体温：记录我在公开材料里走弯路、改顺序、重新理解的过程。
        </p>
        <p className="mt-8 text-xs tracking-[0.2em] text-mute uppercase">
          {site.author} · {posts.length} 篇 · 不定期刊行
        </p>
      </header>

      {featured ? (
        <article className="mt-12 border-b border-ivory/10 pb-12">
          <p className="text-xs tracking-[0.28em] text-violet uppercase">{featured.kicker}</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-ivory md:text-5xl">
            <Link href={`/blog/${featured.slug}`} className="text-ivory no-underline hover:text-teal">
              {featured.title}
            </Link>
          </h2>
          <p className="mt-5 max-w-2xl font-serif text-lg leading-9 text-mist">{featured.summary}</p>
          <p className="mt-6 text-sm text-mute">
            {featured.date} · {featured.reading}
          </p>
          <Link href={`/blog/${featured.slug}`} className="mt-6 inline-flex text-sm text-teal no-underline">
            读这篇 →
          </Link>
        </article>
      ) : null}

      <div className="mt-12 grid gap-x-10 gap-y-12 md:grid-cols-2">
        {rest.map((post) => (
          <article key={post.slug} className="border-t border-ivory/10 pt-6">
            <p className="text-xs tracking-[0.22em] text-violet uppercase">{post.kicker}</p>
            <h3 className="mt-3 font-serif text-2xl leading-snug text-ivory">
              <Link href={`/blog/${post.slug}`} className="text-ivory no-underline hover:text-teal">
                {post.title}
              </Link>
            </h3>
            <p className="mt-3 text-sm leading-7 text-mist">{post.summary}</p>
            <p className="mt-5 text-xs text-mute">
              {post.date} · {post.reading}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
