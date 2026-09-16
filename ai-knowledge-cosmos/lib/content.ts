import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx/MDXComponents";

export type LessonMeta = {
  slug: string;
  title: string;
  summary: string;
  stage: string;
  duration: string;
  order: number;
  numeral: string;
  metaphor: string;
};

export type PostMeta = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  reading: string;
  kicker: string;
};

type Kind = "lessons" | "posts";

function dirFor(kind: Kind) {
  return path.join(process.cwd(), "content", kind);
}

function slugsIn(kind: Kind) {
  return fs
    .readdirSync(dirFor(kind))
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

function readSource(kind: Kind, slug: string) {
  const file = path.join(dirFor(kind), `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, "utf8");
}

export function getLessonMetas(): LessonMeta[] {
  return slugsIn("lessons")
    .map((slug) => {
      const raw = readSource("lessons", slug);
      if (!raw) return null;
      const { data } = matter(raw);
      return { slug, ...(data as Omit<LessonMeta, "slug">) };
    })
    .filter((item): item is LessonMeta => Boolean(item))
    .sort((a, b) => a.order - b.order);
}

export function getPostMetas(): PostMeta[] {
  return slugsIn("posts")
    .map((slug) => {
      const raw = readSource("posts", slug);
      if (!raw) return null;
      const { data } = matter(raw);
      return { slug, ...(data as Omit<PostMeta, "slug">) };
    })
    .filter((item): item is PostMeta => Boolean(item))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getLesson(slug: string) {
  const source = readSource("lessons", slug);
  if (!source) return null;
  const { content, frontmatter } = await compileMDX<Omit<LessonMeta, "slug">>({
    source,
    components: mdxComponents,
    options: { parseFrontmatter: true },
  });
  return { content, meta: { slug, ...frontmatter } };
}

export async function getPost(slug: string) {
  const source = readSource("posts", slug);
  if (!source) return null;
  const { content, frontmatter } = await compileMDX<Omit<PostMeta, "slug">>({
    source,
    components: mdxComponents,
    options: { parseFrontmatter: true },
  });
  return { content, meta: { slug, ...frontmatter } };
}

export function adjacentLessons(slug: string) {
  const all = getLessonMetas();
  const index = all.findIndex((item) => item.slug === slug);
  return {
    prev: index > 0 ? all[index - 1] : null,
    next: index >= 0 && index < all.length - 1 ? all[index + 1] : null,
  };
}
