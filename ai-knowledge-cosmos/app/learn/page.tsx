import Link from "next/link";
import { getLessonMetas } from "@/lib/content";
import { chapterBySlug } from "@/lib/journey";

export const metadata = {
  title: "课文",
};

export default function LearnIndexPage() {
  const lessons = getLessonMetas();

  return (
    <main className="mx-auto max-w-3xl px-5 pt-28 pb-20">
      <p className="font-serif text-6xl text-gold">目</p>
      <h1 className="mt-6 font-serif text-5xl text-ink">课文</h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-ink-soft">
        不是卡片墙。按行程的顺序往下读。每课一篇，配一个教得会的玩具。
      </p>
      <ol className="mt-14">
        {lessons.map((lesson) => {
          const chapter = chapterBySlug(lesson.slug);
          return (
            <li key={lesson.slug} className="border-t border-ink/10 py-8">
              <Link href={`/learn/${lesson.slug}`} className="group block no-underline">
                <p className="font-serif text-3xl text-gold">{lesson.numeral}</p>
                <h2 className="mt-3 font-serif text-3xl text-ink group-hover:text-gold-deep">{lesson.title}</h2>
                <p className="mt-3 font-serif leading-8 text-ink-soft">{lesson.metaphor}</p>
                <p className="mt-2 text-sm text-mist">
                  {lesson.duration}
                  {chapter ? ` · ${chapter.cta}` : ""}
                </p>
              </Link>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
