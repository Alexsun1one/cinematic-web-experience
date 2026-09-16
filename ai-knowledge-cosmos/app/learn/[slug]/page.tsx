import { notFound } from "next/navigation";
import { ArticleShell } from "@/components/article/ArticleShell";
import { adjacentLessons, getLesson, getLessonMetas } from "@/lib/content";

export function generateStaticParams() {
  return getLessonMetas().map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = await getLesson(slug);
  if (!lesson) return { title: "未找到课文" };
  return { title: lesson.meta.title, description: lesson.meta.summary };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = await getLesson(slug);
  if (!lesson) notFound();
  const { prev, next } = adjacentLessons(slug);

  return (
    <ArticleShell
      visitSlug={slug}
      numeral={lesson.meta.numeral}
      kicker={`${lesson.meta.duration} · ${lesson.meta.metaphor}`}
      title={lesson.meta.title}
      summary={lesson.meta.summary}
      meta={`第 ${lesson.meta.stage} 课`}
      prev={prev ? { href: `/learn/${prev.slug}`, label: prev.title } : { href: "/learn", label: "课文目录" }}
      next={next ? { href: `/learn/${next.slug}`, label: next.title } : { href: "/", label: "回到行程" }}
    >
      {lesson.content}
    </ArticleShell>
  );
}
