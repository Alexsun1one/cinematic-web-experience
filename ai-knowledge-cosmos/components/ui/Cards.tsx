import Link from "next/link";
import type { LessonMeta, PostMeta } from "@/lib/content";
import { colorHex, type NodeColor } from "@/lib/cosmos";

export function LessonCard({ lesson }: { lesson: LessonMeta }) {
  const accent = colorHex[lesson.color as NodeColor] ?? colorHex.teal;
  return (
    <Link
      href={`/learn/${lesson.slug}`}
      className="panel group relative block overflow-hidden rounded-3xl p-6 no-underline transition-transform duration-300 hover:-translate-y-0.5"
    >
      <span className="absolute inset-x-0 top-0 h-px" style={{ background: accent }} />
      <div className="flex items-center justify-between text-xs tracking-[0.22em] text-mute">
        <span>STAGE {lesson.stage}</span>
        <span>{lesson.duration}</span>
      </div>
      <h3 className="mt-5 font-serif text-2xl text-ivory">{lesson.title}</h3>
      <p className="mt-3 text-sm leading-7 text-mist">{lesson.summary}</p>
      <p className="mt-6 text-sm text-teal">进入星体 →</p>
    </Link>
  );
}

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="panel block rounded-3xl p-6 no-underline transition-transform duration-300 hover:-translate-y-0.5"
    >
      <p className="text-xs tracking-[0.22em] text-violet uppercase">{post.kicker}</p>
      <h3 className="mt-4 font-serif text-2xl text-ivory">{post.title}</h3>
      <p className="mt-3 text-sm leading-7 text-mist">{post.summary}</p>
      <p className="mt-6 text-xs text-mute">
        {post.date} · {post.reading}
      </p>
    </Link>
  );
}
