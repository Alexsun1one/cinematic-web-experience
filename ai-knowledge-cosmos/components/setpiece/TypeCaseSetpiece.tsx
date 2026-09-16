"use client";

import { ContactShadows, OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Mesh, Texture } from "three";
import { CanvasTexture, SRGBColorSpace } from "three";
import { LiveCanvas } from "@/components/setpiece/LiveCanvas";
import { useGpu, useReducedMotion } from "@/lib/motion-pref";

const GLYPHS = ["今", "晚", "月", "色", "很", "好", "不", "错", "像", "霜", "的", "风"];

function lacquerTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#121210";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 56; i += 1) {
    ctx.strokeStyle = `rgba(214,255,58,${0.02 + (i % 7) * 0.01})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, i * 10);
    ctx.bezierCurveTo(160, i * 10 + 6, 340, i * 10 - 4, 512, i * 10 + 2);
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
  ctx.fillStyle = lifted ? "#d6ff3a" : "#1c1c18";
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = lifted ? "#090908" : "#d6ff3a";
  ctx.lineWidth = 5;
  ctx.strokeRect(12, 12, 232, 232);
  ctx.fillStyle = lifted ? "#090908" : "#eeece4";
  ctx.font = "128px 'Noto Serif SC', serif";
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
  hovered,
  onPick,
  onHover,
}: {
  char: string;
  position: [number, number, number];
  lifted: boolean;
  hovered: boolean;
  onPick: () => void;
  onHover: (on: boolean) => void;
}) {
  const mesh = useRef<Mesh>(null);
  const texture = useMemo(() => makeFace(char, lifted), [char, lifted]);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    const target = lifted ? 0.68 : hovered ? 0.24 : 0;
    mesh.current.position.y += (target - mesh.current.position.y) * Math.min(1, delta * 8);
    const rot = lifted ? -0.14 : hovered ? -0.05 : 0;
    mesh.current.rotation.z += (rot - mesh.current.rotation.z) * Math.min(1, delta * 7);
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
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
        onHover(true);
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
        onHover(false);
      }}
    >
      <boxGeometry args={[0.7, 0.7, 0.7]} />
      <meshStandardMaterial attach="material-0" color="#2e2e28" roughness={0.32} metalness={0.28} />
      <meshStandardMaterial attach="material-1" color="#2e2e28" roughness={0.32} metalness={0.28} />
      <meshStandardMaterial
        attach="material-2"
        map={texture as Texture}
        roughness={lifted ? 0.22 : 0.4}
        metalness={lifted ? 0.08 : 0.04}
        emissive={lifted ? "#d6ff3a" : "#000000"}
        emissiveIntensity={lifted ? 0.18 : 0}
      />
      <meshStandardMaterial attach="material-3" color="#0c0c0a" roughness={0.9} />
      <meshStandardMaterial attach="material-4" color="#2e2e28" roughness={0.32} metalness={0.28} />
      <meshStandardMaterial attach="material-5" color="#2e2e28" roughness={0.32} metalness={0.28} />
    </mesh>
  );
}

function TypeCaseScene({
  active,
  hover,
  onPick,
  onHover,
}: {
  active: number;
  hover: number | null;
  onPick: (index: number) => void;
  onHover: (index: number | null) => void;
}) {
  const tray = useMemo(() => lacquerTexture(), []);
  useEffect(() => () => tray?.dispose(), [tray]);

  return (
    <>
      <color attach="background" args={["#090908"]} />
      <fog attach="fog" args={["#090908", 9, 17]} />
      <hemisphereLight args={["#d6ff3a", "#090908", 0.32]} />
      <spotLight
        position={[3.2, 6.4, 2.4]}
        angle={0.4}
        penumbra={0.72}
        intensity={4.8}
        color="#f2ffe0"
        castShadow
        shadow-mapSize={[768, 768]}
      />
      <pointLight position={[-2.4, 2.2, -1.4]} intensity={1.6} color="#d6ff3a" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, 0]} receiveShadow>
        <boxGeometry args={[5.2, 4.1, 0.22]} />
        <meshStandardMaterial map={tray ?? undefined} color="#141412" roughness={0.48} metalness={0.28} />
      </mesh>
      <mesh position={[0, -0.32, -2.05]}>
        <boxGeometry args={[5.2, 0.4, 0.16]} />
        <meshStandardMaterial color="#d6ff3a" roughness={0.3} metalness={0.12} />
      </mesh>
      {GLYPHS.map((char, index) => {
        const col = index % 4;
        const row = Math.floor(index / 4);
        return (
          <Block
            key={`${char}-${index}`}
            char={char}
            lifted={index === active}
            hovered={index === hover}
            position={[(col - 1.5) * 0.9, 0, (row - 1) * 0.9]}
            onPick={() => onPick(index)}
            onHover={(on) => onHover(on ? index : null)}
          />
        );
      })}
      <ContactShadows position={[0, -0.62, 0]} opacity={0.72} scale={9} blur={2.2} far={3.5} color="#000000" />
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
  const [hover, setHover] = useState<number | null>(null);
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
          <LiveCanvas camera={{ position: [3.6, 3.4, 5.4], fov: 34 }}>
            <TypeCaseScene active={active} hover={hover} onPick={setActive} onHover={setHover} />
          </LiveCanvas>
        )}
      </div>
      <p className="px-5 py-3 text-sm text-fog">
        点一颗，或拖着看。被捡起的是「{GLYPHS[active]}」。馆员不读月亮。
      </p>
    </div>
  );
}
