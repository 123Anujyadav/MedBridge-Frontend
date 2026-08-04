import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uFrequency;

  void main() {
    vUv = uv;
    
    float elevation = sin(position.x * uFrequency + uTime) * 
                      cos(position.y * uFrequency * 0.7 + uTime * 0.8) * 
                      uAmplitude;
    elevation += sin(position.x * uFrequency * 2.0 + uTime * 1.3) * 
                 uAmplitude * 0.4;
    
    vElevation = elevation;
    
    vec3 newPos = position;
    newPos.z += elevation;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  
  void main() {
    // Teal-to-emerald gradient based on elevation + UV
    float t = (vElevation + 0.3) * 1.5 + vUv.y * 0.4;
    t = clamp(t, 0.0, 1.0);
    
    vec3 lowColor = vec3(0.024, 0.306, 0.235);  // #064e3b
    vec3 highColor = vec3(0.063, 0.584, 0.533); // #0d9488
    vec3 peakColor = vec3(0.067, 0.725, 0.506); // ~#11b882
    
    vec3 color = mix(lowColor, highColor, t);
    color = mix(color, peakColor, max(0.0, t - 0.7) * 3.0);
    
    // Vignette fade at edges
    float distFromCenter = length(vUv - 0.5) * 2.0;
    float alpha = (1.0 - smoothstep(0.6, 1.0, distFromCenter)) * 0.35;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * WaveShader — Animated GLSL wave plane. Custom vertex displacement shader
 * creates a liquid, flowing surface. Fragment shader maps teal-to-emerald
 * gradient based on wave elevation. Used as the hero background plane.
 */
export default function WaveShader() {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniformsRef = useRef({
    uTime: { value: 0 },
    uAmplitude: { value: 0.3 },
    uFrequency: { value: 1.2 },
  });

  useFrame((state) => {
    uniformsRef.current.uTime.value = state.clock.getElapsedTime() * 0.5;
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value =
        uniformsRef.current.uTime.value;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -2, -3]} rotation={[-Math.PI * 0.15, 0, 0]}>
      <planeGeometry args={[20, 10, 80, 40]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniformsRef.current}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
