"use client";

import { ContactShadows } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { CanvasTexture, DoubleSide, SRGBColorSpace } from "three";
import { LiveCanvas } from "@/components/setpiece/LiveCanvas";
import { useGpu, useReducedMotion } from "@/lib/motion-pref";

const CAT = -0.48;
const IT = 0.48;
const YAW_MIN = -0.85;
const YAW_MAX = 0.85;

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

function clampYaw(value: number) {
  return Math.min(YAW_MAX, Math.max(YAW_MIN, value));
}

function poleFor(yaw: number) {
  return yaw <= 0 ? CAT : IT;
}

export function LampSetpiece({ progress = 0.35 }: { progress?: number }) {
  const gpu = useGpu();
  const reduced = useReducedMotion();
  const dragging = useRef(false);
  const pending = useRef(false);
  const owned = useRef(false);
  const lastX = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0 });
  const lastT = useRef(0);
  const velocity = useRef(0);
  const offset = useRef(0);
  const settle = useRef(0);
  const progressRef = useRef(progress);
  const reducedRef = useRef(reduced);
  const [held, setHeld] = useState(false);
  const [yaw, setYaw] = useState(() => clampYaw(-0.55 + progress * 1.1));

  progressRef.current = progress;
  reducedRef.current = reduced;

  function baseYaw() {
    return owned.current ? 0 : -0.55 + progressRef.current * 1.1;
  }

  function publish(next: number) {
    const clamped = clampYaw(next);
    setYaw((prev) => (Math.abs(prev - clamped) > 0.003 ? clamped : prev));
    return clamped;
  }

  function stopSettle() {
    if (settle.current) cancelAnimationFrame(settle.current);
    settle.current = 0;
  }

  function startSettle() {
    stopSettle();
    if (reducedRef.current) {
      const pole = poleFor(baseYaw() + offset.current);
      offset.current = pole - baseYaw();
      publish(pole);
      return;
    }
    let frames = 0;
    let last = performance.now();
    function tick(now: number) {
      frames += 1;
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const base = baseYaw();
      const pole = poleFor(base + offset.current);
      const desired = pole - base;
      const omega = 16;
      const acc = omega * omega * (desired - offset.current) - 2 * omega * velocity.current;
      velocity.current += acc * dt;
      offset.current += velocity.current * dt;
      const total = clampYaw(base + offset.current);
      offset.current = total - base;
      publish(total);
      const close = Math.abs(velocity.current) < 0.0009 && Math.abs(desired - offset.current) < 0.004;
      if (close || frames > 42) {
        offset.current = desired;
        velocity.current = 0;
        publish(clampYaw(base + desired));
        settle.current = 0;
        return;
      }
      settle.current = requestAnimationFrame(tick);
    }
    settle.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    if (owned.current || dragging.current || settle.current) return;
    publish(baseYaw() + offset.current);
  }, [progress]);

  useEffect(() => () => stopSettle(), []);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    pending.current = true;
    dragging.current = false;
    origin.current = { x: event.clientX, y: event.clientY };
    lastX.current = event.clientX;
    lastT.current = performance.now();
    velocity.current = 0;
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pending.current && !dragging.current) return;
    const dx = event.clientX - origin.current.x;
    const dy = event.clientY - origin.current.y;
    if (!dragging.current) {
      const distance = Math.hypot(dx, dy);
      const need = event.pointerType === "touch" ? 10 : 3;
      if (distance < need) return;
      if (event.pointerType === "touch" && Math.abs(dy) > Math.abs(dx) * 1.15) {
        pending.current = false;
        return;
      }
      dragging.current = true;
      if (!owned.current) {
        const current = clampYaw(baseYaw() + offset.current);
        owned.current = true;
        offset.current = current;
      }
      stopSettle();
      event.currentTarget.setPointerCapture(event.pointerId);
      setHeld(true);
    }
    if (lastX.current == null) return;
    const now = performance.now();
    const step = Math.max(8, now - lastT.current);
    const delta = (event.clientX - lastX.current) / 240;
    lastX.current = event.clientX;
    lastT.current = now;
    const total = clampYaw(baseYaw() + offset.current + delta);
    offset.current = total - baseYaw();
    velocity.current = delta / (step / 16.67);
    publish(total);
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const wasDragging = dragging.current;
    pending.current = false;
    dragging.current = false;
    lastX.current = null;
    setHeld(false);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
    if (wasDragging) startSettle();
  }

  return (
    <div className="flex h-full min-h-[420px] flex-col bg-void">
      <div
        className={`min-h-[380px] flex-1 select-none ${held ? "cursor-grabbing" : "cursor-ew-resize"}`}
        style={{ touchAction: held ? "none" : "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
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
