export const metadata = {
  title: "馆务",
};

export default function AboutPage() {
  return (
    <main className="px-5 pt-28 pb-20 md:px-12">
      <p className="font-serif text-[min(24vw,10rem)] leading-none text-acid/80">馆</p>
      <h1 className="mt-2 max-w-3xl font-serif text-5xl leading-tight text-bone md:text-6xl">一座只在夜里开放的馆</h1>
      <div className="prose-wall mt-10 max-w-2xl">
        <p>
          我不是实验室成员，也不代表任何模型公司。这个站点把「从完全外行到能独立使用当代
          AI」做成一条可走完的走廊：门厅、展柜、射灯，而不是另一座发光球体，也不是一份纸杂志的黑白翻版。
        </p>
        <h2>为什么是夜览馆</h2>
        <p>
          目录适合检索。球体适合炫技。杂志适合被夸「有品味」。夜览馆适合建立手感：续写像被点亮的下一颗字，注意像一盏会转的射灯，拒绝像盖下去的章。三维只出现在需要被「感到」的两件展品上，不当背景气氛。
        </p>
        <h2>内容原则</h2>
        <ul>
          <li>中文优先。必要术语保留英文原词。</li>
          <li>只写原创教学。灵感来自公开课程、公开博客与产品教育，不粘贴专有文档。</li>
          <li>每厅一个隐喻，一座教具。教具标明「示意」。</li>
          <li>减弱动效时，走廊改为竖向叠厅；铅字盘和射灯变成平面版，墙上的字仍可读。</li>
        </ul>
        <h2>作者</h2>
        <p>观星。白天做设计与写作，晚上把搞不懂的模型问题拆成可以在走廊里讲完的短课。</p>
      </div>
    </main>
  );
}
