import React from 'react';

export function EvolutionOSTab({ autonomousEvolutionStatus, cardStyle }) {
  return (
    <div style={{ ...cardStyle, background: '#020617' }}>
      <h2 style={{ margin: '0 0 14px 0', fontSize: 24, fontWeight: 900 }}>Autonomous Evolution OS</h2>
      {!autonomousEvolutionStatus ? (
        <div style={{ color: '#94a3b8', fontSize: 13 }}>Awaiting live evolution telemetry from PromptBridge...</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
            <div style={{ background: 'rgba(0,0,0,0.32)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Capability Graph</div>
              <div style={{ marginTop: 6, fontSize: 18, fontWeight: 900, color: '#6ee7b7' }}>{autonomousEvolutionStatus.capabilityGraph?.summary?.modules ?? 0} modules</div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#cbd5e1' }}>Drift: {autonomousEvolutionStatus.drift?.score ?? 0}% ({autonomousEvolutionStatus.drift?.status || 'unknown'})</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.32)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Failure Memory</div>
              <div style={{ marginTop: 6, fontSize: 18, fontWeight: 900, color: '#fca5a5' }}>{autonomousEvolutionStatus.failureMemory?.total ?? 0} failures</div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#cbd5e1' }}>Weak point: {autonomousEvolutionStatus.failureMemory?.recoveryPlan?.topStage || 'none'}</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.32)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.14em' }}>NightForge Challenge</div>
              <div style={{ marginTop: 6, fontSize: 18, fontWeight: 900, color: '#fde047' }}>{autonomousEvolutionStatus.nightforgeChallenge?.activeChallenge?.name || 'none'}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#cbd5e1' }}>{autonomousEvolutionStatus.nightforgeChallenge?.activeChallenge?.target || 'No challenge active.'}</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.32)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Replay Theater</div>
              <div style={{ marginTop: 6, fontSize: 18, fontWeight: 900, color: '#67e8f9' }}>{autonomousEvolutionStatus.replayTheater?.total ?? 0} runs</div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#cbd5e1' }}>Verified: {autonomousEvolutionStatus.replayTheater?.statusMix?.verified ?? 0}</div>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.32)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Top Feature Fusions</div>
            {(autonomousEvolutionStatus.featureFusion?.top || []).slice(0, 5).map((fusion) => (
              <div key={fusion.id} style={{ padding: '8px 10px', marginBottom: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,23,42,0.5)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{fusion.route}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{fusion.fromUi} ↔ {fusion.toApi}</div>
                <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>{fusion.proposal}</div>
              </div>
            ))}
            {(autonomousEvolutionStatus.featureFusion?.top || []).length === 0 && (
              <div style={{ color: '#64748b', fontSize: 12 }}>No live fusion candidates found yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
