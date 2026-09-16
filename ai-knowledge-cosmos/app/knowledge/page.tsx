import { FloorPlan } from "@/components/knowledge/FloorPlan";

export const metadata = {
  title: "平面",
};

export default function KnowledgePage() {
  return (
    <main className="px-5 pt-28 pb-20 md:px-12">
      <p className="font-serif text-[min(22vw,9rem)] leading-none text-acid/80">图</p>
      <h1 className="mt-2 font-serif text-5xl text-bone">一层平面</h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-fog">
        展厅负责走。平面负责看见顺序。这是走廊的骨头，不是另一张发光网络。
      </p>
      <div className="mt-14">
        <FloorPlan />
      </div>
    </main>
  );
}
