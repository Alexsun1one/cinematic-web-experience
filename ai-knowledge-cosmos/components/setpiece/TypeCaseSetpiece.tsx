"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Mesh, Texture } from "three";
import { CanvasTexture, SRGBColorSpace } from "three";

const GLYPHS = ["今", "晚", "月", "色", "很", "好", "不", "错", "像", "霜", "的", "风"];

function makeFace(char: string, lifted: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = lifted ? "#b8893a" : "#d8cbb6";
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = "#1a1612";
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 240, 240);
  ctx.fillStyle = "#1a1612";
  ctx.font = "140px 'Noto Serif SC', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(char, 128, 148);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function Block({
  char,
  position,
  lifted,
  onPick,
}: {
  char: string;
  position: [number, number, number];
  lifted: boolean;
  onPick: () => void;
}) {
  const mesh = useRef<Mesh>(null);
  const texture = useMemo(() => makeFace(char, lifted), [char, lifted]);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    const target = lifted ? 0.55 : 0;
    mesh.current.position.y += (target - mesh.current.position.y) * Math.min(1, delta * 6);
  });

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  if (!texture) return null;

  return (
    <mesh
      ref={mesh}
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        onPick();
      }}
    >
      <boxGeometry args={[0.72, 0.72, 0.72]} />
      <meshStandardMaterial map={texture as Texture} roughness={0.55} metalness={0.05} />
    </mesh>
  );
}

function TypeCaseScene({ active, onPick }: { active: number; onPick: (index: number) => void }) {
  return (
    <>
      <color attach="background" args={["#14110e"]} />
      <hemisphereLight args={["#f3ede2", "#1a1612", 0.55]} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} color="#f6e7c3" />
      <spotLight position={[-2, 6, 2]} angle={0.5} penumbra={0.6} intensity={1.2} color="#b8893a" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.46, 0]} receiveShadow>
        <boxGeometry args={[5.6, 4.2, 0.18]} />
        <meshStandardMaterial color="#5c4030" roughness={0.85} />
      </mesh>
      {GLYPHS.map((char, index) => {
        const col = index % 4;
        const row = Math.floor(index / 4);
        return (
          <Block
            key={`${char}-${index}`}
            char={char}
            lifted={index === active}
            position={[(col - 1.5) * 0.92, 0, (row - 1) * 0.92]}
            onPick={() => onPick(index)}
          />
        );
      })}
      <OrbitControls enablePan={false} minDistance={4} maxDistance={9} maxPolarAngle={Math.PI / 2.05} />
    </>
  );
}

function TypeCaseFlat({ active, onPick }: { active: number; onPick: (index: number) => void }) {
  return (
    <div className="grid h-full place-items-center bg-night p-6">
      <div className="grid grid-cols-4 gap-2">
        {GLYPHS.map((char, index) => (
          <button
            key={`${char}-${index}`}
            type="button"
            onClick={() => onPick(index)}
            className={`grid h-16 w-16 place-items-center font-serif text-2xl ${
              index === active ? "bg-gold text-night" : "bg-paper-2 text-ink"
            }`}
          >
            {char}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TypeCaseSetpiece() {
  const [active, setActive] = useState(4);
  const [gpu, setGpu] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const probe = document.createElement("canvas");
    const ok = Boolean(probe.getContext("webgl2") || probe.getContext("webgl"));
    setGpu(ok);
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div className="mt-10 overflow-hidden border border-ink/15 bg-night">
      <div className="flex items-end justify-between px-5 py-3 text-paper">
        <p className="font-serif text-gold">排字盘 · 下一颗</p>
        <p className="text-xs text-paper/70">点一块铅字，看谁被捡起来。拖曳旋转盘子。</p>
      </div>
      <div className="h-[420px]">
        {!gpu || reduced ? (
          <TypeCaseFlat active={active} onPick={setActive} />
        ) : (
          <Canvas camera={{ position: [2.4, 3.2, 6.2], fov: 38 }} dpr={[1, 1.6]}>
            <TypeCaseScene active={active} onPick={setActive} />
          </Canvas>
        )}
      </div>
      <p className="px-5 py-3 text-sm text-paper/80">
        此刻被捡起的是「{GLYPHS[active]}」。排字工不理解月亮，他只是手快。
      </p>
    </div>
  );
}
