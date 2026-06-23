import React, { useState, useEffect } from 'react';
import { Shield, Key, Rocket, CheckCircle } from 'lucide-react';
import { safeFetchBridge } from '../config/bridge-config.js';

export const FirstRunWizard = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [keys, setKeys] = useState({ openai: '', stripe: '', vercel: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Check if we've already run the wizard
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await safeFetchBridge('/api/vault/status');
        if (res.ok && res.data?.configured) {
          onComplete(); // Skip if already configured
        }
      } catch (err) {
        console.warn('Vault status check failed, assuming first run.', err);
      }
    };
    checkStatus();
  }, [onComplete]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await safeFetchBridge('/api/vault/store', {
        method: 'POST',
        body: JSON.stringify(keys)
      });
      if (!res.ok) throw new Error(res.error || 'Failed to save credentials');
      setStep(3); // Success step
      setTimeout(() => onComplete(), 2000);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,12,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
      <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, padding: 32, width: 480, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <Rocket size={32} color="#818cf8" />
              <h2 style={{ color: '#f8fafc', margin: 0, fontSize: 24 }}>Welcome to Evo Studio</h2>
            </div>
            <p style={{ color: '#cbd5e1', lineHeight: 1.6, marginBottom: 24 }}>
              Before the autonomous agents can spin up full SaaS architectures, they require credentials to interact with reality. 
              These keys are stored safely in your localized vault.
            </p>
            <button 
              onClick={() => setStep(2)}
              style={{ background: '#6366f1', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
            >
              Configure Credentials
            </button>
            <button 
              onClick={() => onComplete()}
              style={{ background: 'transparent', color: '#64748b', border: 'none', padding: '12px 24px', cursor: 'pointer', width: '100%', marginTop: 8 }}
            >
              Skip for now (Run in Demo Mode)
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ color: '#f8fafc', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Key color="#34d399" /> Credential Vault
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4, fontWeight: 'bold' }}>OpenAI API Key (Required for Agent)</label>
                <input 
                  type="password" 
                  value={keys.openai}
                  onChange={e => setKeys({...keys, openai: e.target.value})}
                  placeholder="sk-..."
                  style={{ width: '100%', padding: 10, background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#f8fafc' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4, fontWeight: 'bold' }}>Stripe Secret Key (Required for Commerce)</label>
                <input 
                  type="password" 
                  value={keys.stripe}
                  onChange={e => setKeys({...keys, stripe: e.target.value})}
                  placeholder="sk_test_..."
                  style={{ width: '100%', padding: 10, background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#f8fafc' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4, fontWeight: 'bold' }}>Vercel Token (Required for Finality Deploy)</label>
                <input 
                  type="password" 
                  value={keys.vercel}
                  onChange={e => setKeys({...keys, vercel: e.target.value})}
                  placeholder="..."
                  style={{ width: '100%', padding: 10, background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#f8fafc' }}
                />
              </div>
            </div>

            {error && <div style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: 12, borderRadius: 6, marginTop: 16, fontSize: 13 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button 
                onClick={() => setStep(1)}
                style={{ flex: 1, background: '#334155', color: 'white', border: 'none', padding: '10px', borderRadius: 6, cursor: 'pointer' }}
              >
                Back
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                style={{ flex: 2, background: '#10b981', color: 'white', border: 'none', padding: '10px', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Shield size={16} /> {saving ? 'Securing...' : 'Lock in Vault'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ color: '#f8fafc', margin: '0 0 12px 0' }}>Vault Secured</h2>
            <p style={{ color: '#cbd5e1' }}>Studio logic is now tethered to your accounts. Stand by.</p>
          </div>
        )}

      </div>
    </div>
  );
};
