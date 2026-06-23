import React, { useState, useRef, useEffect } from 'react';

export function SplitPaneLayout({ leftPane, rightPane, initialLeftWidth = 50 }) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newWidth > 10 && newWidth < 90) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = 'default';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="w-full h-full flex overflow-hidden relative" ref={containerRef}>
      <div style={{ width: `${leftWidth}%` }} className="h-full relative overflow-y-auto overflow-x-hidden">
        {leftPane}
      </div>
      
      <div 
        className="w-2 h-full cursor-col-resize flex items-center justify-center hover:bg-cyan-500/30 transition-colors z-50 relative shrink-0"
        onMouseDown={() => setIsDragging(true)}
      >
        <div className="w-px h-12 bg-cyan-500/50"></div>
      </div>
      
      <div style={{ width: `${100 - leftWidth}%` }} className="h-full relative overflow-y-auto overflow-x-hidden">
        {rightPane}
      </div>
    </div>
  );
}
