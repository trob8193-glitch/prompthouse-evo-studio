import React from 'react';
import HoloAvatar3D from './HoloAvatar3D';

const HoloSphere = ({ size = 200, botId }) => {
  const isEvo = botId === 'evo' || botId === 'omni';

  const glowColor = isEvo ? 'rgba(52, 211, 153, 0.8)' : 'rgba(56, 189, 248, 0.8)';
  const coreColor = isEvo ? 'rgba(52, 211, 153, 0.5)' : 'rgba(56, 189, 248, 0.5)';
  const ringColor = isEvo ? 'rgba(52, 211, 153, 0.9)' : 'rgba(56, 189, 248, 0.9)';
  
  const zapColor1 = isEvo ? '#a78bfa' : '#22d3ee'; // Purple / Cyan
  const zapColor2 = isEvo ? '#10b981' : '#a855f7'; // Green / Purple

  return (
    <div className="relative flex items-center justify-center pointer-events-none" style={{ width: size, height: size, perspective: `${size * 3}px` }}>
      
      {/* Outer Glow Halo */}
      <div 
        className="absolute inset-0 rounded-full animate-pulse-slow"
        style={{
          boxShadow: `0 0 40px ${glowColor}, inset 0 0 20px ${coreColor}`,
          filter: 'blur(8px)',
        }}
      />

      {/* Inner Core */}
      <div 
        className="absolute inset-4 rounded-full"
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          boxShadow: `0 0 60px ${glowColor}`,
        }}
      />

      {/* Rotating 3D Boundary Rings */}
      <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', animation: 'spin-3d 10s linear infinite' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border border-opacity-50"
            style={{
              borderColor: ringColor,
              transform: `rotateY(${i * 45}deg) rotateX(${i * 22.5}deg)`,
            }}
          />
        ))}
      </div>

      {/* Additional Counter-Rotating Inner Rings */}
      <div className="absolute inset-2" style={{ transformStyle: 'preserve-3d', animation: 'spin-3d-reverse 15s linear infinite' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border border-opacity-30"
            style={{
              borderColor: ringColor,
              transform: `rotateY(${i * 90}deg) rotateZ(${i * 45}deg)`,
            }}
          />
        ))}
      </div>

      {/* Particle Dust (CSS representation) */}
      <div className="absolute inset-0 rounded-full overflow-hidden opacity-30 mix-blend-screen" style={{
        background: `radial-gradient(circle at 50% 50%, ${glowColor} 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        animation: 'spin-slow 20s linear infinite',
      }} />

      {/* Live Electricity Effect */}
      <div className="absolute inset-0 rounded-full z-20 pointer-events-none mix-blend-screen overflow-hidden opacity-100" style={{ filter: `drop-shadow(0 0 10px ${ringColor}) drop-shadow(0 0 20px ${glowColor})` }}>
         <div className="w-full h-full" style={{ animation: 'flicker 0.1s infinite' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full absolute" style={{ animation: 'spin-slow 3s linear infinite' }}>
              <path d="M 15 50 Q 30 20, 50 50 T 85 50" fill="none" stroke={zapColor1} strokeWidth="2" strokeDasharray="30 70" strokeLinecap="round" style={{ animation: 'animate-zap 0.2s linear infinite' }} />
            </svg>
            <svg viewBox="0 0 100 100" className="w-full h-full absolute" style={{ animation: 'spin-slow 2s linear infinite reverse' }}>
              <path d="M 50 15 Q 80 30, 50 50 T 50 85" fill="none" stroke={zapColor2} strokeWidth="1.5" strokeDasharray="20 80" strokeLinecap="round" style={{ animation: 'animate-zap 0.15s linear infinite reverse' }} />
            </svg>
            <svg viewBox="0 0 100 100" className="w-full h-full absolute" style={{ animation: 'spin-slow 1.5s linear infinite' }}>
              <path d="M 25 25 L 45 40 L 40 60 L 60 50 L 75 75" fill="none" stroke={zapColor1} strokeWidth="2.5" strokeDasharray="15 85" strokeLinecap="round" style={{ animation: 'animate-zap 0.1s linear infinite' }} />
            </svg>
            <svg viewBox="0 0 100 100" className="w-full h-full absolute" style={{ animation: 'spin-slow 0.8s linear infinite reverse' }}>
              <path d="M 10 30 Q 50 10, 90 30 Q 50 90, 10 70" fill="none" stroke={zapColor2} strokeWidth="1.5" strokeDasharray="10 90" strokeLinecap="round" style={{ animation: 'animate-zap 0.08s linear infinite' }} />
            </svg>
            {/* New aggressive arcs */}
            <svg viewBox="0 0 100 100" className="w-full h-full absolute" style={{ animation: 'spin-slow 0.5s linear infinite' }}>
              <path d="M 0 50 Q 50 0, 100 50" fill="none" stroke={zapColor1} strokeWidth="2" strokeDasharray="40 60" strokeLinecap="round" style={{ animation: 'animate-zap 0.05s linear infinite reverse' }} />
            </svg>
            <svg viewBox="0 0 100 100" className="w-full h-full absolute" style={{ animation: 'spin-slow 0.3s linear infinite reverse' }}>
              <path d="M 50 0 Q 100 50, 50 100" fill="none" stroke={zapColor2} strokeWidth="1.5" strokeDasharray="50 50" strokeLinecap="round" style={{ animation: 'animate-zap 0.03s linear infinite' }} />
            </svg>
            <svg viewBox="0 0 100 100" className="w-full h-full absolute" style={{ animation: 'spin-slow 2.5s linear infinite' }}>
              <path d="M 20 80 L 40 50 L 60 70 L 80 20" fill="none" stroke={zapColor1} strokeWidth="3" strokeDasharray="20 80" strokeLinecap="round" style={{ animation: 'animate-zap 0.12s linear infinite' }} />
            </svg>
            {/* Radiating Branches */}
            <svg viewBox="0 0 100 100" className="w-full h-full absolute" style={{ animation: 'spin-slow 4s linear infinite' }}>
              <path d="M 50 50 L 40 35 L 20 20 L 5 5 M 40 35 L 60 20 M 50 50 L 65 55 L 85 70 M 65 55 L 75 90 M 50 50 L 30 70 L 10 90" fill="none" stroke={zapColor2} strokeWidth="2" strokeLinecap="round" style={{ animation: 'blast-expand-recede 0.8s ease-in-out infinite' }} />
            </svg>
            <svg viewBox="0 0 100 100" className="w-full h-full absolute" style={{ animation: 'spin-slow 1.2s linear infinite reverse' }}>
              <path d="M 50 50 L 65 35 L 85 20 M 65 35 L 50 10 M 50 50 L 35 65 L 15 80 M 35 65 L 40 95 M 50 50 L 70 70 L 95 85" fill="none" stroke={zapColor1} strokeWidth="1.5" strokeLinecap="round" style={{ animation: 'blast-expand-recede 0.6s ease-in-out infinite 0.2s' }} />
            </svg>
            <svg viewBox="0 0 100 100" className="w-full h-full absolute" style={{ animation: 'spin-slow 3.5s linear infinite' }}>
              <path d="M 50 50 L 30 40 L 10 30 M 30 40 L 20 10 M 50 50 L 70 40 L 90 30 M 70 40 L 80 10 M 50 50 L 50 75 L 40 95 M 50 75 L 65 100" fill="none" stroke={zapColor2} strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'blast-expand-recede 1s ease-in-out infinite 0.5s' }} />
            </svg>
         </div>
      </div>

      <style>{`
        @keyframes spin-3d {
          0% { transform: rotateX(-10deg) rotateY(0deg) rotateZ(5deg); }
          100% { transform: rotateX(-10deg) rotateY(360deg) rotateZ(5deg); }
        }
        @keyframes spin-3d-reverse {
          0% { transform: rotateX(10deg) rotateY(360deg) rotateZ(-5deg); }
          100% { transform: rotateX(10deg) rotateY(0deg) rotateZ(-5deg); }
        }
        @keyframes animate-pulse-slow {
          0%, 100% { opacity: 0.8; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1.02); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes animate-zap {
          0% { stroke-dashoffset: 100; opacity: 1; }
          50% { opacity: 0.5; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          10% { opacity: 0; }
          20% { opacity: 1; }
          50% { opacity: 0.2; }
          60% { opacity: 1; }
          80% { opacity: 0.5; }
        }
        @keyframes blast-expand-recede {
          0% { clip-path: circle(0% at 50% 50%); opacity: 0; transform: scale(0.8); }
          10% { clip-path: circle(20% at 50% 50%); opacity: 1; }
          40% { clip-path: circle(100% at 50% 50%); opacity: 1; transform: scale(1.05); }
          70% { clip-path: circle(0% at 50% 50%); opacity: 0.5; transform: scale(0.9); }
          100% { clip-path: circle(0% at 50% 50%); opacity: 0; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
};

export default HoloSphere;
