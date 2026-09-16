import Link from "next/link";
import { CosmosExperience } from "@/components/cosmos/CosmosExperience";
import { LessonCard, PostCard } from "@/components/ui/Cards";
import { getLessonMetas, getPostMetas } from "@/lib/content";
import { site } from "@/lib/site";

export default function HomePage() {
  const lessons = getLessonMetas();
  const posts = getPostMetas().slice(0, 3);

  return (
    <main>
      <CosmosExperience />
      <section className="mx-auto max-w-6xl px-5 py-20">
        <p className="text-xs tracking-[0.28em] text-teal uppercase">0 → 1 Journey</p>
        <h2 className="mt-3 font-serif text-4xl text-ivory">六站旅程，不从工具清单开始</h2>
        <p className="mt-4 max-w-2xl leading-8 text-mist">
          {site.tagline}
          先建立对模型的直觉，再谈切分与预算，然后才是提示词、对齐、工具循环与动手闭环。
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.slug} lesson={lesson} />
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.28em] text-violet uppercase">Field Notes</p>
            <h2 className="mt-3 font-serif text-4xl text-ivory">观测笔记</h2>
          </div>
          <Link href="/blog" className="text-sm text-teal no-underline">
            全部笔记 →
          </Link>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}
