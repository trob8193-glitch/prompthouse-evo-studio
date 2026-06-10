import React from 'react';
import { Shield, Zap, Sparkles, Check } from 'lucide-react';
import { Card, Button } from '../components/primitives.jsx';

export default function PricingCheckout() {
  const handleUpgrade = (tier) => {
    // In production, this hits the backend to create a Stripe Checkout Session
    alert(`Initiating Stripe Checkout for ${tier} tier...`);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
          Unlock the Sovereign Engine
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Upgrade your workspace to access dedicated AI pipelines, semantic vector memory, and autonomous self-healing execution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Starter Tier */}
        <Card className="p-8 bg-[#050508]/80 border-white/5 flex flex-col hover:border-slate-500/30 transition-colors">
          <div className="text-slate-400 text-sm font-bold tracking-widest uppercase mb-2">Starter</div>
          <div className="text-4xl font-black text-white mb-6">Free</div>
          <div className="space-y-4 mb-8 flex-1">
            <FeatureItem text="Local Execution Sandbox" />
            <FeatureItem text="Basic IDE Features" />
            <FeatureItem text="100 API Credits / month" />
            <FeatureItem text="Community Support" />
          </div>
          <Button variant="ghost" className="w-full justify-center opacity-50 cursor-not-allowed">
            Current Plan
          </Button>
        </Card>

        {/* Pro Tier (Highlighted) */}
        <Card className="p-8 bg-indigo-950/20 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.15)] flex flex-col relative transform scale-105">
          <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg flex items-center gap-1">
            <Sparkles size={12} /> MOST POPULAR
          </div>
          <div className="text-indigo-400 text-sm font-bold tracking-widest uppercase mb-2">Professional</div>
          <div className="flex items-baseline gap-2 mb-6">
            <div className="text-4xl font-black text-white">$49</div>
            <div className="text-slate-400">/ month</div>
          </div>
          <div className="space-y-4 mb-8 flex-1">
            <FeatureItem text="Unlimited AI Executions" />
            <FeatureItem text="Semantic Vector Memory" />
            <FeatureItem text="Real-Time Auto-Healing" />
            <FeatureItem text="100,000 API Credits / month" />
          </div>
          <Button variant="primary" className="w-full justify-center" onClick={() => handleUpgrade('Pro')}>
            <Zap size={16} className="mr-2" /> Upgrade to Pro
          </Button>
        </Card>

        {/* Enterprise Tier */}
        <Card className="p-8 bg-[#050508]/80 border-white/5 flex flex-col hover:border-slate-500/30 transition-colors">
          <div className="text-slate-400 text-sm font-bold tracking-widest uppercase mb-2">Enterprise</div>
          <div className="flex items-baseline gap-2 mb-6">
            <div className="text-4xl font-black text-white">$299</div>
            <div className="text-slate-400">/ month</div>
          </div>
          <div className="space-y-4 mb-8 flex-1">
            <FeatureItem text="Dedicated Virtual Swarm" />
            <FeatureItem text="Surgical Git Rollbacks" />
            <FeatureItem text="Unlimited API Credits" />
            <FeatureItem text="24/7 Priority Support" />
          </div>
          <Button variant="ghost" className="w-full justify-center border border-white/10" onClick={() => handleUpgrade('Enterprise')}>
            <Shield size={16} className="mr-2" /> Contact Sales
          </Button>
        </Card>
      </div>
    </div>
  );
}

function FeatureItem({ text }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">
      <div className="bg-indigo-500/20 p-1 rounded-full">
        <Check size={12} className="text-indigo-400" />
      </div>
      {text}
    </div>
  );
}
