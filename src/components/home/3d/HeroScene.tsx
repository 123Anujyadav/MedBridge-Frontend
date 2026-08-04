import { useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

import DNAHelix from "./DNAHelix";
import HolographicRings from "./HolographicRings";
import NeuralParticles from "./NeuralParticles";
import WaveShader from "./WaveShader";

/** Mouse parallax camera controller */
function CameraRig() {
  const { camera, gl } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = gl.domElement;
    const container = canvas.parentElement;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.current.y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [gl]);

  useFrame(() => {
    target.current.x += (mouse.current.x - target.current.x) * 0.04;
    target.current.y += (mouse.current.y - target.current.y) * 0.04;

    camera.position.x = target.current.x * 0.8;
    camera.position.y = target.current.y * 0.4;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/** Ambient volumetric light cone */
function VolumetricLight() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && meshRef.current.material) {
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.06 + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 3, 0]} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[3.5, 8, 32, 1, true]} />
      <meshBasicMaterial
        color={new THREE.Color("#10b981")}
        transparent
        opacity={0.07}
        side={THREE.BackSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/** Single floating orb mesh — avoids hooks-in-loop */
function FloatingOrb({
  pos,
  color,
  scale,
  speed,
  index,
}: {
  pos: [number, number, number];
  color: string;
  scale: number;
  speed: number;
  index: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [color]
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y = pos[1] + Math.sin(t * speed + index) * 0.3;
      ref.current.position.x = pos[0] + Math.cos(t * speed * 0.7 + index) * 0.2;
    }
  });

  return (
    <mesh ref={ref} position={pos} scale={scale} material={mat}>
      <sphereGeometry args={[1, 16, 16]} />
    </mesh>
  );
}

/** Floating orb spheres for depth */
function FloatingOrbs() {
  const orbs = [
    { pos: [-2.5, 1, -2] as [number, number, number], color: "#0d9488", scale: 0.4, speed: 0.4 },
    { pos: [2.8, -0.5, -1.5] as [number, number, number], color: "#10b981", scale: 0.3, speed: 0.3 },
    { pos: [0.5, 2.2, -2.5] as [number, number, number], color: "#064e3b", scale: 0.5, speed: 0.5 },
  ];

  return (
    <group>
      {orbs.map((orb, i) => (
        <FloatingOrb key={i} {...orb} index={i} />
      ))}
    </group>
  );
}

function HeroSceneContent() {
  return (
    <>
      <CameraRig />
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 5, 0]} color="#10b981" intensity={2} distance={20} />
      <pointLight position={[-4, 0, 2]} color="#0d9488" intensity={1} distance={15} />

      {/* Wave in background */}
      <WaveShader />

      {/* Volumetric light cone from top */}
      <VolumetricLight />

      {/* DNA Helix — centered */}
      <group position={[0, 0, 0]}>
        <DNAHelix height={7} radius={0.9} turns={4} pointsPerTurn={32} />
      </group>

      {/* Holographic rings around the helix */}
      <HolographicRings />

      {/* Floating neural particle cloud */}
      <NeuralParticles count={8000} spread={6} speed={0.4} />

      {/* Floating orb depth elements */}
      <FloatingOrbs />

      {/* Post-processing: Bloom */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          intensity={0.8}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

/**
 * HeroScene — The full R3F canvas for the hero right column.
 * Contains: DNA helix, holographic rings, neural particles, wave shader,
 * volumetric light, bloom post-processing, and mouse parallax camera.
 *
 * Lazy-loaded and wrapped in Suspense. Falls back gracefully if WebGL fails.
 */
export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
      camera={{ position: [0, 0, 8], fov: 50 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 420,
        background: "transparent",
        display: "block",
      }}
    >
      <Suspense fallback={null}>
        <HeroSceneContent />
      </Suspense>
    </Canvas>
  );
}
