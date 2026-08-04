import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BG_PARTICLE_COUNT = 20000;

/** Tiny floating points in the global background */
function BackgroundParticles() {
  const meshRef = useRef<THREE.Points>(null);

  const { positions, phases } = useMemo(() => {
    const pos = new Float32Array(BG_PARTICLE_COUNT * 3);
    const ph = new Float32Array(BG_PARTICLE_COUNT);
    const spread = 60;

    for (let i = 0; i < BG_PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
      ph[i] = Math.random() * Math.PI * 2;
    }

    return { positions: pos, phases: ph };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    return geo;
  }, [positions]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color("#10b981"),
        size: 0.06,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    []
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * 0.08;

    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < BG_PARTICLE_COUNT; i++) {
      posAttr.setY(i, positions[i * 3 + 1] + Math.sin(t + phases[i]) * 0.3);
    }
    posAttr.needsUpdate = true;
    meshRef.current.rotation.y = t * 0.02;
  });

  return <points ref={meshRef} geometry={geometry} material={material} />;
}

/** Single background orb — avoids hooks-in-loop */
function BackgroundOrb({
  pos,
  radius,
  color,
  opacity,
  index,
}: {
  pos: [number, number, number];
  radius: number;
  color: string;
  opacity: number;
  index: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [color, opacity]
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y = pos[1] + Math.sin(t * 0.1 + index * 2) * 2;
      ref.current.position.x = pos[0] + Math.cos(t * 0.08 + index) * 1.5;
    }
  });

  return (
    <mesh ref={ref} position={pos} material={mat}>
      <sphereGeometry args={[radius, 16, 16]} />
    </mesh>
  );
}

/** Large blurred teal orb spheres for background depth */
function BackgroundOrbs() {
  const orbs = [
    { pos: [-20, 10, -15] as [number, number, number], radius: 8, color: "#0d9488", opacity: 0.06 },
    { pos: [25, -5, -20] as [number, number, number], radius: 12, color: "#064e3b", opacity: 0.08 },
    { pos: [5, 20, -25] as [number, number, number], radius: 6, color: "#10b981", opacity: 0.05 },
  ];

  return (
    <group>
      {orbs.map((orb, i) => (
        <BackgroundOrb key={i} {...orb} index={i} />
      ))}
    </group>
  );
}

/** Medical grid plane — subtle XZ grid on the virtual floor */
function MedicalGrid() {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = ((state.clock.getElapsedTime() * 0.5) % 2) - 1;
    }
  });

  return (
    <gridHelper
      ref={gridRef}
      args={[80, 40, new THREE.Color("#10b981"), new THREE.Color("#064e3b")]}
      position={[0, -12, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

function GlobalSceneContent() {
  return (
    <>
      <BackgroundParticles />
      <BackgroundOrbs />
      <MedicalGrid />
    </>
  );
}

/**
 * GlobalParticleCanvas — Fixed full-screen WebGL canvas that sits behind
 * all page content. Renders the ambient background particle field, glowing
 * teal orbs, and animated medical grid.
 *
 * pointer-events: none ensures it never blocks user interaction.
 * Only renders on devices with hardware concurrency > 2.
 */
export default function GlobalParticleCanvas() {
  // Skip on very low-end or touch-only devices
  const isLowEnd =
    typeof navigator !== "undefined" &&
    (navigator.hardwareConcurrency <= 2 ||
      window.matchMedia("(pointer: coarse)").matches);

  if (isLowEnd) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: -1,
      }}
    >
      <Canvas
        dpr={[1, 1]}
        camera={{ position: [0, 5, 30], fov: 60 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "default",
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <GlobalSceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
