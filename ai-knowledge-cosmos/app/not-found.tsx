import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-5 py-24">
      <p className="font-serif text-6xl text-acid">空</p>
      <h1 className="mt-6 font-serif text-5xl text-bone">这一厅还没点灯</h1>
      <p className="mt-4 text-fog">回到走廊，或从展墙目录重新走。</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="cta-acid">
          展厅
        </Link>
        <Link href="/learn" className="cta-ghost">
          展墙
        </Link>
      </div>
    </main>
  );
}
