"use client";

import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Mesh, Texture } from "three";
import { CanvasTexture, SRGBColorSpace } from "three";
import { useGpu, useReducedMotion } from "@/lib/motion-pref";

const GLYPHS = ["今", "晚", "月", "色", "很", "好", "不", "错", "像", "霜", "的", "风"];

function lacquerTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#141412";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 40; i += 1) {
    ctx.strokeStyle = `rgba(214,255,58,${0.015 + (i % 7) * 0.008})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, i * 13);
    ctx.bezierCurveTo(160, i * 13 + 6, 340, i * 13 - 4, 512, i * 13 + 2);
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
  ctx.fillStyle = lifted ? "#d6ff3a" : "#1a1a16";
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = lifted ? "#090908" : "#d6ff3a";
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, 236, 236);
  ctx.fillStyle = lifted ? "#090908" : "#eeece4";
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
      <meshStandardMaterial attach="material-0" color="#2a2a24" roughness={0.38} metalness={0.18} />
      <meshStandardMaterial attach="material-1" color="#2a2a24" roughness={0.38} metalness={0.18} />
      <meshStandardMaterial attach="material-2" map={texture as Texture} roughness={0.32} />
      <meshStandardMaterial attach="material-3" color="#0c0c0a" roughness={0.9} />
      <meshStandardMaterial attach="material-4" color="#2a2a24" roughness={0.38} metalness={0.18} />
      <meshStandardMaterial attach="material-5" color="#2a2a24" roughness={0.38} metalness={0.18} />
    </mesh>
  );
}

function TypeCaseScene({ active, onPick }: { active: number; onPick: (index: number) => void }) {
  const tray = useMemo(() => lacquerTexture(), []);
  useEffect(() => () => tray?.dispose(), [tray]);

  return (
    <>
      <color attach="background" args={["#090908"]} />
      <fog attach="fog" args={["#090908", 8, 16]} />
      <hemisphereLight args={["#d6ff3a", "#090908", 0.28]} />
      <spotLight
        position={[3.2, 6.4, 2.4]}
        angle={0.42}
        penumbra={0.7}
        intensity={4.2}
        color="#f2ffe0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-2.4, 2.2, -1.4]} intensity={1.4} color="#d6ff3a" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, 0]} receiveShadow>
        <boxGeometry args={[5.2, 4.1, 0.22]} />
        <meshStandardMaterial map={tray ?? undefined} color="#141412" roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh position={[0, -0.32, -2.05]}>
        <boxGeometry args={[5.2, 0.4, 0.16]} />
        <meshStandardMaterial color="#d6ff3a" roughness={0.35} metalness={0.1} />
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
      <ContactShadows position={[0, -0.62, 0]} opacity={0.7} scale={9} blur={2.4} far={3.5} color="#000000" />
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
    <div className="grid h-full place-items-center bg-void p-8">
      <div className="grid grid-cols-4 gap-3">
        {GLYPHS.map((char, index) => (
          <button
            key={`${char}-${index}`}
            type="button"
            onClick={() => onPick(index)}
            className={`grid h-[4.4rem] w-[4.4rem] place-items-center border font-serif text-3xl ${
              index === active ? "-translate-y-3 border-acid bg-acid text-void" : "border-acid/30 bg-wall text-bone"
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
    <div className="flex h-full min-h-[420px] flex-col bg-void">
      <div className="min-h-[380px] flex-1">
        {!gpu || reduced ? (
          <TypeCaseFlat active={active} onPick={setActive} />
        ) : (
          <Canvas shadows camera={{ position: [3.6, 3.4, 5.4], fov: 34 }} dpr={[1, 1.7]}>
            <TypeCaseScene active={active} onPick={setActive} />
          </Canvas>
        )}
      </div>
      <p className="px-5 py-3 text-sm text-fog">
        被点亮的是「{GLYPHS[active]}」。馆员不理解月亮，他只是伸手。
      </p>
    </div>
  );
}
