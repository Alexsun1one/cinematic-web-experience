import { LessonCard } from "@/components/ui/Cards";
import { JourneyWorlds } from "@/components/learn/JourneyWorlds";
import { getLessonMetas } from "@/lib/content";

export const metadata = {
  title: "课程",
};

export default function LearnPage() {
  const lessons = getLessonMetas();
  return (
    <main className="mx-auto max-w-6xl px-5 pt-24 pb-16">
      <p className="text-xs tracking-[0.28em] text-teal uppercase">Curriculum</p>
      <h1 className="mt-3 font-serif text-5xl text-ivory">七座世界</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-mist">
        0→1 不是清单，是一串可以点亮的世界。打开一课后会记下抵达；回来时，星轨会告诉你走到了哪。
      </p>
      <div className="mt-10">
        <JourneyWorlds lessons={lessons} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {lessons.map((lesson) => (
          <LessonCard key={lesson.slug} lesson={lesson} />
        ))}
      </div>
    </main>
  );
}
