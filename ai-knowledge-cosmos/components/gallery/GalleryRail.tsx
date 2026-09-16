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
        <ol className="flex flex-col gap-2">
          {Array.from({ length: count }, (_, index) => (
            <li key={index}>
              <button
                type="button"
                aria-label={`第 ${index} 厅`}
                onClick={() => onJump(index)}
                className={`block h-2 w-2 rounded-full border transition-[transform,background-color,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  index === active
                    ? "scale-125 border-acid bg-acid"
                    : "border-acid/30 bg-transparent hover:scale-110 hover:border-acid active:scale-90"
                }`}
              />
            </li>
          ))}
        </ol>
        <span className="mt-2 h-8 w-px bg-acid/25" />
      </div>
    </div>
  );
}
