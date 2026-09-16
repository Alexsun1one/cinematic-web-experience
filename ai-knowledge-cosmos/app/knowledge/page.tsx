import { InkAtlas } from "@/components/knowledge/InkAtlas";

export const metadata = {
  title: "图录",
};

export default function KnowledgePage() {
  return (
    <main className="mx-auto max-w-6xl px-5 pt-28 pb-20">
      <p className="font-serif text-6xl text-gold">录</p>
      <h1 className="mt-6 font-serif text-5xl text-ink">图录</h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-ink-soft">
        行程负责走。图录负责看见顺序。墨线连着八课，不是另一张发光网络。
      </p>
      <div className="mt-14">
        <InkAtlas />
      </div>
    </main>
  );
}
