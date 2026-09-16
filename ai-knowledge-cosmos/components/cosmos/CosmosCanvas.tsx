"use client";

import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { CosmosScene } from "@/components/cosmos/CosmosScene";

export default function CosmosCanvas({
  focused,
  reduced,
  distance,
  onFocus,
}: {
  focused: string | null;
  reduced: boolean;
  distance: number;
  onFocus: (id: string | null) => void;
}) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <Canvas
      camera={{ position: [0, 1.2, 10], fov: 42 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      frameloop={reduced ? "demand" : "always"}
      onPointerMissed={() => onFocus(null)}
    >
      <CosmosScene
        focused={focused}
        reduced={reduced}
        distance={distance}
        onFocus={onFocus}
        controlsRef={controlsRef}
      />
    </Canvas>
  );
}
