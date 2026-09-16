export const metadata = {
  title: "关于",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pt-28 pb-20">
      <p className="font-serif text-6xl text-gold">识</p>
      <h1 className="mt-6 font-serif text-5xl leading-tight text-ink">一座给自己用的编辑室</h1>
      <div className="prose-studio mt-10">
        <p>
          我不是实验室成员，也不代表任何模型公司。这个站点把「从完全外行到能独立使用当代 AI」做成一条可走完的路：纸页、铅字、台灯，而不是另一座发光球体。
        </p>
        <h2>为什么是编辑室，不是宇宙球</h2>
        <p>
          目录适合检索。球适合炫技。编辑室适合建立手感：续写像捡铅字，注意像转灯，拒绝像盖章。三维只出现在需要被「感到」的两处高潮，不当背景气氛。
        </p>
        <h2>内容原则</h2>
        <ul>
          <li>中文优先。必要术语保留英文原词。</li>
          <li>只写原创教学。灵感来自公开课程、公开博客与产品教育，不粘贴专有文档。</li>
          <li>每课一个隐喻，一个教得会的玩具。玩具标明「示意」。</li>
          <li>减弱动效时，铅字盘和台灯变成平面版，课文仍可读。</li>
        </ul>
        <h2>作者</h2>
        <p>观星。白天做设计与写作，晚上把搞不懂的模型问题拆成可以给朋友讲的短课。</p>
      </div>
    </main>
  );
}
