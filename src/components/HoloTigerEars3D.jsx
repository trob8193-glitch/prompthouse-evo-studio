import React from 'react';

const HoloEar = ({ isLeft, size }) => {
  const earWidth = 50;
  const earHeight = 65;
  const sliceCount = 14;
  
  return (
    <div 
      className="absolute"
      style={{
        width: earWidth,
        height: earHeight,
        top: 0,
        left: isLeft ? 15 : size - 15 - earWidth,
        transformStyle: 'preserve-3d',
        // Tilt the ear outward and forward
        transform: `translateZ(30px) rotateZ(${isLeft ? -25 : 25}deg) rotateX(15deg) rotateY(${isLeft ? -30 : 30}deg)`,
      }}
    >
      {/* Ear Curved Shell (Sliced into a hollow semi-cone) */}
      <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
        {Array.from({ length: sliceCount }).map((_, i) => {
          // Angle from 90 to 270 creates the solid BACK of the ear, leaving the front open
          const angle = 90 + (180 / (sliceCount - 1)) * i; 
          return (
            <div
              key={`slice-${i}`}
              className="absolute inset-0"
              style={{
                // Cyberpunk neon gradient
                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(168,85,247,0.9) 40%, rgba(52,211,153,1) 100%)',
                width: `${earWidth / sliceCount + 4}px`, // Slight overlap to prevent gaps
                height: '100%',
                clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)', // Triangle slice
                transformOrigin: 'bottom center',
                // Translate outward into a circle, tilt inward to form a cone
                transform: `rotateY(${angle}deg) translateZ(${earWidth / 2.2}px) rotateX(20deg)`,
                left: '50%',
                marginLeft: `-${(earWidth / sliceCount + 4) / 2}px`,
                boxShadow: '0 0 5px rgba(52,211,153,0.5)',
                backfaceVisibility: 'visible'
              }}
            />
          );
        })}
      </div>

      {/* Inner Intersecting Energy Sphere (The "HoloSphere" logic) */}
      <div 
        className="absolute left-1/2"
        style={{ 
          bottom: '10px',
          width: '24px', 
          height: '24px', 
          marginLeft: '-12px',
          transformStyle: 'preserve-3d', 
          animation: `spin-ear-energy-${isLeft ? 'left' : 'right'} 2s linear infinite` 
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`ring-${i}`}
            className="absolute inset-0 rounded-full border-[1.5px] border-fuchsia-400"
            style={{
              transform: `rotateY(${i * 45}deg)`,
              boxShadow: '0 0 8px rgba(217,70,239,1), inset 0 0 4px rgba(217,70,239,0.8)'
            }}
          />
        ))}
        {/* Tiny intense core */}
        <div 
          className="absolute inset-2 rounded-full bg-emerald-400"
          style={{ boxShadow: '0 0 15px rgba(52,211,153,1)' }}
        />
      </div>
      
      <style>{`
        @keyframes spin-ear-energy-left {
          0% { transform: rotateX(-20deg) rotateY(0deg) rotateZ(10deg); }
          100% { transform: rotateX(-20deg) rotateY(360deg) rotateZ(10deg); }
        }
        @keyframes spin-ear-energy-right {
          0% { transform: rotateX(-20deg) rotateY(360deg) rotateZ(-10deg); }
          100% { transform: rotateX(-20deg) rotateY(0deg) rotateZ(-10deg); }
        }
      `}</style>
    </div>
  );
};

const HoloTigerEars3D = ({ size = 181 }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-30" style={{ transformStyle: 'preserve-3d' }}>
      <HoloEar isLeft={true} size={size} />
      <HoloEar isLeft={false} size={size} />
    </div>
  );
};

export default HoloTigerEars3D;
