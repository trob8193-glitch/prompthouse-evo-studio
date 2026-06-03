import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonBox = ({ className = '', style = {} }) => {
  return (
    <motion.div
      className={`bg-slate-800/40 rounded-xl overflow-hidden relative ${className}`}
      style={style}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg]"
        animate={{
          x: ['-100%', '200%']
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "linear"
        }}
      />
    </motion.div>
  );
};

export const SkeletonText = ({ className = '', lines = 1, width = '100%' }) => {
  return (
    <div className={`space-y-2 ${className}`} style={{ width }}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

export const SkeletonOpCard = () => {
  return (
    <div className="p-8 bg-black/40 rounded-3xl border border-slate-800/80">
      <div className="flex justify-between items-start mb-4">
        <SkeletonBox className="h-3 w-24" />
        <SkeletonBox className="h-3 w-3 rounded-full" />
      </div>
      <SkeletonText lines={2} className="mt-2" />
    </div>
  );
};
