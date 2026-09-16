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
    <ol className="pointer-events-auto fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 flex-col gap-2 md:flex">
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <button
            type="button"
            aria-label={`第 ${index} 厅`}
            onClick={() => onJump(index)}
            className={`block h-2.5 w-2.5 rounded-full border ${
              index === active ? "border-acid bg-acid" : "border-acid/35 bg-transparent"
            }`}
          />
        </li>
      ))}
    </ol>
  );
}
