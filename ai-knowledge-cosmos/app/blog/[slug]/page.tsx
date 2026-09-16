import { notFound } from "next/navigation";
import { ArticleShell } from "@/components/article/ArticleShell";
import { getPost, getPostMetas } from "@/lib/content";

export function generateStaticParams() {
  return getPostMetas().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "未找到笔记" };
  return { title: post.meta.title, description: post.meta.summary };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const all = getPostMetas();
  const index = all.findIndex((item) => item.slug === slug);
  const prev = index < all.length - 1 ? all[index + 1] : null;
  const next = index > 0 ? all[index - 1] : null;

  return (
    <ArticleShell
      kicker={post.meta.kicker}
      title={post.meta.title}
      summary={post.meta.summary}
      meta={`${post.meta.date} · ${post.meta.reading}`}
      prev={prev ? { href: `/blog/${prev.slug}`, label: prev.title } : { href: "/blog", label: "笔记目录" }}
      next={next ? { href: `/blog/${next.slug}`, label: next.title } : { href: "/learn", label: "回到课程" }}
      variant="magazine"
    >
      {post.content}
    </ArticleShell>
  );
}
