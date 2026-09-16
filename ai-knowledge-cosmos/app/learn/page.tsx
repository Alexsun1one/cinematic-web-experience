import { LessonCard } from "@/components/ui/Cards";
import { getLessonMetas } from "@/lib/content";

export const metadata = {
  title: "课程",
};

export default function LearnPage() {
  const lessons = getLessonMetas();
  return (
    <main className="mx-auto max-w-6xl px-5 pt-24 pb-16">
      <p className="text-xs tracking-[0.28em] text-teal uppercase">Curriculum</p>
      <h1 className="mt-3 font-serif text-5xl text-ivory">六站课程</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-mist">
        这是一条给完全新手的路径：不假设你会写代码，但假设你愿意亲手检验模型的输出。每站都有一个可完成的练习。
      </p>
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {lessons.map((lesson) => (
          <LessonCard key={lesson.slug} lesson={lesson} />
        ))}
      </div>
    </main>
  );
}
