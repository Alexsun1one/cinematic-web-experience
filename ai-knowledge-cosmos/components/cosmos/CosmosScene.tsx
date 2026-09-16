"use client";

import { Html, Line, OrbitControls, Stars } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState, type MutableRefObject } from "react";
import { Color, Group, Mesh, Vector3 } from "three";
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
  dimCoreLabel,
  onFocus,
  reduced,
}: {
  node: CosmosNode;
  active: boolean;
  dimCoreLabel: boolean;
  onFocus: (id: string) => void;
  reduced: boolean;
}) {
  const group = useRef<Group>(null);
  const glow = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const hex = colorHex[node.color];
  const color = useMemo(() => new Color(hex), [hex]);
  const showLabel = hovered || active || (node.kind === "core" && !dimCoreLabel);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    if (!reduced) {
      group.current.rotation.y = t * (node.kind === "core" ? 0.12 : 0.18);
      group.current.position.y = node.position[1] + Math.sin(t * 0.7 + node.position[0]) * 0.08;
    }
    if (glow.current) {
      const pulse = active ? 1.25 : 1;
      glow.current.scale.setScalar(pulse + (reduced ? 0 : Math.sin(t * 2) * 0.05));
    }
  });

  const geo = node.geometry;
  const args = nodeScale(node);

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
        {geo === "core" ? <icosahedronGeometry args={[1.08, 1]} /> : null}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 1.1 : 0.45}
          metalness={0.18}
          roughness={0.32}
          transparent
          opacity={0.96}
        />
      </mesh>
      <mesh ref={glow} scale={1.35}>
        {geo === "torus" ? (
          <sphereGeometry args={[args * 1.05, 16, 16]} />
        ) : (
          <sphereGeometry args={[args * 1.15, 16, 16]} />
        )}
        <meshBasicMaterial color={color} transparent opacity={active ? 0.16 : 0.07} />
      </mesh>
      {node.kind === "core" ? (
        <mesh>
          <icosahedronGeometry args={[1.18, 1]} />
          <meshBasicMaterial color="#f3eee4" wireframe transparent opacity={0.28} />
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
            {node.kind === "lesson" ? `${node.stage} ${node.title}` : node.title}
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
  const { camera } = useThree();
  const lastDistance = useRef(distance);

  useFrame((_, delta) => {
    const k = 1 - Math.exp(-delta * 2.6);
    const node = COSMOS_NODES.find((item) => item.id === focused);
    if (node && node.kind !== "core") {
      const origin = new Vector3(...node.position);
      const offset = origin.clone().normalize().multiplyScalar(3.4);
      if (offset.length() < 0.2) offset.set(0, 0.6, 3.4);
      camera.position.lerp(origin.clone().add(offset), k);
      camera.lookAt(origin);
      return;
    }
    if (lastDistance.current !== distance) {
      const next = camera.position.clone().normalize().multiplyScalar(distance);
      if (next.length() < 0.4) next.set(0, 1.15, distance);
      camera.position.lerp(next, k);
      if (camera.position.distanceTo(next) < 0.08) lastDistance.current = distance;
    }
  });

  return null;
}

export function CosmosScene({
  focused,
  reduced,
  distance,
  onFocus,
  controlsRef,
}: SceneProps) {
  const points = useMemo(() => {
    const map = new Map(COSMOS_NODES.map((node) => [node.id, node.position] as const));
    return COSMOS_EDGES.map(([a, b]) => {
      const from = map.get(a);
      const to = map.get(b);
      if (!from || !to) return null;
      return [from, to] as const;
    }).filter((item): item is readonly [[number, number, number], [number, number, number]] => Boolean(item));
  }, []);

  return (
    <>
      <color attach="background" args={["#05060c"]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[6, 8, 4]} intensity={18} color="#9b8cff" distance={28} />
      <pointLight position={[-8, -2, -6]} intensity={14} color="#3ee0c6" distance={26} />
      <pointLight position={[0, 4, -8]} intensity={10} color="#ff6b8a" distance={22} />
      <Stars
        radius={60}
        depth={30}
        count={reduced ? 400 : 1800}
        factor={3.2}
        saturation={0}
        fade
        speed={reduced ? 0 : 0.4}
      />
      <mesh position={[-8, 3, -10]}>
        <sphereGeometry args={[5.5, 24, 24]} />
        <meshBasicMaterial color="#9b8cff" transparent opacity={0.045} />
      </mesh>
      <mesh position={[9, -4, -8]}>
        <sphereGeometry args={[6.5, 24, 24]} />
        <meshBasicMaterial color="#3ee0c6" transparent opacity={0.04} />
      </mesh>
      {points.map(([from, to], index) => (
        <Line
          key={index}
          points={[from, to]}
          color="#c9c3b6"
          lineWidth={1}
          transparent
          opacity={0.22}
        />
      ))}
      {COSMOS_NODES.map((node) => (
        <NodeMesh
          key={node.id}
          node={node}
          active={focused === node.id}
          dimCoreLabel={Boolean(focused)}
          onFocus={onFocus}
          reduced={reduced}
        />
      ))}
      <CameraRig focused={focused} distance={distance} />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableDamping={!reduced}
        dampingFactor={0.08}
        minDistance={4}
        maxDistance={18}
        autoRotate={!reduced && !focused}
        autoRotateSpeed={0.35}
        enabled={!focused}
      />
    </>
  );
}
