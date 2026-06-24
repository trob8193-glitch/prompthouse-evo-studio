import React from 'react';

export function BentoBoxLayout({ children, className = '' }) {
  return (
    <div className={`w-full h-full p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px] overflow-y-auto ${className}`}>
      {children}
    </div>
  );
}

export function BentoCard({ children, span = 1, rowSpan = 1, className = '' }) {
  const colClass = span === 2 ? 'md:col-span-2' : span === 3 ? 'md:col-span-3 lg:col-span-3' : span === 4 ? 'lg:col-span-4' : 'col-span-1';
  const rowClass = rowSpan === 2 ? 'row-span-2' : rowSpan === 3 ? 'row-span-3' : 'row-span-1';
  
  return (
    <div className={`glass-extreme rounded-3xl overflow-hidden ${colClass} ${rowClass} ${className}`}>
      {children}
    </div>
  );
}
