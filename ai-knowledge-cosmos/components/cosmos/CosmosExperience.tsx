"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { CosmosFallback } from "@/components/cosmos/CosmosFallback";
import { CosmosHUD } from "@/components/cosmos/CosmosHUD";

const CosmosCanvas = dynamic(() => import("@/components/cosmos/CosmosCanvas"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-void" />,
});

export function CosmosExperience() {
  const prefersReduced = useReducedMotion();
  const [manualStill, setManualStill] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [distance, setDistance] = useState(10);
  const reduced = Boolean(prefersReduced) || manualStill;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setFocused(null);
      if (event.key === "=" || event.key === "+") setDistance((value) => Math.max(4.5, value * 0.88));
      if (event.key === "-" || event.key === "_") setDistance((value) => Math.min(16, value * 1.12));
      if (/^[1-7]$/.test(event.key)) {
        const order = [
          "llm-intuition",
          "tokens",
          "prompting",
          "alignment",
          "tools-agents",
          "hands-on",
          "verification",
        ];
        setFocused(order[Number(event.key) - 1] ?? null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative h-[100svh] min-h-[640px] overflow-hidden bg-void">
      {reduced ? (
        <CosmosFallback focused={focused} onFocus={setFocused} />
      ) : (
        <CosmosCanvas
          focused={focused}
          reduced={false}
          distance={distance}
          onFocus={setFocused}
        />
      )}
      <div className="vignette" />
      <CosmosHUD
        focused={focused}
        reduced={reduced}
        onFocus={setFocused}
        onReset={() => {
          setFocused(null);
          setDistance(10);
        }}
        onZoom={(dir) => {
          setDistance((value) => {
            const next = dir < 0 ? value * 0.86 : value * 1.14;
            return Math.min(16, Math.max(4.5, next));
          });
        }}
        onToggleMotion={() => {
          setManualStill((value) => !value);
          setFocused(null);
        }}
      />
    </div>
  );
}
