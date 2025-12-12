import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Icosahedron, Ring } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedSphere = ({ position, scale = 1, speed = 1, distort = 0.3 }: { position: [number, number, number]; scale?: number; speed?: number; distort?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={position} scale={scale}>
        <MeshDistortMaterial
          color="#0ea5e9"
          attach="material"
          distort={distort}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          emissive="#0ea5e9"
          emissiveIntensity={0.3}
        />
      </Sphere>
    </Float>
  );
};

const OrbitingRing = ({ radius, speed, rotationAxis }: { radius: number; speed: number; rotationAxis: 'x' | 'y' | 'z' }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation[rotationAxis] = state.clock.elapsedTime * speed;
    }
  });

  return (
    <group ref={groupRef}>
      <Ring args={[radius - 0.02, radius, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.4} side={THREE.DoubleSide} />
      </Ring>
    </group>
  );
};

const FloatingIcosahedron = ({ position, scale = 1, speed = 1 }: { position: [number, number, number]; scale?: number; speed?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5 * speed;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.3 * speed;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <Icosahedron ref={meshRef} args={[1, 0]} position={position} scale={scale}>
        <meshStandardMaterial
          color="#38bdf8"
          wireframe
          emissive="#0ea5e9"
          emissiveIntensity={0.5}
        />
      </Icosahedron>
    </Float>
  );
};

const OrbitingTorus = ({ position, speed = 1 }: { position: [number, number, number]; speed?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
      <Torus ref={meshRef} args={[1, 0.3, 16, 100]} position={position} scale={0.5}>
        <meshStandardMaterial
          color="#7dd3fc"
          roughness={0.3}
          metalness={0.9}
          emissive="#0ea5e9"
          emissiveIntensity={0.2}
        />
      </Torus>
    </Float>
  );
};

const Particles = ({ count = 100 }: { count?: number }) => {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#0ea5e9" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
};

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#0ea5e9" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#38bdf8" />
      <spotLight position={[0, 10, 0]} intensity={0.5} color="#7dd3fc" angle={0.5} />
      
      {/* Main center sphere */}
      <AnimatedSphere position={[0, 0, 0]} scale={1.5} speed={0.5} distort={0.4} />
      
      {/* Orbiting rings */}
      <OrbitingRing radius={3} speed={0.3} rotationAxis="y" />
      <OrbitingRing radius={3.5} speed={-0.2} rotationAxis="x" />
      <OrbitingRing radius={4} speed={0.15} rotationAxis="z" />
      
      {/* Floating geometric shapes */}
      <FloatingIcosahedron position={[4, 2, -2]} scale={0.6} speed={0.8} />
      <FloatingIcosahedron position={[-4, -1, 1]} scale={0.4} speed={1.2} />
      <FloatingIcosahedron position={[3, -3, 2]} scale={0.3} speed={1} />
      
      {/* Orbiting torus */}
      <OrbitingTorus position={[-3, 2, -1]} speed={0.6} />
      <OrbitingTorus position={[2, -2, 3]} speed={0.8} />
      
      {/* Particle field */}
      <Particles count={200} />
    </>
  );
};

const HeroScene = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default HeroScene;
