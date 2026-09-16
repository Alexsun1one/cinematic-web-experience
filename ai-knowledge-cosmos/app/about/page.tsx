export const metadata = {
  title: "关于",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pt-24 pb-16">
      <p className="text-xs tracking-[0.28em] text-rose uppercase">About</p>
      <h1 className="mt-3 font-serif text-5xl leading-tight text-ivory">一座给自己用的学习剧场</h1>
      <div className="prose-cosmos mt-8">
        <p>
          我不是实验室成员，也不代表任何模型公司。这个站点是我把「从完全外行到能独立使用当代 AI」这件事，做成可走、可检视、可反复回来的空间。
        </p>
        <h2>为什么是宇宙，而不是目录</h2>
        <p>
          目录适合检索，宇宙适合建立方位感。语言模型、Token、提示词、对齐、工具循环、核验、注意力，本来就互相牵连。把它们放成可旋转的星体，是为了让你先看见结构，再进入文字。
        </p>
        <h2>内容原则</h2>
        <ul>
          <li>中文优先，术语保留必要的英文原词。</li>
          <li>只写原创教学：灵感来自公开课程、公开博客与产品教育，不粘贴专有文档。</li>
          <li>每门课都有一个能在十二分钟内做完的练习。</li>
          <li>WebGL 不是唯一入口：减弱动效时，静态星图与全部文字课程仍可用。</li>
        </ul>
        <h2>灵感来源（公开教育学）</h2>
        <p>
          我读过并受惠于：大学 NLP 公开课对「语言模型是概率系统」的讲法；实验室把对齐写成公开研究博客的习惯；以及把智能体解释成「模型 + 工具 + 循环」的产品教育。这里重写的是直觉与练习，不是原文。
        </p>
        <h2>作者</h2>
        <p>
          观星。白天做设计与写作，晚上把搞不懂的模型问题拆成可以给朋友讲的短课。如果你也走在 0→1 的路上，欢迎把这张星图当成可以涂改的地图，而不是标准答案。
        </p>
      </div>
    </main>
  );
}
