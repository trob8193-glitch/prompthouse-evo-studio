import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, SRGBColorSpace, BackSide, DoubleSide } from 'three';

const TigerSphere = () => {
  const sphereRef = useRef();
  const glowRef = useRef();

  // Load the 360 equirectangular texture
  const colorMap = useLoader(TextureLoader, '/bots/sovereignty_360.png');
  colorMap.colorSpace = SRGBColorSpace;
  
  // Extract only the front 180 degrees (the face) of the panorama
  colorMap.repeat.x = 0.5;
  colorMap.offset.x = 0.25;

  useFrame((state) => {
    if (sphereRef.current) {
      // Continuous slow Y-axis spin
      sphereRef.current.rotation.y -= 0.004;
      // Gentle tilt
      sphereRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.18;
    }
    if (glowRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.03;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      {/* OUTER GLOW SHELL */}
      <mesh ref={glowRef} scale={1.08}>
        <sphereGeometry args={[1, 64, 64, Math.PI / 2, Math.PI]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.12}
          side={DoubleSide}
        />
      </mesh>

      {/* MAIN TIGER SPHERE — 3D CLAY MOLD (HOLLOW FRONT-HALF) */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[1, 128, 128, Math.PI / 2, Math.PI]} />
        <meshStandardMaterial
          map={colorMap}
          bumpMap={colorMap}
          bumpScale={0.08}
          emissive="#ffffff"
          emissiveIntensity={0}
          roughness={0.95}
          metalness={0.05}
          transparent={true}
          side={DoubleSide}
        />
      </mesh>

      {/* WIREFRAME OVERLAY SPHERE */}
      <mesh>
        <sphereGeometry args={[1.005, 32, 32, Math.PI / 2, Math.PI]} />
        <meshBasicMaterial
          color="#c084fc"
          wireframe
          transparent
          opacity={0.07}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
};

const HoloTigerFiber3D = ({ size = 200 }) => {
  return (
    <div
      className="pointer-events-none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: size,
        height: size,
        zIndex: 30,
        filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.8)) drop-shadow(0 0 8px rgba(52,211,153,0.5))',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 2.6], fov: 45 }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: false }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
        dpr={[1, 2]}
      >
        {/* Lighting rig for dramatic 3D shading */}
        <ambientLight intensity={0.3} />
        {/* Key light — strong from top-left for face sculpting */}
        <directionalLight position={[3, 4, 3]} intensity={2.5} color="#ffffff" />
        {/* Purple fill light from the right */}
        <pointLight position={[-4, 0, 2]} intensity={1.8} color="#c084fc" distance={10} />
        {/* Neon green rim light from behind-bottom */}
        <pointLight position={[0, -3, -2]} intensity={1.2} color="#34d399" distance={10} />
        {/* Warm top accent */}
        <pointLight position={[0, 4, 0]} intensity={0.8} color="#fbbf24" distance={10} />

        <Suspense fallback={null}>
          <TigerSphere />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default HoloTigerFiber3D;
