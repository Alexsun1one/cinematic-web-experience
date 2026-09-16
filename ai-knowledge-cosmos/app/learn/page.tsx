import Link from "next/link";
import { getLessonMetas } from "@/lib/content";
import { chapterBySlug } from "@/lib/journey";

export const metadata = {
  title: "展墙",
};

export default function LearnIndexPage() {
  const lessons = getLessonMetas();

  return (
    <main className="px-5 pt-28 pb-24 md:px-12">
      <p className="font-serif text-[min(28vw,12rem)] leading-none text-acid/80">墙</p>
      <h1 className="mt-2 font-serif text-5xl text-bone md:text-7xl">展墙文本</h1>
      <p className="mt-6 max-w-lg font-serif text-xl leading-8 text-fog">
        走廊里座上只有一件展品。这里把墙上的字读完。每厅一个隐喻，一个教得会的工件。
      </p>
      <ol className="mt-16">
        {lessons.map((lesson) => {
          const chapter = chapterBySlug(lesson.slug);
          return (
            <li key={lesson.slug} className="grid gap-3 border-t border-acid/15 py-10 md:grid-cols-[7rem_1fr_auto] md:items-end">
              <p className="font-serif text-5xl text-acid">{lesson.numeral}</p>
              <Link href={`/learn/${lesson.slug}`} className="group block no-underline">
                <h2 className="font-serif text-3xl text-bone group-hover:text-acid">{lesson.title}</h2>
                <p className="mt-2 font-serif leading-8 text-fog">{lesson.metaphor}</p>
              </Link>
              <p className="text-sm text-fog">
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
