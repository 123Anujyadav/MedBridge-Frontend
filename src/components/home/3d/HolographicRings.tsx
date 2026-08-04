import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * HolographicRings — Three concentric transparent torus rings at different
 * orientations, with subtle glow material and individual rotation speeds.
 * Creates the premium "AI hologram" depth effect.
 */
export default function HolographicRings() {
  const r1 = useRef<THREE.Mesh>(null);
  const r2 = useRef<THREE.Mesh>(null);
  const r3 = useRef<THREE.Mesh>(null);

  const rings = [
    { ref: r1, rx: 0, ry: 0, rz: 0, speed: 0.15, color: "#10b981", opacity: 0.35, tube: 0.01, radius: 2.2 },
    { ref: r2, rx: Math.PI / 3, ry: 0, rz: Math.PI / 6, speed: -0.1, color: "#0d9488", opacity: 0.25, tube: 0.008, radius: 3.0 },
    { ref: r3, rx: Math.PI / 2, ry: Math.PI / 4, rz: 0, speed: 0.08, color: "#6ee7b7", opacity: 0.2, tube: 0.006, radius: 3.8 },
  ];

  const materials = useMemo(
    () =>
      rings.map((r) =>
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(r.color),
          transparent: true,
          opacity: r.opacity,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    rings.forEach((ring, i) => {
      if (ring.ref.current) {
        ring.ref.current.rotation.y = t * ring.speed;
        ring.ref.current.rotation.z = t * ring.speed * 0.5;
        // Gentle breathing scale
        const scale = 1 + Math.sin(t * 0.5 + i * 1.2) * 0.03;
        ring.ref.current.scale.setScalar(scale);
      }
    });
  });

  return (
    <group>
      {rings.map((ring, i) => (
        <mesh
          key={i}
          ref={ring.ref}
          rotation={[ring.rx, ring.ry, ring.rz]}
          material={materials[i]}
        >
          <torusGeometry args={[ring.radius, ring.tube, 16, 120]} />
        </mesh>
      ))}
    </group>
  );
}
