import { PostCard } from "@/components/ui/Cards";
import { getPostMetas } from "@/lib/content";

export const metadata = {
  title: "笔记",
};

export default function BlogPage() {
  const posts = getPostMetas();
  return (
    <main className="mx-auto max-w-6xl px-5 pt-24 pb-16">
      <p className="text-xs tracking-[0.28em] text-violet uppercase">Journal</p>
      <h1 className="mt-3 font-serif text-5xl text-ivory">观测笔记</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-mist">
        课程是骨架，笔记是体温：记录我在公开材料里走弯路、改顺序、重新理解的过程。
      </p>
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </main>
  );
}
