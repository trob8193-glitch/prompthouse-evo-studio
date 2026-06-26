import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSovereignStore } from '../store.js';

export function EvoHologram() {
  const meshRef = useRef();
  const theme = useSovereignStore((s) => s.globalTheme?.theme || 'evoCore');

  useFrame((state, delta) => {
    if (meshRef.current) {
      if (theme === 'cyberpunk') {
        meshRef.current.rotation.x += delta * 0.5;
        meshRef.current.rotation.y += delta * 0.8;
      } else if (theme === 'layoutTerminalFullscreen') {
        meshRef.current.rotation.y += delta * 0.1;
      } else if (theme === 'extremeWindows95') {
        // No rotation, static 90s feel
      } else {
        // Default smooth rotation
        meshRef.current.rotation.y += delta * 0.2;
      }
    }
  });

  // Windows 95: Low-poly unlit gray box
  if (theme === 'extremeWindows95') {
    return (
      <mesh ref={meshRef} position={[0, 0, -5]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial color="#c0c0c0" wireframe={true} />
      </mesh>
    );
  }

  // Cyberpunk: Glitchy Torus Knot
  if (theme === 'cyberpunk') {
    return (
      <mesh ref={meshRef} position={[0, 0, -5]}>
        <torusKnotGeometry args={[1.2, 0.4, 100, 16]} />
        <meshStandardMaterial 
          color="#ff0055" 
          emissive="#7b00ff" 
          emissiveIntensity={0.8} 
          wireframe={true} 
        />
      </mesh>
    );
  }

  // Layout Terminal: Point Cloud (represented by an Icosahedron wireframe for now)
  if (theme === 'layoutTerminalFullscreen') {
    return (
      <mesh ref={meshRef} position={[0, 0, -5]}>
        <icosahedronGeometry args={[2, 2]} />
        <meshBasicMaterial color="#00ff00" wireframe={true} transparent opacity={0.3} />
      </mesh>
    );
  }

  // Default / evoCore / alpha: Smooth glowing sphere
  return (
    <mesh ref={meshRef} position={[0, 0, -5]}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial
        color="#00ffe0"
        emissive="#7b00ff"
        emissiveIntensity={0.5}
        transparent
        opacity={0.4}
        wireframe={true}
      />
    </mesh>
  );
}
