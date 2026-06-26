import React from 'react';

const HoloAvatar3D = ({ imageUrl, backImageUrl, topImageUrl = null, bottomImageUrl = null, isPanoramic = false, enableScreenOverlay = false, size = 200, isHollow = false, filterUrl = '', isDomeHat = false }) => {
  const slices = 64; // More slices = smoother curve
  const sliceWidth = (size * Math.PI) / slices;
  const radius = size / 2;
  const circumference = Math.PI * size;
  
  // For hollow/tight wrap: no trim so image fills full arc with no gaps
  // For normal: trim 12% so front and back edges meet cleanly at seam
  const trimEdge = isHollow ? 0 : 12;

  const renderCap = (imgUrl, isTop) => {
      if (!imgUrl) return null;
      
      const capStyles = {
        width: '100%',
        height: '100%',
        backgroundImage: `url('${imgUrl}')`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'absolute',
        top: 0,
        left: 0,
      };

      return (
        <div 
          className="absolute top-0 left-0"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            transform: `rotateX(${isTop ? 90 : -90}deg) translateZ(${isDomeHat ? radius * 0.7 : radius - 1}px)`,
            backfaceVisibility: 'hidden',
            opacity: 1.0,
            borderRadius: '50%',
            overflow: 'visible',
          }}
        >
          <div style={{ ...capStyles, filter: isHollow ? 'drop-shadow(0 0 8px rgba(52,211,153,0.6))' : 'none', backgroundColor: isHollow ? 'transparent' : (isDomeHat ? 'rgba(30,10,40,1)' : 'rgba(0,0,0,0.8)') }} />
          {enableScreenOverlay && (
            <div style={{ ...capStyles, mixBlendMode: 'screen', opacity: 0.85 }} />
          )}
          {/* Only add the dark radial overlay for non-hollow (opaque) caps */}
          {!isHollow && (
            <div style={{ 
              position: 'absolute', 
              inset: 0, 
              borderRadius: '50%', 
              background: 'radial-gradient(circle at center, rgba(30,10,40,1) 0%, rgba(10,0,15,1) 70%, rgba(0,0,0,1) 100%)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,1)'
            }} />
          )}
        </div>
      );
    };

  return (
    <div 
      className="relative flex items-center justify-center pointer-events-none"
      style={{ width: size, height: size, perspective: `${size * 4}px` }}
    >
      {/* Rotating 3D Cylinder or Dome */}
      <div 
        className="relative z-10"
        style={{ 
          width: size, 
          height: size, 
          transformStyle: 'preserve-3d',
          animation: 'spin-cylinder 15s linear infinite'
        }}
      >
        {/* Top Cap */}
        {renderCap(topImageUrl, true)}

        {/* Cylinder Slices */}
        {imageUrl && Array.from({ length: slices }).map((_, i) => {
          const rotationY = (i * 360) / slices;
          
          let currentImage = imageUrl;
          let bgPosPercentage = 0;
          let bgSize = `${circumference / 2 * (100 / (100 - 2 * trimEdge))}px 100%`;

          if (isPanoramic) {
             bgPosPercentage = ((rotationY + 180) % 360) / 360 * 100;
             bgSize = `${circumference}px 100%`;
          } else {
             const isFront = rotationY < 90 || rotationY >= 270;
             if (isFront) {
               const angleFront = rotationY >= 270 ? rotationY - 360 : rotationY; // -90 to +75
               bgPosPercentage = trimEdge + ((angleFront + 90) / 180) * (100 - 2 * trimEdge);
             } else {
               const angleBack = rotationY; // 90 to 255
               bgPosPercentage = trimEdge + ((angleBack - 90) / 180) * (100 - 2 * trimEdge);
             }
             currentImage = isFront ? imageUrl : (backImageUrl || imageUrl);
          }

           const sharedBgStyles = {
             width: '100%',
             height: '100%',
             backgroundImage: `url('${currentImage}')`,
             // isPanoramic uses the full circumference width computed in bgSize above
             // isHollow (non-panoramic) uses 120% height to fill ears/snout
             backgroundSize: isPanoramic
               ? `${circumference}px 120%`
               : isHollow
               ? `${circumference / 2}px 120%`
               : bgSize,
             backgroundPosition: `${bgPosPercentage}% center`,
             backgroundRepeat: 'no-repeat',
             position: 'absolute',
             top: (isHollow || isPanoramic) ? '-10%' : 0,
             left: 0,
          };

          return (
            <div
              key={i}
              className="absolute top-0"
              style={{
                width: `${sliceWidth + 1.5}px`,
                height: isDomeHat ? '50%' : '100%', // Hat only covers top half
                left: `${(size - sliceWidth) / 2}px`,
                // If it's a dome hat, angle the slices inwards by 45 degrees towards the north pole!
                transform: `rotateY(${rotationY}deg) translateZ(${radius}px) ${isDomeHat ? 'rotateX(35deg)' : ''}`,
                transformOrigin: isDomeHat ? 'bottom center' : 'center',
                backfaceVisibility: 'hidden',
                opacity: 0.98,
              }}
            >
               {/* Base Hollow Filtered Layer */}
               <div style={{ ...sharedBgStyles, filter: filterUrl ? filterUrl : (isHollow ? 'drop-shadow(0 0 5px rgba(16,185,129,0.5))' : 'none') }} />
               
               {/* Bright Screen Overlay Layer */}
               {enableScreenOverlay && (
                 <div style={{ ...sharedBgStyles, mixBlendMode: 'screen', opacity: 0.85 }} />
               )}
            </div>
          );
        })}

        {/* Bottom Cap */}
        {renderCap(bottomImageUrl, false)}
      </div>

      <style>{`
        @keyframes spin-cylinder {
          0% { transform: rotateX(-5deg) rotateY(0deg); }
          100% { transform: rotateX(-5deg) rotateY(360deg); }
        }
      `}</style>
    </div>
  );
};

export default HoloAvatar3D;
