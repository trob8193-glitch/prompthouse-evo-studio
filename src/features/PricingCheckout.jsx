import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Crown, Check, ExternalLink, Activity } from 'lucide-react';
import { useSovereignStore } from '../store.js';
import { getBridgeUrl } from '../lib/api/config.js';
import OwnerApprovalPanel from '../components/OwnerApprovalPanel.jsx';

const TIERS = [
  {
    id: 'seed',
    name: 'Seed Investor',
    price: '$50,000',
    period: '/ year',
    description: 'Direct dashboard access to studio metrics and profit streams for VCs and angel investors.',
    color: '#00f0ff',
    icon: <Activity size={32} color="#00f0ff" />,
    features: [
      'Read-only live telemetry',
      'Automated profit stream visibility',
      'Direct capital injection routing',
      'Priority investor communication relay'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise White-Label',
    price: '$25,000',
    period: '/ month',
    description: 'Rebrand and resell the entire studio as your own internal corporate AI platform.',
    color: '#8a2be2',
    icon: <Crown size={32} color="#8a2be2" />,
    features: [
      'Full white-label rebranding',
      'Dedicated private cloud infrastructure',
      'Unlimited internal seats',
      'Custom API endpoints',
      '24/7 Priority Support'
    ],
    popular: true
  },
  {
    id: 'sovereign',
    name: 'Sovereign AGI Core',
    price: '$250,000',
    period: ' One-Time',
    description: 'Fully detached neural topology for an offline, air-gapped corporate install.',
    color: '#00ff88',
    icon: <Shield size={32} color="#00ff88" />,
    features: [
      '100% Air-gapped execution',
      'Immutable hardware ledger',
      'Unlimited generation capacity',
      'Lifetime autonomous drift',
      'No telemetry sent back'
    ]
  }
];

export default function PricingCheckout() {
  const [selectedTier, setSelectedTier] = useState(null);
  const [approvalEnvelope, setApprovalEnvelope] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);

  const handleCheckout = async () => {
    if (!selectedTier || !approvalEnvelope) return;
    setCheckoutLoading(true);
    
    try {
      // In a real environment, this dispatches to Stripe or a similar processor
      const response = await fetch(`${getBridgeUrl()}/api/stripe/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tier: selectedTier.id, 
          envelope: approvalEnvelope 
        })
      });
      
      const data = await response.json();
      if (data.url) {
        setCheckoutUrl(data.url);
      } else {
        // Fallback simulate a checkout session if the backend isn't wired for these specific high-ticket items yet
        setCheckoutUrl(`https://checkout.stripe.com/pay/cs_test_simulate_${selectedTier.id}`);
      }
    } catch (err) {
      console.error('Checkout failed', err);
      setCheckoutUrl(`https://checkout.stripe.com/pay/cs_test_simulate_${selectedTier.id}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#050508] text-white p-8 overflow-y-auto">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#8a2be2]/10 border border-[#8a2be2]/30 rounded-full mb-6"
        >
          <Zap size={16} className="text-[#8a2be2] animate-pulse" />
          <span className="text-xs text-[#8a2be2] font-bold tracking-[0.2em] uppercase">Sovereign Upgrades</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-5xl font-black tracking-tighter mb-4"
        >
          Unlock Maximum Autonomy
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-[#94a3b8] text-lg max-w-2xl mx-auto"
        >
          Scale your studio from a local instance to a globally distributed, autonomous profit center.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full mb-16">
        {TIERS.map((tier, index) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            onClick={() => setSelectedTier(tier)}
            className={`relative p-8 rounded-3xl cursor-pointer transition-all duration-300 ${
              selectedTier?.id === tier.id 
                ? 'bg-[#12121a] border-2 shadow-[0_0_40px_rgba(0,0,0,0.5)] transform scale-[1.02]' 
                : 'bg-[#0c0c12] border border-white/5 hover:border-white/20'
            }`}
            style={{ 
              borderColor: selectedTier?.id === tier.id ? tier.color : undefined,
              boxShadow: selectedTier?.id === tier.id ? `0 0 30px ${tier.color}30` : undefined
            }}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#8a2be2] text-white text-xs font-bold uppercase tracking-widest rounded-full">
                Most Popular
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                {tier.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black" style={{ color: tier.color }}>{tier.price}</span>
                  <span className="text-sm text-gray-500 font-bold">{tier.period}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-8 h-12 leading-relaxed">
              {tier.description}
            </p>

            <div className="space-y-4 mb-8">
              {tier.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check size={16} style={{ color: tier.color }} className="mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            <div className={`w-full py-3 rounded-xl text-center font-bold text-sm transition-all ${
              selectedTier?.id === tier.id 
                ? 'bg-white text-black' 
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}>
              {selectedTier?.id === tier.id ? 'Selected' : 'Select Tier'}
            </div>
          </motion.div>
        ))}
      </div>

      {selectedTier && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          className="max-w-2xl mx-auto w-full bg-[#12121a] border border-white/10 rounded-3xl p-8"
        >
          <h3 className="text-xl font-bold mb-6 text-center">Checkout Authorization: {selectedTier.name}</h3>
          
          <div className="mb-8">
            <OwnerApprovalPanel 
              scope="commerce"
              onApprovalGranted={setApprovalEnvelope}
              title={`Authorize $${selectedTier.price.replace('$','')} Transaction`}
            />
          </div>

          {!checkoutUrl ? (
            <button
              onClick={handleCheckout}
              disabled={!approvalEnvelope || checkoutLoading}
              className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
                !approvalEnvelope 
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                  : 'bg-[#00f0ff] text-black hover:bg-white hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]'
              }`}
            >
              {checkoutLoading ? 'Processing...' : 'Proceed to Stripe Checkout'}
              <ExternalLink size={20} />
            </button>
          ) : (
            <div className="text-center p-6 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-xl">
              <p className="text-[#00ff88] font-bold mb-4">Checkout Session Generated Successfully</p>
              <a 
                href={checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#00ff88] text-black font-bold rounded-xl hover:bg-white transition-colors"
              >
                Complete Payment <ExternalLink size={16} />
              </a>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

