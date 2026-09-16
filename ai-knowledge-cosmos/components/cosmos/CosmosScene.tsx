"use client";

import { Html, Line, OrbitControls, Sparkles, Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, type MutableRefObject } from "react";
import {
  AdditiveBlending,
  Color,
  Group,
  Mesh,
  Vector3,
} from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { COSMOS_EDGES, COSMOS_NODES, colorHex, type CosmosNode } from "@/lib/cosmos";

type SceneProps = {
  focused: string | null;
  reduced: boolean;
  distance: number;
  onFocus: (id: string | null) => void;
  controlsRef: MutableRefObject<OrbitControlsImpl | null>;
};

function nodeScale(node: CosmosNode) {
  if (node.kind === "core") return 1;
  if (node.kind === "lesson") return 0.78;
  return 0.42;
}

function NodeMesh({
  node,
  active,
  dimmed,
  dimCoreLabel,
  onFocus,
  reduced,
}: {
  node: CosmosNode;
  active: boolean;
  dimmed: boolean;
  dimCoreLabel: boolean;
  onFocus: (id: string) => void;
  reduced: boolean;
}) {
  const group = useRef<Group>(null);
  const glow = useRef<Mesh>(null);
  const halo = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const hex = colorHex[node.color];
  const color = useMemo(() => new Color(hex), [hex]);
  const showLabel = hovered || active || (node.kind === "core" && !dimCoreLabel);
  const base = nodeScale(node);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    if (!reduced) {
      group.current.rotation.y = t * (node.kind === "core" ? 0.1 : 0.16);
      group.current.position.y = node.position[1] + Math.sin(t * 0.65 + node.position[0]) * 0.07;
    }
    const target = active ? 1.22 : hovered ? 1.08 : 1;
    const current = group.current.scale.x;
    const next = current + (target - current) * 0.08;
    group.current.scale.setScalar(next);
    if (glow.current) {
      glow.current.scale.setScalar(1.2 + (active ? 0.28 : 0) + (reduced ? 0 : Math.sin(t * 1.8) * 0.04));
    }
    if (halo.current) {
      halo.current.rotation.z = t * 0.25;
    }
  });

  const geo = node.geometry;
  const args = base;

  return (
    <group ref={group} position={node.position}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onFocus(node.id);
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
          setHovered(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
          setHovered(false);
        }}
      >
        {geo === "icosa" ? <icosahedronGeometry args={[args, 0]} /> : null}
        {geo === "octa" ? <octahedronGeometry args={[args, 0]} /> : null}
        {geo === "tetra" ? <tetrahedronGeometry args={[args, 0]} /> : null}
        {geo === "dodeca" ? <dodecahedronGeometry args={[args, 0]} /> : null}
        {geo === "box" ? <boxGeometry args={[args * 1.05, args * 1.05, args * 1.05]} /> : null}
        {geo === "torus" ? <torusGeometry args={[args * 0.7, args * 0.28, 16, 48]} /> : null}
        {geo === "sphere" ? <sphereGeometry args={[args * 0.92, 28, 28]} /> : null}
        {geo === "core" ? <icosahedronGeometry args={[1.08, 1]} /> : null}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 1.55 : dimmed ? 0.12 : 0.62}
          metalness={0.42}
          roughness={active ? 0.18 : 0.28}
          transparent
          opacity={dimmed ? 0.38 : 0.98}
        />
      </mesh>
      <mesh ref={glow} scale={1.4}>
        <sphereGeometry args={[args * 1.2, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={active ? 0.22 : dimmed ? 0.03 : 0.09}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {active || node.kind === "core" ? (
        <mesh ref={halo} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[args * 1.55, 0.015, 8, 48]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={active ? 0.65 : 0.22}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {node.kind === "core" ? (
        <mesh>
          <icosahedronGeometry args={[1.2, 1]} />
          <meshBasicMaterial color="#f3eee4" wireframe transparent opacity={0.32} />
        </mesh>
      ) : null}
      {showLabel ? (
        <Html center sprite occlude={false} zIndexRange={[2, 0]} distanceFactor={18}>
          <button
            type="button"
            onClick={() => onFocus(node.id)}
            className={`pointer-events-auto rounded-full border px-2 py-0.5 text-[10px] whitespace-nowrap backdrop-blur-md ${
              active
                ? "border-ivory/40 bg-void/85 text-ivory"
                : "border-ivory/15 bg-void/70 text-mist"
            }`}
          >
            {node.kind === "lesson" ? `${node.stage} ${node.short}` : node.title}
          </button>
        </Html>
      ) : null}
    </group>
  );
}

function CameraRig({
  focused,
  distance,
}: {
  focused: string | null;
  distance: number;
}) {
  const lastDistance = useRef(distance);
  const look = useRef(new Vector3(0, 0, 0));

  useFrame((state, delta) => {
    const { camera } = state;
    const k = 1 - Math.exp(-delta * (focused ? 3.2 : 2.1));
    const node = COSMOS_NODES.find((item) => item.id === focused);
    if (node && node.kind !== "core") {
      const origin = new Vector3(...node.position);
      const offset = origin.clone().normalize().multiplyScalar(3.15);
      if (offset.length() < 0.2) offset.set(0, 0.7, 3.15);
      offset.y += 0.35;
      camera.position.lerp(origin.clone().add(offset), k);
      look.current.lerp(origin, k);
      camera.lookAt(look.current);
      return;
    }
    if (lastDistance.current !== distance) {
      const next = camera.position.clone().normalize().multiplyScalar(distance);
      if (next.length() < 0.4) next.set(0, 1.15, distance);
      camera.position.lerp(next, k);
      look.current.lerp(new Vector3(0, 0, 0), k);
      camera.lookAt(look.current);
      if (camera.position.distanceTo(next) < 0.08) lastDistance.current = distance;
    }
  });

  return null;
}

function Dust({ reduced }: { reduced: boolean }) {
  const count = reduced ? 0 : 360;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const seedA = Math.sin(i * 127.1 + 311.7) * 43758.5453;
      const seedB = Math.sin(i * 269.5 + 183.3) * 43758.5453;
      const seedC = Math.sin(i * 419.2 + 71.9) * 43758.5453;
      const randA = seedA - Math.floor(seedA);
      const randB = seedB - Math.floor(seedB);
      const randC = seedC - Math.floor(seedC);
      const radius = 2.4 + randA * 13;
      const theta = randB * Math.PI * 2;
      const phi = Math.acos(2 * randC - 1);
      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.52;
      arr[i * 3 + 2] = radius * Math.cos(phi);
    }
    return arr;
  }, [count]);
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.018;
  });
  if (!count) return null;
  return (
    <group ref={ref}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.038}
          color="#d9c9a3"
          transparent
          opacity={0.42}
          sizeAttenuation
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </group>
  );
}

export function CosmosScene({
  focused,
  reduced,
  distance,
  onFocus,
  controlsRef,
}: SceneProps) {
  const world = useRef<Group>(null);
  const points = useMemo(() => {
    const map = new Map(COSMOS_NODES.map((node) => [node.id, node.position] as const));
    return COSMOS_EDGES.map(([a, b]) => {
      const from = map.get(a);
      const to = map.get(b);
      if (!from || !to) return null;
      const lit = Boolean(focused) && (a === focused || b === focused);
      return { from, to, lit, key: `${a}-${b}` };
    }).filter((item): item is { from: [number, number, number]; to: [number, number, number]; lit: boolean; key: string } => Boolean(item));
  }, [focused]);

  useFrame((state) => {
    if (!world.current || reduced) return;
    const t = state.clock.elapsedTime;
    world.current.position.y = Math.sin(t * 0.15) * 0.12;
    world.current.rotation.z = Math.sin(t * 0.08) * 0.03;
  });

  return (
    <>
      <color attach="background" args={["#05060c"]} />
      <ambientLight intensity={0.28} />
      <pointLight position={[6, 8, 4]} intensity={22} color="#9b8cff" distance={30} />
      <pointLight position={[-8, -2, -6]} intensity={16} color="#3ee0c6" distance={28} />
      <pointLight position={[0, 5, -8]} intensity={12} color="#ff6b8a" distance={24} />
      <pointLight position={[0, 2, 6]} intensity={8} color="#f3eee4" distance={18} />
      <Stars
        radius={70}
        depth={36}
        count={reduced ? 280 : 2200}
        factor={3.6}
        saturation={0.15}
        fade
        speed={reduced ? 0 : 0.28}
      />
      {!reduced ? (
        <>
          <Sparkles count={70} scale={[16, 8, 16]} size={3} speed={0.28} opacity={0.45} color="#f3eee4" />
          <Sparkles count={40} scale={7} size={5} speed={0.12} opacity={0.28} color="#9b8cff" />
        </>
      ) : null}
      <Dust reduced={reduced} />
      <mesh position={[-9, 3.2, -11]}>
        <sphereGeometry args={[6.2, 24, 24]} />
        <meshBasicMaterial color="#9b8cff" transparent opacity={0.055} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[10, -4.2, -9]}>
        <sphereGeometry args={[7.2, 24, 24]} />
        <meshBasicMaterial color="#3ee0c6" transparent opacity={0.048} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <group ref={world}>
        {points.map((item) => (
          <Line
            key={item.key}
            points={[item.from, item.to]}
            color={item.lit ? "#f3eee4" : "#8a8578"}
            lineWidth={item.lit ? 2 : 1}
            transparent
            opacity={item.lit ? 0.72 : 0.18}
          />
        ))}
        {COSMOS_NODES.map((node) => (
          <NodeMesh
            key={node.id}
            node={node}
            active={focused === node.id}
            dimmed={Boolean(focused) && focused !== node.id}
            dimCoreLabel={Boolean(focused)}
            onFocus={onFocus}
            reduced={reduced}
          />
        ))}
      </group>
      <CameraRig focused={focused} distance={distance} />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableDamping={!reduced}
        dampingFactor={0.085}
        minDistance={4}
        maxDistance={18}
        autoRotate={!reduced && !focused}
        autoRotateSpeed={0.22}
        enabled={!focused}
      />
    </>
  );
}
