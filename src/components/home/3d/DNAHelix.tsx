import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * DNAHelix — Animated double-helix made of two interleaved point strands
 * with connecting "rung" lines. Custom shader material creates a glowing,
 * holographic look matching the MedBridge teal palette.
 */
export default function DNAHelix({
  height = 8,
  radius = 0.8,
  turns = 4,
  pointsPerTurn = 30,
}: {
  height?: number;
  radius?: number;
  turns?: number;
  pointsPerTurn?: number;
}) {
  const strand1Ref = useRef<THREE.Points>(null);
  const strand2Ref = useRef<THREE.Points>(null);
  const rungsRef = useRef<THREE.LineSegments>(null);

  const total = turns * pointsPerTurn;

  const { s1Pos, s2Pos, rungPositions } = useMemo(() => {
    const s1 = new Float32Array(total * 3);
    const s2 = new Float32Array(total * 3);
    const rungs: number[] = [];

    for (let i = 0; i < total; i++) {
      const t = i / total;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;

      s1[i * 3] = Math.cos(angle) * radius;
      s1[i * 3 + 1] = y;
      s1[i * 3 + 2] = Math.sin(angle) * radius;

      s2[i * 3] = Math.cos(angle + Math.PI) * radius;
      s2[i * 3 + 1] = y;
      s2[i * 3 + 2] = Math.sin(angle + Math.PI) * radius;

      // Add rung every ~3 points
      if (i % 3 === 0) {
        rungs.push(
          Math.cos(angle) * radius, y, Math.sin(angle) * radius,
          Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius
        );
      }
    }

    return { s1Pos: s1, s2Pos: s2, rungPositions: new Float32Array(rungs) };
  }, [total, height, radius, turns]);

  const [geo1, geo2, rungGeo] = useMemo(() => {
    const g1 = new THREE.BufferGeometry();
    g1.setAttribute("position", new THREE.BufferAttribute(s1Pos, 3));

    const g2 = new THREE.BufferGeometry();
    g2.setAttribute("position", new THREE.BufferAttribute(s2Pos, 3));

    const gr = new THREE.BufferGeometry();
    gr.setAttribute("position", new THREE.BufferAttribute(rungPositions, 3));

    return [g1, g2, gr];
  }, [s1Pos, s2Pos, rungPositions]);

  const mat1 = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color("#10b981"),
        size: 0.12,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    []
  );

  const mat2 = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color("#0d9488"),
        size: 0.1,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    []
  );

  const rungMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color("#6ee7b7"),
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const group = [strand1Ref.current, strand2Ref.current, rungsRef.current];
    group.forEach((obj) => {
      if (obj) {
        obj.rotation.y = t * 0.4;
        obj.position.y = Math.sin(t * 0.3) * 0.3;
      }
    });
  });

  return (
    <group>
      <points ref={strand1Ref} geometry={geo1} material={mat1} />
      <points ref={strand2Ref} geometry={geo2} material={mat2} />
      <lineSegments ref={rungsRef} geometry={rungGeo} material={rungMat} />
    </group>
  );
}
