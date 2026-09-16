import Link from "next/link";
import { getLessonMetas } from "@/lib/content";
import { chapterBySlug } from "@/lib/journey";

export const metadata = {
  title: "课文",
};

export default function LearnIndexPage() {
  const lessons = getLessonMetas();

  return (
    <main className="mx-auto max-w-[1400px] px-5 pt-28 pb-20 md:px-12">
      <p className="font-serif text-[7rem] leading-none text-gold">目</p>
      <h1 className="mt-4 font-serif text-5xl text-ink md:text-7xl">课文</h1>
      <p className="mt-6 max-w-lg font-serif text-xl leading-8 text-ink-soft">按行程的顺序往下读。每课一个隐喻，一个教得会的玩具。</p>
      <ol className="mt-16">
        {lessons.map((lesson) => {
          const chapter = chapterBySlug(lesson.slug);
          return (
            <li key={lesson.slug} className="grid gap-3 border-t border-ink/10 py-8 md:grid-cols-[7rem_1fr_auto] md:items-end">
              <p className="font-serif text-4xl text-gold">{lesson.numeral}</p>
              <Link href={`/learn/${lesson.slug}`} className="group block no-underline">
                <h2 className="font-serif text-3xl text-ink group-hover:text-gold-deep">{lesson.title}</h2>
                <p className="mt-2 font-serif leading-8 text-ink-soft">{lesson.metaphor}</p>
              </Link>
              <p className="text-sm text-mist">
                {lesson.duration}
                {chapter ? ` · ${chapter.index}` : ""}
              </p>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
