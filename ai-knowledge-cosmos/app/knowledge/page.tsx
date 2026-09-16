import { KnowledgeAtlas } from "@/components/knowledge/KnowledgeAtlas";

export const metadata = {
  title: "星图",
};

export default function KnowledgePage() {
  return (
    <main className="mx-auto max-w-6xl px-5 pt-24 pb-16">
      <p className="text-xs tracking-[0.28em] text-amber uppercase">Atlas</p>
      <h1 className="mt-3 font-serif text-5xl text-ivory">知识星图</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-mist">
        宇宙首页负责「走进去」的身体感；这张星图负责「看见结构」。点击节点查看相邻关系，再跳进课程或笔记。
      </p>
      <div className="mt-10">
        <KnowledgeAtlas />
      </div>
    </main>
  );
}
