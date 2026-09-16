"use client";

import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { CanvasTexture, DoubleSide, SRGBColorSpace } from "three";
import { useGpu, useReducedMotion } from "@/lib/motion-pref";

function paperTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#efe6d6";
  ctx.fillRect(0, 0, 1024, 512);
  ctx.strokeStyle = "rgba(22,18,14,0.08)";
  for (let i = 0; i < 12; i += 1) {
    ctx.beginPath();
    ctx.moveTo(48, 70 + i * 34);
    ctx.lineTo(976, 70 + i * 34);
    ctx.stroke();
  }
  ctx.fillStyle = "#16120e";
  ctx.font = "58px 'Noto Serif SC', serif";
  ctx.fillText("猫坐在垫子上。", 72, 210);
  ctx.fillText("它很暖和。", 72, 300);
  ctx.font = "22px 'Noto Sans SC', sans-serif";
  ctx.fillStyle = "#6a6156";
  ctx.fillText("灯罩一转，下一步依赖的位置就换了。", 72, 390);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function LampRig({ yaw }: { yaw: number }) {
  const texture = useMemo(() => paperTexture(), []);
  useEffect(() => () => texture?.dispose(), [texture]);

  return (
    <>
      <color attach="background" args={["#100e0c"]} />
      <fog attach="fog" args={["#100e0c", 7, 14]} />
      <ambientLight intensity={0.07} />
      <mesh position={[0, -1.22, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.4, 48]} />
        <meshStandardMaterial color="#1a1612" roughness={0.95} />
      </mesh>
      <mesh position={[0, -1.18, 0.35]} rotation={[-Math.PI / 2.12, 0, 0]} receiveShadow>
        <planeGeometry args={[4.8, 2.5]} />
        <meshStandardMaterial map={texture ?? undefined} color="#efe6d6" roughness={0.92} />
      </mesh>
      <group position={[0, -1.05, -0.9]}>
        <mesh>
          <cylinderGeometry args={[0.42, 0.5, 0.12, 24]} />
          <meshStandardMaterial color="#b57a28" metalness={0.82} roughness={0.28} />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.045, 0.055, 1.7, 16]} />
          <meshStandardMaterial color="#8a5a1e" metalness={0.75} roughness={0.32} />
        </mesh>
      </group>
      <group position={[0, 1.15, -0.7]} rotation={[0.45, yaw, 0]}>
        <mesh position={[0, 0.05, 0.55]} rotation={[1.15, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.15, 12]} />
          <meshStandardMaterial color="#b57a28" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.35, 1.05]} rotation={[0.9, 0, 0]}>
          <coneGeometry args={[0.48, 0.62, 24, 1, true]} />
          <meshStandardMaterial color="#7c5418" metalness={0.55} roughness={0.4} side={DoubleSide} />
        </mesh>
        <mesh position={[0, -0.55, 1.25]} rotation={[0.9, 0, 0]}>
          <coneGeometry args={[0.95, 1.8, 24, 1, true]} />
          <meshBasicMaterial color="#f6e2b0" transparent opacity={0.07} side={DoubleSide} depthWrite={false} />
        </mesh>
        <spotLight
          position={[0, -0.42, 1.1]}
          angle={0.38}
          penumbra={0.65}
          intensity={28}
          color="#ffe7b0"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
      </group>
      <ContactShadows position={[0, -1.21, 0]} opacity={0.65} scale={8} blur={2.8} far={4} color="#000" />
      <OrbitControls enablePan={false} enableDamping minDistance={4} maxDistance={8} maxPolarAngle={1.32} />
    </>
  );
}

export function LampSetpiece({ progress = 0.35 }: { progress?: number }) {
  const gpu = useGpu();
  const reduced = useReducedMotion();
  const yaw = -0.72 + progress * 1.44;

  return (
    <div className="h-full min-h-[420px] bg-night">
      <div className="h-[calc(100%-3.5rem)] min-h-[380px]">
        {!gpu || reduced ? (
          <div className="relative grid h-full place-items-center bg-night px-8">
            <p className="max-w-lg font-serif text-3xl leading-relaxed">
              <span className={yaw < 0 ? "bg-gold px-1 text-night" : "text-paper/35"}>猫坐在垫子上。</span>
              <span className={yaw >= 0 ? "bg-gold px-1 text-night" : "text-paper/35"}>它很暖和。</span>
            </p>
          </div>
        ) : (
          <Canvas shadows camera={{ position: [3.1, 1.8, 5.2], fov: 34 }} dpr={[1, 1.7]}>
            <LampRig yaw={yaw} />
          </Canvas>
        )}
      </div>
      <p className="px-5 py-3 text-sm text-paper/75">
        {yaw < 0 ? "灯还在「猫」。代词还没被点亮。" : "灯转到「它」。份额换了，意思没有自动长出来。"}
      </p>
    </div>
  );
}
