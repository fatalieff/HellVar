"use client";

import * as React from "react";
import { Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";

const PRIMARY = "#df5309";
const ACCENT = "#f3a949";

function CameraRig({ children }: { children: React.ReactNode }) {
  const pointer = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state) => {
    const { camera } = state;
    camera.position.x += (pointer.current.x * 0.55 - camera.position.x) * 0.045;
    camera.position.y += (pointer.current.y * 0.4 - camera.position.y) * 0.045;
    camera.lookAt(0, 0.1, 0);
  });

  return <>{children}</>;
}

function GlowBlob() {
  return (
    <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.9} floatingRange={[-0.5, 0.5]}>
      <mesh position={[0, 0.7, -3.2]} scale={3.4}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={0.4}
          distort={0.38}
          speed={1.6}
          roughness={0.25}
          metalness={0.05}
          transparent
          opacity={0.14}
        />
      </mesh>
    </Float>
  );
}

function HaloRing({
  position,
  tilt,
  radius,
  opacity,
  speed,
  reverse = false,
  thickness = 0.012,
}: {
  position: [number, number, number];
  tilt?: [number, number, number];
  radius: number;
  opacity: number;
  speed: number;
  reverse?: boolean;
  thickness?: number;
}) {
  const ref = React.useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const dir = reverse ? -1 : 1;
    ref.current.rotation.z += delta * speed * dir;
    ref.current.rotation.x += delta * speed * 0.4 * dir;
  });

  return (
    <mesh ref={ref} position={position} rotation={tilt}>
      <torusGeometry args={[radius, thickness, 16, 160]} />
      <meshBasicMaterial color={PRIMARY} transparent opacity={opacity} />
    </mesh>
  );
}

function Gem({
  position,
  color,
  scale = 0.6,
  opacity = 0.3,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  opacity?: number;
}) {
  return (
    <Float speed={2.2} rotationIntensity={1.4} floatIntensity={1.6} floatingRange={[-0.6, 0.6]}>
      <mesh position={position} scale={scale}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          wireframe
          transparent
          opacity={opacity}
        />
      </mesh>
    </Float>
  );
}

function Orb({ position, scale = 0.14 }: { position: [number, number, number]; scale?: number }) {
  return (
    <Float speed={3} rotationIntensity={0} floatIntensity={2} floatingRange={[-0.8, 0.8]}>
      <mesh position={position} scale={scale}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color={PRIMARY} transparent opacity={0.55} />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 9], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <CameraRig>
          <ambientLight intensity={0.7} />
          <directionalLight position={[6, 8, 5]} intensity={1.1} color="#fff4e6" />
          <GlowBlob />
          <HaloRing position={[0, 0.5, -1.4]} radius={3.1} opacity={0.22} speed={0.12} />
          <HaloRing
            position={[0, -0.6, -2.2]}
            radius={4.4}
            opacity={0.12}
            speed={0.08}
            reverse
            tilt={[0.4, 0.2, 0.3]}
            thickness={0.008}
          />
          <Sparkles
            count={110}
            scale={[18, 12, 8]}
            position={[0, 0.4, -1.5]}
            size={2.4}
            speed={0.4}
            opacity={0.5}
            color={ACCENT}
          />
          <Gem position={[-7.2, 2.6, -3]} scale={0.9} color={PRIMARY} opacity={0.25} />
          <Gem position={[7.4, 2.2, -3.6]} scale={1.1} color={ACCENT} opacity={0.22} />
          <Orb position={[-6.4, -0.4, -1.6]} scale={0.12} />
          <Orb position={[6.6, -1.4, -2]} scale={0.16} />
          <Orb position={[2.8, 2.4, -2.6]} scale={0.09} />
        </CameraRig>
      </Suspense>
    </Canvas>
  );
}

export function Hero3DScene() {
  const [reducedMotion, setReducedMotion] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  if (reducedMotion) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[380px] overflow-hidden sm:h-[460px] lg:h-[520px]"
    >
      <Scene />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
