"use client";

export function GalleryRail({
  active,
  count,
  onJump,
}: {
  active: number;
  count: number;
  onJump: (index: number) => void;
}) {
  return (
    <div className="pointer-events-none fixed top-1/2 right-3 z-40 hidden -translate-y-1/2 md:flex">
      <div className="pointer-events-auto flex flex-col items-center gap-0">
        <span className="mb-3 font-mono text-[9px] tracking-[0.28em] text-acid/70">厅</span>
        <span className="mb-2 h-8 w-px bg-acid/25" />
        <ol className="flex flex-col">
          {Array.from({ length: count }, (_, index) => (
            <li key={index}>
              <button
                type="button"
                aria-label={`第 ${index} 厅`}
                aria-current={index === active ? "true" : undefined}
                onClick={() => onJump(index)}
                className="rail-dot"
              >
                <span className={index === active ? "is-here" : undefined} />
              </button>
            </li>
          ))}
        </ol>
        <span className="mt-2 h-8 w-px bg-acid/25" />
      </div>
    </div>
  );
}
