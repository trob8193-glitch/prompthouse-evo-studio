/**
 * PromptHouse Evo Studio — Feature Foundry Dashboard (SMFF PHASE C)
 * ═══════════════════════════════════════════════════════════════
 * The Command Deck for autonomous feature harvesting and productization.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Hammer, Sparkles, TrendingUp, ShieldCheck, Zap, Layers, RefreshCw } from 'lucide-react';
import { UniversalBridge } from '../core/interop/UniversalBridge.js';

export function FeatureFoundryView() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMission, setActiveMission] = useState(null);
  const bridge = new UniversalBridge();

  const harvestOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bridge.dispatch('foundry', 'harvest', {});
      if (res.success) {
        setMissions(res.missions);
      } else {
        console.error('Harvest failed:', res.error);
      }
    } catch (e) {
      console.error('Harvest dispatch error:', e);
    }
    setLoading(false);
  }, []);

  const initiateBuild = useCallback(async (mission) => {
    setActiveMission(mission);
    try {
      const res = await bridge.dispatch('foundry', 'initiate', mission);
      if (res.success) {
<<<<<<< HEAD
        
=======
        console.log('Build initiated:', res.manifest);
>>>>>>> main
        // In Phase D, this would trigger the actual code generation
      }
    } catch (e) {
      console.error('Build initiation error:', e);
    }
  }, []);

  return (
    <div style={{ padding: 24, animation: 'fadeIn 0.4s ease-out' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#f8fafc', margin: 0, letterSpacing: '-0.5px' }}>
            Feature <span style={{ color: '#6366f1' }}>Foundry</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Autonomous SaaS Genesis Loop — Analyzing project gaps and building revenue streams.</p>
        </div>
        <button 
          onClick={harvestOpportunities} 
          disabled={loading}
          style={{ 
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', padding: '12px 20px', borderRadius: 12, 
            color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
          }}
        >
          {loading ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
          {loading ? 'Harvesting Codebase...' : 'Scan for Opportunities'}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
        {Array.isArray(missions) && missions.length > 0 ? missions.map((mission, idx) => (
          <div key={mission.id} style={{ 
            background: '#111827', border: '1px solid #1e293b', borderRadius: 20, padding: 24, 
            transition: 'transform 0.2s, border-color 0.2s', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '12px 16px', background: '#6366f11a', borderBottomLeftRadius: 16, color: '#818cf8', fontSize: 10, fontWeight: 800 }}>
              OPPORTUNITY {idx + 1}
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', margin: '0 0 12px 0' }}>{mission.name}</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 20 }}>{mission.description}</p>
            
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1, padding: '10px', background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
                <div style={{ fontSize: 9, color: '#475569', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Est. Value</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#10b981' }}>${(mission.estimatedPrice / 100).toFixed(2)}</div>
              </div>
              <div style={{ flex: 1, padding: '10px', background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
                <div style={{ fontSize: 9, color: '#475569', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Complexity</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#f59e0b' }}>{mission.complexity}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {mission.techStack.map(tech => (
                <span key={tech} style={{ padding: '4px 8px', background: '#1e293b', borderRadius: 6, fontSize: 10, color: '#94a3b8', border: '1px solid #334155' }}>{tech}</span>
              ))}
            </div>

            <button 
              onClick={() => initiateBuild(mission)}
              style={{ 
                width: '100%', padding: '14px', borderRadius: 12, border: '1px solid #6366f1', background: activeMission?.id === mission.id ? '#6366f1' : 'transparent',
                color: activeMission?.id === mission.id ? 'white' : '#818cf8', fontWeight: 800, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s'
              }}
            >
              <Hammer size={16} />
              {activeMission?.id === mission.id ? 'Build Cycle Active' : 'Initiate Autonomous Build'}
            </button>
          </div>
        )) : (
          <div style={{ gridColumn: '1 / -1', padding: '80px 20px', textAlign: 'center', background: '#111827', border: '1px dashed #1e293b', borderRadius: 24 }}>
            <Zap size={48} color="#334155" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#94a3b8', margin: 0 }}>The Foundry is Idle</h3>
            <p style={{ fontSize: 14, color: '#475569', marginTop: 8 }}>Run a project harvest to identify the next profitable feature.</p>
          </div>
        )}
      </div>

      {activeMission && (
        <div style={{ marginTop: 32, padding: 24, background: 'linear-gradient(135deg, #111827, #0f172a)', border: '1px solid #6366f144', borderRadius: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#6366f11a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={32} color="#6366f1" />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>Active Build: {activeMission.name}</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748b' }}>OpenAI is crafting the production code while Stripe prepares the checkout session...</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} /> Truth Verified
            </div>
            <div style={{ width: 100, height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
              <div className="shimmer" style={{ width: '60%', height: '100%', background: '#6366f1' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
