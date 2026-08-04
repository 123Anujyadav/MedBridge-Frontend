import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 25000;

/**
 * NeuralParticles — GPU-instanced point cloud that forms a floating neural
 * network aesthetic. All animation lives in useFrame — zero re-renders.
 *
 * - Uses BufferGeometry with pre-computed positions and phase offsets
 * - Teal/emerald/white color palette matching MedBridge brand
 * - Soft additive blending for glow effect
 */
export default function NeuralParticles({
  count = PARTICLE_COUNT,
  spread = 40,
  speed = 0.3,
}: {
  count?: number;
  spread?: number;
  speed?: number;
}) {
  const meshRef = useRef<THREE.Points>(null);

  const { positions, phases, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    const col = new Float32Array(count * 3);

    const palette = [
      new THREE.Color("#10b981"), // emerald-500
      new THREE.Color("#0d9488"), // teal-600
      new THREE.Color("#064e3b"), // emerald-900
      new THREE.Color("#6ee7b7"), // emerald-300
      new THREE.Color("#ffffff"), // white
    ];

    for (let i = 0; i < count; i++) {
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = Math.cbrt(Math.random()) * spread;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      ph[i] = Math.random() * Math.PI * 2;

      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return { positions: pos, phases: ph, colors: col };
  }, [count, spread]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("phase", new THREE.BufferAttribute(phases, 1));
    return geo;
  }, [positions, colors, phases]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.65,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * speed;
    // Slowly rotate the whole cloud
    meshRef.current.rotation.y = t * 0.05;
    meshRef.current.rotation.x = Math.sin(t * 0.03) * 0.1;

    // Animate individual particle positions (GPU-friendly: only updating attribute)
    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const origPos = positions;
    for (let i = 0; i < count; i++) {
      const ph = phases[i];
      posAttr.setXYZ(
        i,
        origPos[i * 3] + Math.sin(t + ph) * 0.15,
        origPos[i * 3 + 1] + Math.cos(t * 0.7 + ph) * 0.15,
        origPos[i * 3 + 2] + Math.sin(t * 0.5 + ph + 1) * 0.1
      );
    }
    posAttr.needsUpdate = true;
  });

  return <points ref={meshRef} geometry={geometry} material={material} />;
}
