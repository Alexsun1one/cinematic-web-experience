"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Group } from "three";
import { CanvasTexture, SRGBColorSpace } from "three";

function paperTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#f3ede2";
  ctx.fillRect(0, 0, 1024, 512);
  ctx.fillStyle = "#1a1612";
  ctx.font = "64px 'Noto Serif SC', serif";
  ctx.fillText("猫 坐在 垫子 上。 它 很 暖和。", 70, 260);
  ctx.font = "28px 'Noto Sans SC', sans-serif";
  ctx.fillStyle = "#6e675c";
  ctx.fillText("灯照到哪里，下一步就更依赖哪里。", 70, 340);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function LampRig({ yaw }: { yaw: number }) {
  const group = useRef<Group>(null);
  const texture = useMemo(() => paperTexture(), []);

  useEffect(() => () => texture?.dispose(), [texture]);

  return (
    <>
      <color attach="background" args={["#14110e"]} />
      <ambientLight intensity={0.18} />
      <group ref={group} position={[0, 1.6, 0]} rotation={[0.35, yaw, 0]}>
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 1.4, 12]} />
          <meshStandardMaterial color="#b8893a" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.3, 0.35]} rotation={[0.8, 0, 0]}>
          <coneGeometry args={[0.55, 0.7, 16, 1, true]} />
          <meshStandardMaterial color="#8a6424" metalness={0.4} roughness={0.45} side={2} />
        </mesh>
        <spotLight
          position={[0, -0.4, 0.5]}
          angle={0.42}
          penumbra={0.55}
          intensity={18}
          color="#f6e7c3"
          castShadow
        />
      </group>
      <mesh rotation={[-Math.PI / 2.15, 0, 0]} position={[0, -1.15, 0.4]} receiveShadow>
        <planeGeometry args={[4.6, 2.4]} />
        <meshStandardMaterial map={texture ?? undefined} color="#f3ede2" roughness={0.9} />
      </mesh>
      <OrbitControls enablePan={false} minDistance={4} maxDistance={8} maxPolarAngle={1.35} />
    </>
  );
}

export function LampSetpiece() {
  const [yaw, setYaw] = useState(-0.35);
  const [gpu, setGpu] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const probe = document.createElement("canvas");
    setGpu(Boolean(probe.getContext("webgl2") || probe.getContext("webgl")));
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div className="mt-10 overflow-hidden border border-ink/15 bg-night">
      <div className="flex items-end justify-between px-5 py-3 text-paper">
        <p className="font-serif text-gold">台灯 · 注视</p>
        <p className="text-xs text-paper/70">拖滑杆，把锥光从「猫」转到「它」。注意是加权，不是理解。</p>
      </div>
      <div className="h-[420px]">
        {!gpu || reduced ? (
          <div className="relative grid h-full place-items-center bg-night p-8">
            <p className="max-w-lg font-serif text-2xl leading-relaxed text-paper">
              <span className={yaw < 0 ? "bg-gold text-night" : "text-paper/40"}>猫坐在垫子上。</span>
              <span className={yaw >= 0 ? "bg-gold text-night" : "text-paper/40"}>它很暖和。</span>
            </p>
          </div>
        ) : (
          <Canvas shadows camera={{ position: [2.8, 2.2, 5.4], fov: 36 }} dpr={[1, 1.6]}>
            <LampRig yaw={yaw} />
          </Canvas>
        )}
      </div>
      <div className="px-5 py-4">
        <input
          type="range"
          min={-0.8}
          max={0.8}
          step={0.02}
          value={yaw}
          onChange={(event) => setYaw(Number(event.target.value))}
          className="w-full accent-gold"
          aria-label="转动台灯"
        />
      </div>
    </div>
  );
}
