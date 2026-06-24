import React from 'react';

export function ForgeRenderConsoleView() {
  return (
    <div className="flex-col h-full glass-extreme border-[#333] m-4 rounded-md overflow-hidden">
      <div className="flex bg-[#222] border-b border-[#333] px-2 pt-2">
        <div className="bg-[#111] text-[#00ffcc] text-xs px-4 py-2 rounded-t-md font-mono border-t border-x border-[#444] border-b-transparent relative z-10">
          Preview
        </div>
        <div className="text-gray-500 text-xs px-4 py-2 rounded-t-md font-mono cursor-pointer hover:text-gray-300">
          Code
        </div>
      </div>
      <div className="flex-1 p-8 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMzMzMiLz48L3N2Zz4=')] opacity-20"></div>
        <div className="z-10 text-center">
          <div className="w-16 h-16 border-4 border-[#333] border-t-[#00ffcc] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-mono text-sm">Waiting for compilation...</p>
        </div>
      </div>
    </div>
  );
}
