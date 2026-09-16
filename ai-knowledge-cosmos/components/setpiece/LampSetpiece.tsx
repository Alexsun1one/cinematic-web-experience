"use client";

import { ContactShadows } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { CanvasTexture, DoubleSide, SRGBColorSpace } from "three";
import { LiveCanvas } from "@/components/setpiece/LiveCanvas";
import { useGpu, useReducedMotion } from "@/lib/motion-pref";

function wallTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#2a2a22";
  ctx.fillRect(0, 0, 1024, 512);
  ctx.strokeStyle = "rgba(214,255,58,0.16)";
  for (let i = 0; i < 12; i += 1) {
    ctx.beginPath();
    ctx.moveTo(48, 70 + i * 34);
    ctx.lineTo(976, 70 + i * 34);
    ctx.stroke();
  }
  ctx.fillStyle = "#eeece4";
  ctx.font = "58px 'Noto Serif SC', serif";
  ctx.fillText("猫坐在垫子上。", 72, 210);
  ctx.fillText("它很暖和。", 72, 300);
  ctx.font = "22px 'Noto Sans SC', sans-serif";
  ctx.fillStyle = "#9c9a90";
  ctx.fillText("灯罩一转，下一步依赖的位置就换了。", 72, 390);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function LampRig({ yaw }: { yaw: number }) {
  const texture = useMemo(() => wallTexture(), []);
  useEffect(() => () => texture?.dispose(), [texture]);

  return (
    <>
      <color attach="background" args={["#090908"]} />
      <fog attach="fog" args={["#090908", 12, 20]} />
      <hemisphereLight args={["#d6ff3a", "#090908", 0.24]} />
      <ambientLight intensity={0.22} />
      <pointLight position={[2.4, 1.6, 3.2]} intensity={2.1} color="#f6ffc8" />
      <mesh position={[0, -1.22, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.4, 48]} />
        <meshStandardMaterial color="#10100e" roughness={0.95} />
      </mesh>
      <mesh position={[0, -1.18, 0.35]} rotation={[-Math.PI / 2.12, 0, 0]} receiveShadow>
        <planeGeometry args={[4.8, 2.5]} />
        <meshStandardMaterial map={texture ?? undefined} color="#2a2a22" roughness={0.92} />
      </mesh>
      <group position={[0, -1.05, -0.9]}>
        <mesh>
          <cylinderGeometry args={[0.42, 0.5, 0.12, 24]} />
          <meshStandardMaterial color="#3a3a32" metalness={0.78} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.045, 0.055, 1.7, 16]} />
          <meshStandardMaterial color="#4a4a40" metalness={0.74} roughness={0.26} />
        </mesh>
      </group>
      <group position={[0, 1.15, -0.7]} rotation={[0.45, yaw, 0]}>
        <mesh position={[0, 0.05, 0.55]} rotation={[1.15, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.15, 12]} />
          <meshStandardMaterial color="#d6ff3a" metalness={0.45} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.35, 1.05]} rotation={[0.9, 0, 0]}>
          <coneGeometry args={[0.48, 0.62, 24, 1, true]} />
          <meshStandardMaterial color="#1c1c16" metalness={0.6} roughness={0.32} side={DoubleSide} />
        </mesh>
        <mesh position={[0, -0.55, 1.25]} rotation={[0.9, 0, 0]}>
          <coneGeometry args={[1.05, 2.05, 28, 1, true]} />
          <meshBasicMaterial color="#d6ff3a" transparent opacity={0.22} side={DoubleSide} depthWrite={false} />
        </mesh>
        <spotLight
          position={[0, -0.42, 1.1]}
          angle={0.36}
          penumbra={0.58}
          intensity={48}
          color="#eaff8a"
          castShadow
          shadow-mapSize={[768, 768]}
        />
      </group>
      <ContactShadows position={[0, -1.21, 0]} opacity={0.7} scale={8} blur={2.6} far={4} color="#000" />
    </>
  );
}

export function LampSetpiece({ progress = 0.35 }: { progress?: number }) {
  const gpu = useGpu();
  const reduced = useReducedMotion();
  const drag = useRef(0);
  const lastX = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);
  const yaw = Math.min(0.85, Math.max(-0.85, -0.55 + progress * 1.1 + offset));

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    lastX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (lastX.current == null) return;
    const delta = (event.clientX - lastX.current) / 240;
    lastX.current = event.clientX;
    drag.current = Math.min(0.7, Math.max(-0.7, drag.current + delta));
    setOffset(drag.current);
  }
  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    lastX.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div className="flex h-full min-h-[420px] flex-col bg-void">
      <div
        className="min-h-[380px] flex-1 touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {!gpu || reduced ? (
          <div className="relative grid h-full place-items-center bg-void px-8">
            <p className="max-w-lg font-serif text-3xl leading-relaxed">
              <span className={yaw < 0 ? "bg-acid px-1 text-void" : "text-bone/30"}>猫坐在垫子上。</span>
              <span className={yaw >= 0 ? "bg-acid px-1 text-void" : "text-bone/30"}>它很暖和。</span>
            </p>
          </div>
        ) : (
          <LiveCanvas camera={{ position: [3.1, 1.8, 5.2], fov: 34 }}>
            <LampRig yaw={yaw} />
          </LiveCanvas>
        )}
      </div>
      <p className="px-5 py-3 text-sm text-fog">
        {yaw < 0 ? "横拖灯罩。灯还在「猫」。代词还没被点亮。" : "灯转到「它」。份额换了，意思没有自动长出来。"}
      </p>
    </div>
  );
}
