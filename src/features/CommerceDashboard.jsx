import React, { useState } from 'react';
import { CreditCard, TrendingUp, Users, Activity } from 'lucide-react';
import { Card } from '../components/primitives.jsx';

export default function CommerceDashboard() {
  const [metrics] = useState({
    mrr: 12450.00,
    activeLicenses: 342,
    conversionRate: 8.4,
    apiRequests: 1420000
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600">
          Commerce Engine
        </h1>
        <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          Stripe Connected
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard 
          title="Monthly Recurring Revenue" 
          value={`$${metrics.mrr.toLocaleString()}`} 
          trend="+12%" 
          icon={<CreditCard className="text-emerald-400" />} 
        />
        <MetricCard 
          title="Active Enterprise Licenses" 
          value={metrics.activeLicenses} 
          trend="+5" 
          icon={<Users className="text-blue-400" />} 
        />
        <MetricCard 
          title="Free-to-Paid Conversion" 
          value={`${metrics.conversionRate}%`} 
          trend="+1.2%" 
          icon={<TrendingUp className="text-purple-400" />} 
        />
        <MetricCard 
          title="Monetized API Requests" 
          value={(metrics.apiRequests / 1000000).toFixed(1) + 'M'} 
          trend="+400k" 
          icon={<Activity className="text-amber-400" />} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <Card className="p-6 bg-[#050508]/80 border-white/5 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                <div>
                  <div className="text-sm font-bold text-white">Enterprise License (Annual)</div>
                  <div className="text-xs text-white/50">org_stellar_dynamics_${i}</div>
                </div>
                <div className="text-emerald-400 font-bold">+$9,900.00</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-[#050508]/80 border-white/5 shadow-xl flex flex-col justify-center items-center text-center space-y-4">
          <CreditCard size={48} className="text-white/20" />
          <h2 className="text-2xl font-bold text-white">Ready for Production</h2>
          <p className="text-white/50 text-sm">
            The PromptHouse Evo Studio billing infrastructure is armed. 
            Ensure your Stripe Webhooks point to <code className="text-amber-400">/api/commerce/stripe/webhook</code> 
            before launching.
          </p>
          <button onClick={() => window.open('https://dashboard.stripe.com', '_blank')} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            Go To Stripe Dashboard
          </button>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, icon }) {
  return (
    <Card className="p-6 bg-[#050508]/80 border-white/5 shadow-xl hover:-translate-y-1 transition-transform">
      <div className="flex justify-between items-start mb-4">
        <div className="bg-white/5 p-3 rounded-xl">{icon}</div>
        <div className="text-emerald-400 text-sm font-bold bg-emerald-400/10 px-2 py-1 rounded">{trend}</div>
      </div>
      <div className="text-white/50 text-sm font-semibold mb-1">{title}</div>
      <div className="text-3xl font-black text-white">{value}</div>
    </Card>
  );
}
