import React from 'react';
import HoloTigerEars3D from './HoloTigerEars3D';

const HoloTigerWireframe3D = ({ size = 200 }) => {
  const skullSize = size * 0.8;
  const snoutSize = size * 0.45;
  const colorPrimary = 'rgba(168, 85, 247, 0.8)'; // Purple
  const colorSecondary = 'rgba(52, 211, 153, 0.8)'; // Neon Green
  const colorGlowPrimary = 'rgba(168, 85, 247, 1)';
  const colorGlowSecondary = 'rgba(52, 211, 153, 1)';

  return (
    <div className="relative flex items-center justify-center pointer-events-none" style={{ width: size, height: size, perspective: `${size * 4}px` }}>
      
      {/* ENTIRE HEAD CONTAINER - Spins slowly to show 3D depth */}
      <div className="relative w-full h-full flex items-center justify-center animate-tiger-head-bob" style={{ transformStyle: 'preserve-3d' }}>
        
        {/* SKULL (Base Wireframe Sphere) */}
        <div className="absolute flex items-center justify-center" style={{ width: skullSize, height: skullSize, transformStyle: 'preserve-3d', animation: 'spin-skull 10s linear infinite' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`skull-lon-${i}`}
              className="absolute inset-0 border-[2px] rounded-full mix-blend-screen"
              style={{
                borderColor: colorPrimary,
                transform: `rotateY(${i * 22.5}deg)`,
                boxShadow: `0 0 10px ${colorGlowPrimary}, inset 0 0 5px ${colorGlowPrimary}`
              }}
            />
          ))}
          {Array.from({ length: 5 }).map((_, i) => {
            const progress = (i + 1) / 6;
            const yOffset = Math.cos(progress * Math.PI) * (skullSize / 2);
            const scale = Math.sin(progress * Math.PI);
            return (
              <div
                key={`skull-lat-${i}`}
                className="absolute inset-0 border-[2px] rounded-full mix-blend-screen"
                style={{
                  borderColor: colorSecondary,
                  transform: `translateY(${yOffset}px) rotateX(90deg) scale(${scale})`,
                  boxShadow: `0 0 8px ${colorGlowSecondary}, inset 0 0 5px ${colorGlowSecondary}`
                }}
              />
            );
          })}
        </div>

        {/* CHEEKS (Side Wireframe Fluff) */}
        <div className="absolute flex items-center justify-center" style={{ width: skullSize, height: skullSize, transformStyle: 'preserve-3d' }}>
          <div className="absolute border-[2px] border-emerald-400 rounded-[50%]" style={{ width: '40%', height: '80%', left: '-10%', transform: 'rotateZ(20deg) rotateY(45deg)', boxShadow: `0 0 10px ${colorGlowSecondary}` }} />
          <div className="absolute border-[2px] border-emerald-400 rounded-[50%]" style={{ width: '40%', height: '80%', right: '-10%', transform: 'rotateZ(-20deg) rotateY(-45deg)', boxShadow: `0 0 10px ${colorGlowSecondary}` }} />
        </div>

        {/* SNOUT (Protruding Wireframe Cylinder) */}
        <div 
          className="absolute flex items-center justify-center" 
          style={{ 
            width: snoutSize, 
            height: snoutSize * 0.8, 
            transformStyle: 'preserve-3d',
            transform: `translateZ(${skullSize / 2 + 10}px) translateY(20px) rotateX(-10deg)` 
          }}
        >
          {/* Snout longitudinal rings */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`snout-lon-${i}`}
              className="absolute inset-0 border-[2px] rounded-full mix-blend-screen"
              style={{
                borderColor: colorPrimary,
                transform: `rotateY(${i * 30}deg)`,
                boxShadow: `0 0 8px ${colorGlowPrimary}`
              }}
            />
          ))}
          {/* Snout front face */}
          <div className="absolute inset-0 border-[3px] rounded-[40%] mix-blend-screen bg-black/40 backdrop-blur-sm" style={{ borderColor: colorSecondary, transform: `translateZ(${snoutSize/2}px)`, boxShadow: `0 0 15px ${colorGlowSecondary}` }} />
          
          {/* Nose Core */}
          <div className="absolute bg-fuchsia-400 rounded-2xl animate-pulse" style={{ width: '30%', height: '20%', transform: `translateZ(${snoutSize/2 + 5}px) translateY(-30%)`, boxShadow: '0 0 20px #f0abfc' }} />
          
          {/* Whiskers (Left and Right) */}
          {Array.from({ length: 3 }).map((_, i) => (
            <React.Fragment key={`whisker-${i}`}>
              <div className="absolute border-t-[2px] border-emerald-300" style={{ width: '80px', left: '-60px', transform: `translateZ(${snoutSize/4}px) rotateZ(${-15 + i * 15}deg)`, boxShadow: `0 0 5px ${colorGlowSecondary}` }} />
              <div className="absolute border-t-[2px] border-emerald-300" style={{ width: '80px', right: '-60px', transform: `translateZ(${snoutSize/4}px) rotateZ(${15 - i * 15}deg)`, boxShadow: `0 0 5px ${colorGlowSecondary}` }} />
            </React.Fragment>
          ))}
        </div>

        {/* EYES (Floating geometric shapes inside the skull) */}
        <div className="absolute flex items-center justify-between" style={{ width: snoutSize * 1.5, height: '20px', transform: `translateZ(${skullSize / 2 - 10}px) translateY(-30px)`, transformStyle: 'preserve-3d' }}>
          <div className="w-[30px] h-[15px] border-[2px] border-fuchsia-400 bg-fuchsia-400/50 mix-blend-screen animate-pulse" style={{ clipPath: 'polygon(0 50%, 50% 0, 100% 50%, 50% 100%)', boxShadow: `0 0 20px ${colorGlowPrimary}`, transform: 'rotateZ(-15deg)' }} />
          <div className="w-[30px] h-[15px] border-[2px] border-fuchsia-400 bg-fuchsia-400/50 mix-blend-screen animate-pulse" style={{ clipPath: 'polygon(0 50%, 50% 0, 100% 50%, 50% 100%)', boxShadow: `0 0 20px ${colorGlowPrimary}`, transform: 'rotateZ(15deg)' }} />
        </div>

        {/* EARS (Reusing the curved hybrid ears!) */}
        <div style={{ transform: 'scale(0.85) translateY(-30px)' }}>
          <HoloTigerEars3D size={size} />
        </div>

      </div>

      <style>{`
        @keyframes spin-skull {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes tiger-head-bob {
          0%, 100% { transform: rotateY(-15deg) rotateX(-5deg) translateY(0px); }
          50% { transform: rotateY(15deg) rotateX(5deg) translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

export default HoloTigerWireframe3D;
