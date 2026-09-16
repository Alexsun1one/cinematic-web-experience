"use client";

import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Mesh, Texture } from "three";
import { CanvasTexture, SRGBColorSpace } from "three";
import { useGpu, useReducedMotion } from "@/lib/motion-pref";

const GLYPHS = ["今", "晚", "月", "色", "很", "好", "不", "错", "像", "霜", "的", "风"];

function woodTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#5a3a24";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 48; i += 1) {
    ctx.strokeStyle = `rgba(20,12,6,${0.08 + (i % 5) * 0.03})`;
    ctx.lineWidth = 2 + (i % 3);
    ctx.beginPath();
    ctx.moveTo(0, i * 11);
    ctx.bezierCurveTo(180, i * 11 + 8, 320, i * 11 - 6, 512, i * 11 + 4);
    ctx.stroke();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function makeFace(char: string, lifted: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = lifted ? "#b57a28" : "#ead9bb";
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = "rgba(22,18,14,0.08)";
  for (let i = 0; i < 14; i += 1) ctx.fillRect(12, 18 + i * 16, 232, 1);
  ctx.strokeStyle = "#16120e";
  ctx.lineWidth = 5;
  ctx.strokeRect(10, 10, 236, 236);
  ctx.fillStyle = "#16120e";
  ctx.font = "132px 'Noto Serif SC', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(char, 128, 150);
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
    const target = lifted ? 0.62 : 0;
    mesh.current.position.y += (target - mesh.current.position.y) * Math.min(1, delta * 7);
    const rot = lifted ? -0.12 : 0;
    mesh.current.rotation.z += (rot - mesh.current.rotation.z) * Math.min(1, delta * 6);
  });

  useEffect(() => () => texture?.dispose(), [texture]);
  if (!texture) return null;

  return (
    <mesh
      ref={mesh}
      position={position}
      castShadow
      onClick={(event) => {
        event.stopPropagation();
        onPick();
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <boxGeometry args={[0.7, 0.7, 0.7]} />
      <meshStandardMaterial attach="material-0" color="#7a5230" roughness={0.72} />
      <meshStandardMaterial attach="material-1" color="#7a5230" roughness={0.72} />
      <meshStandardMaterial attach="material-2" map={texture as Texture} roughness={0.42} />
      <meshStandardMaterial attach="material-3" color="#4a2f1c" roughness={0.9} />
      <meshStandardMaterial attach="material-4" color="#7a5230" roughness={0.72} />
      <meshStandardMaterial attach="material-5" color="#7a5230" roughness={0.72} />
    </mesh>
  );
}

function TypeCaseScene({ active, onPick }: { active: number; onPick: (index: number) => void }) {
  const wood = useMemo(() => woodTexture(), []);
  useEffect(() => () => wood?.dispose(), [wood]);

  return (
    <>
      <color attach="background" args={["#100e0c"]} />
      <fog attach="fog" args={["#100e0c", 8, 16]} />
      <hemisphereLight args={["#f3e6cc", "#1a120c", 0.35]} />
      <spotLight
        position={[3.2, 6.4, 2.4]}
        angle={0.42}
        penumbra={0.7}
        intensity={2.4}
        color="#f3e0b8"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-3, 2, -2]} intensity={0.4} color="#b57a28" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, 0]} receiveShadow>
        <boxGeometry args={[5.2, 4.1, 0.22]} />
        <meshStandardMaterial map={wood ?? undefined} color="#5a3a24" roughness={0.86} />
      </mesh>
      <mesh position={[0, -0.32, -2.05]}>
        <boxGeometry args={[5.2, 0.4, 0.16]} />
        <meshStandardMaterial color="#3d2616" roughness={0.8} />
      </mesh>
      {GLYPHS.map((char, index) => {
        const col = index % 4;
        const row = Math.floor(index / 4);
        return (
          <Block
            key={`${char}-${index}`}
            char={char}
            lifted={index === active}
            position={[(col - 1.5) * 0.9, 0, (row - 1) * 0.9]}
            onPick={() => onPick(index)}
          />
        );
      })}
      <ContactShadows position={[0, -0.62, 0]} opacity={0.55} scale={9} blur={2.4} far={3.5} color="#000000" />
      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={4.2}
        maxDistance={8.5}
        maxPolarAngle={1.25}
        minPolarAngle={0.55}
      />
    </>
  );
}

function TypeCaseFlat({ active, onPick }: { active: number; onPick: (index: number) => void }) {
  return (
    <div className="grid h-full place-items-center bg-night p-8">
      <div className="grid grid-cols-4 gap-3">
        {GLYPHS.map((char, index) => (
          <button
            key={`${char}-${index}`}
            type="button"
            onClick={() => onPick(index)}
            className={`grid h-[4.4rem] w-[4.4rem] place-items-center font-serif text-3xl shadow-[inset_0_0_0_1px_#16120e] ${
              index === active ? "-translate-y-3 bg-gold text-night" : "bg-paper-2 text-ink"
            }`}
          >
            {char}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TypeCaseSetpiece({ progress = 0 }: { progress?: number }) {
  const gpu = useGpu();
  const reduced = useReducedMotion();
  const [active, setActive] = useState(4);
  const fromScroll = Math.min(11, Math.max(0, Math.round(progress * 11)));

  useEffect(() => {
    if (progress > 0.08) setActive(fromScroll);
  }, [fromScroll, progress]);

  return (
    <div className="h-full min-h-[420px] bg-night">
      <div className="h-[calc(100%-3rem)] min-h-[380px]">
        {!gpu || reduced ? (
          <TypeCaseFlat active={active} onPick={setActive} />
        ) : (
          <Canvas shadows camera={{ position: [3.6, 3.4, 5.4], fov: 34 }} dpr={[1, 1.7]}>
            <TypeCaseScene active={active} onPick={setActive} />
          </Canvas>
        )}
      </div>
      <p className="px-5 py-3 text-sm text-paper/80">
        被捡起的是「{GLYPHS[active]}」。排字工不理解月亮，他只是手快。
      </p>
    </div>
  );
}
