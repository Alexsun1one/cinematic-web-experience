import { notFound } from "next/navigation";
import { ArticleShell } from "@/components/article/ArticleShell";
import { adjacentLessons, getLesson, getLessonMetas } from "@/lib/content";

export function generateStaticParams() {
  return getLessonMetas().map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = await getLesson(slug);
  if (!lesson) return { title: "未找到课程" };
  return { title: lesson.meta.title, description: lesson.meta.summary };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = await getLesson(slug);
  if (!lesson) notFound();
  const { prev, next } = adjacentLessons(slug);

  return (
    <ArticleShell
      kicker={`${lesson.meta.constellation} · STAGE ${lesson.meta.stage}`}
      title={lesson.meta.title}
      summary={lesson.meta.summary}
      meta={`${lesson.meta.duration} · ${lesson.meta.kicker}`}
      prev={prev ? { href: `/learn/${prev.slug}`, label: prev.title } : { href: "/learn", label: "课程目录" }}
      next={next ? { href: `/learn/${next.slug}`, label: next.title } : { href: "/knowledge", label: "打开星图" }}
    >
      {lesson.content}
    </ArticleShell>
  );
}
