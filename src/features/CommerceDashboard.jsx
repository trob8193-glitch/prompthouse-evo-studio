import React from 'react';
import { ShoppingCart, TrendingUp, DollarSign, Activity, CreditCard, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CommerceDashboard() {
  const metrics = [
    { label: 'MRR', value: '$12,450', change: '+14.5%', positive: true },
    { label: 'Active Subs', value: '842', change: '+5.2%', positive: true },
    { label: 'Churn Rate', value: '1.2%', change: '-0.3%', positive: true },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a0f18] rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 to-cyan-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out z-10"></div>
      
      <div className="p-6 border-b border-[rgba(255,255,255,0.05)] bg-black/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <ShoppingCart size={20} />
          </div>
          <div>
            <h2 className="text-gray-200 font-bold tracking-wider text-sm uppercase">Commerce Nexus</h2>
            <p className="text-xs text-gray-500">Stripe Integration & Revenue Tracking</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 font-bold text-xs uppercase tracking-widest rounded-lg border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-colors">
          <CreditCard size={14} /> Connect Stripe
        </button>
      </div>

      <div className="p-6 grid grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={m.label} 
            className="bg-black/40 border border-[rgba(255,255,255,0.05)] rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-emerald-500/30 transition-colors"
          >
            <div className="absolute inset-0 bg-emerald-500/5 blur-xl rounded-full transform scale-150 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 z-10">{m.label}</div>
            <div className="text-3xl font-black text-white font-mono mb-2 z-10">{m.value}</div>
            <div className={`text-xs font-bold flex items-center gap-1 z-10 ${m.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
              <ArrowUpRight size={12} /> {m.change}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex-1 p-6 pt-0 overflow-y-auto">
         <div className="bg-black/20 border border-[rgba(255,255,255,0.05)] rounded-xl h-full p-4 flex flex-col items-center justify-center text-center">
            <Activity size={48} className="text-emerald-500/20 mb-4" />
            <h3 className="text-gray-300 font-bold mb-2 uppercase tracking-widest text-sm">Revenue Pulse Stream</h3>
            <p className="text-gray-500 text-xs px-12">Live transaction events will appear here once the payment gateway is fully synthesized and attached to the truth spine.</p>
         </div>
      </div>
    </div>
  );
}
