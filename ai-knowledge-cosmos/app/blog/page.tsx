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
    <main className="mx-auto max-w-4xl px-5 pt-28 pb-24">
      <p className="font-serif text-6xl text-gold">刊</p>
      <h1 className="mt-6 font-serif text-6xl text-ink md:text-7xl">观测笔记</h1>
      <p className="mt-6 max-w-xl font-serif text-xl leading-9 text-ink-soft">
        课文是骨架。这里是边走边改口吻的地方。不定期，不堆卡片。
      </p>
      <p className="mt-4 text-sm text-mist">
        {site.author} · {posts.length} 篇
      </p>

      {featured ? (
        <article className="mt-16 border-t border-ink pt-10">
          <p className="text-sm text-gold-deep">{featured.kicker}</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
            <Link href={`/blog/${featured.slug}`} className="text-ink no-underline hover:text-gold-deep">
              {featured.title}
            </Link>
          </h2>
          <p className="mt-6 max-w-2xl font-serif text-lg leading-9 text-ink-soft">{featured.summary}</p>
          <p className="mt-5 text-sm text-mist">
            {featured.date} · {featured.reading}
          </p>
        </article>
      ) : null}

      <ol className="mt-6">
        {rest.map((post) => (
          <li key={post.slug} className="border-t border-ink/10 py-8">
            <p className="text-sm text-mist">{post.kicker}</p>
            <h3 className="mt-2 font-serif text-2xl">
              <Link href={`/blog/${post.slug}`} className="text-ink no-underline hover:text-gold-deep">
                {post.title}
              </Link>
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-mist">{post.summary}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}
