import React from 'react';
import { ShoppingBag, Download, Star, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudioMarketplaceDashboard() {
  const plugins = [
    { name: 'Neural Splitting Hub', author: '@evo_core', rating: 4.9, downloads: '12k', type: 'Core' },
    { name: 'AWS Lambda Weaver', author: '@cloud_smith', rating: 4.7, downloads: '8.4k', type: 'Deploy' },
    { name: 'Quantum UI Pack', author: '@design_bot', rating: 4.8, downloads: '15k', type: 'Theme' },
    { name: 'Supabase Sync', author: '@db_wizard', rating: 4.6, downloads: '5.2k', type: 'Data' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a0f18] rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-purple-500 to-pink-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out z-10"></div>
      
      <div className="p-6 border-b border-[rgba(255,255,255,0.05)] bg-black/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h2 className="text-gray-200 font-bold tracking-wider text-sm uppercase">Global Marketplace</h2>
            <p className="text-xs text-gray-500">Discover AI Models & Architectures</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-[rgba(255,255,255,0.1)] rounded-lg text-xs font-bold text-gray-400 hover:text-white transition-colors">
          <Filter size={14} /> Filter
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {/* Featured Banner */}
        <div className="bg-linear-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-xl p-6 mb-6 relative overflow-hidden group/banner cursor-pointer">
           <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 blur-[50px] rounded-full"></div>
           <div className="flex justify-between items-center relative z-10">
             <div>
               <div className="flex items-center gap-2 text-pink-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                 <Sparkles size={12} /> Featured Architecture
               </div>
               <h3 className="text-2xl font-black text-white mb-1">Omni-Vector Commerce Setup</h3>
               <p className="text-purple-200/60 text-sm max-w-md">Instantly deploys a full-stack Next.js app with Stripe, Supabase, and Tailwind, pre-wired into the truth spine.</p>
             </div>
             <button className="px-6 py-3 bg-white text-black font-bold rounded-lg shadow-xl shadow-white/10 group-hover/banner:scale-105 transition-transform">
               Install Now
             </button>
           </div>
        </div>

        {/* Plugin Grid */}
        <div className="flex items-center justify-between mb-4">
           <h4 className="text-sm font-bold text-white uppercase tracking-widest">Trending Modules</h4>
           <a href="#" className="text-xs font-bold text-purple-400 flex items-center gap-1 hover:text-purple-300">View All <ChevronRight size={14} /></a>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {plugins.map((p, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={p.name} 
              className="bg-black/40 border border-[rgba(255,255,255,0.05)] p-4 rounded-xl hover:border-purple-500/30 transition-colors group/card cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded text-[10px] font-bold uppercase tracking-widest">{p.type}</span>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                   <Star size={12} fill="currentColor" /> {p.rating}
                </div>
              </div>
              <h5 className="text-gray-200 font-bold mb-1 group-hover/card:text-purple-400 transition-colors">{p.name}</h5>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-gray-500">{p.author}</span>
                <div className="flex items-center gap-1 text-gray-600 text-[10px] font-mono">
                  <Download size={12} /> {p.downloads}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
