import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-5 py-24">
      <p className="text-xs tracking-[0.28em] text-rose uppercase">404</p>
      <h1 className="mt-3 font-serif text-5xl text-ivory">这颗星还没有被点亮</h1>
      <p className="mt-4 text-mist">你走进了星图之外。回到宇宙，或从六站课程重新开始。</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="rounded-full bg-ivory px-4 py-2 text-sm text-void no-underline">
          返回宇宙
        </Link>
        <Link href="/learn" className="rounded-full border border-ivory/20 px-4 py-2 text-sm no-underline">
          打开课程
        </Link>
      </div>
    </main>
  );
}
