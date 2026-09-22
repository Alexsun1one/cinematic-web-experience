"use client";

import { useEffect, useRef, useState } from "react";
import { aceStripLabel, shouldFlashAceDrop } from "@/lib/ace-strip";

type TeamId = "ns" | "ew";

export function AceStrip({
  levels,
  aceFails,
  aceLimit,
}: {
  levels: { ns: string; ew: string };
  aceFails: { ns: number; ew: number };
  aceLimit: number;
}) {
  const [team, setTeam] = useState<TeamId>("ns");
  const [flash, setFlash] = useState(false);
  const previous = useRef(levels);

  useEffect(() => {
    const before = previous.current;
    const dropped = (["ns", "ew"] as const).find((id) => shouldFlashAceDrop(before[id], levels[id]));
    previous.current = levels;
    if (!dropped) return;
    setTeam(dropped);
    setFlash(true);
    const timer = window.setTimeout(() => setFlash(false), 1400);
    return () => window.clearTimeout(timer);
  }, [levels]);

  const label = aceStripLabel(aceFails[team] ?? 0, aceLimit);

  return (
    <div className={`ace-strip ${flash ? "flash" : ""}`} data-testid="ace-strip" role="status">
      <div className="ace-teams" aria-label="本方">
        <button type="button" className={team === "ns" ? "on" : ""} onClick={() => setTeam("ns")}>
          南北
        </button>
        <button type="button" className={team === "ew" ? "on" : ""} onClick={() => setTeam("ew")}>
          东西
        </button>
      </div>
      <strong data-testid="ace-strip-text">{label}</strong>
    </div>
  );
}
