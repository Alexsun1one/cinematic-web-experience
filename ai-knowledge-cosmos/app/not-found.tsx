import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-5 py-24">
      <p className="font-serif text-6xl text-gold">空</p>
      <h1 className="mt-6 font-serif text-5xl text-ink">这一页还没印出来</h1>
      <p className="mt-4 text-ink-soft">回到行程，或从课文目录重新翻。</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="border border-ink bg-ink px-4 py-2 text-sm text-paper no-underline">
          行程
        </Link>
        <Link href="/learn" className="border border-ink/20 px-4 py-2 text-sm no-underline">
          课文
        </Link>
      </div>
    </main>
  );
}
