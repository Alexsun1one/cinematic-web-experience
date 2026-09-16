"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { type ReactNode, useEffect, useRef, useState } from "react";

function InvalidateOnPlay({ play }: { play: boolean }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    if (play) invalidate();
  }, [play, invalidate]);
  return null;
}

export function LiveCanvas({
  children,
  camera,
}: {
  children: ReactNode;
  camera: { position: [number, number, number]; fov: number };
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const node = wrap.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) => setPlay(entry.isIntersecting), {
      threshold: 0.18,
    });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="h-full">
      <Canvas
        shadows
        frameloop={play ? "always" : "demand"}
        dpr={[1, 1.5]}
        camera={camera}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <InvalidateOnPlay play={play} />
        {children}
      </Canvas>
    </div>
  );
}
