import React, { useEffect, useState } from 'react';

const BRIDGE = 'http://localhost:3001';

async function getJson(path) {
  const res = await fetch(`${BRIDGE}${path}`);
  if (!res.ok) throw new Error(`${path} returned ${res.status}`);
  return res.json();
}

function SectionCard({ title, subtitle, actions, children }) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
            {subtitle ? <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>{subtitle}</div> : null}
          </div>
          {actions}
        </div>
        {children}
      </div>
    </div>
  );
}

function useRemote(load, deps = []) {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  useEffect(() => {
    let mounted = true;
    setState((current) => ({ ...current, loading: true, error: '' }));
    load()
      .then((data) => {
        if (mounted) setState({ loading: false, error: '', data });
      })
      .catch((error) => {
        if (mounted) setState({ loading: false, error: error.message, data: null });
      });
    return () => {
      mounted = false;
    };
  }, deps);

  return state;
}

export function PromptPacketAuthorityPanel({ title = 'Native Prompt OS Packet Authority', subtitle = 'Canonical build packet imported into source truth for Mission Control and Prompt Registry.' }) {
  const [reloadKey, setReloadKey] = useState(0);
  const { loading, error, data } = useRemote(() => getJson('/api/prompt-os/packet'), [reloadKey]);
  const packet = data?.packet || null;
  const authority = packet?.authority || null;

  return (
    <SectionCard
      title={title}
      subtitle={subtitle}
      actions={<button className="btn btn-secondary btn-sm" onClick={() => setReloadKey((value) => value + 1)}>Refresh</button>}
    >
      {loading ? <div className="page-subtitle">Loading packet authority...</div> : null}
      {error ? <div className="page-subtitle" style={{ color: 'var(--accent-red)' }}>{error}</div> : null}
      {authority ? (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 mb-4">
            <div className="prompt-block"><div>Version</div><div style={{ fontSize: 18, fontWeight: 800 }}>{authority.version || '1.0'}</div></div>
            <div className="prompt-block"><div>Build Target</div><div style={{ fontSize: 12, fontWeight: 700 }}>{authority.buildTarget || 'Local studio preservation'}</div></div>
            <div className="prompt-block"><div>Prompt Cells</div><div style={{ fontSize: 18, fontWeight: 800 }}>{authority.promptCells?.length || 0}</div></div>
            <div className="prompt-block"><div>State</div><div style={{ fontSize: 12, fontWeight: 700 }}>{packet.imported ? 'Imported' : 'Preview only'}</div></div>
          </div>
          <div className="prompt-block mb-4">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Mission Phase Canon</div>
            <div className="flex flex-wrap gap-2">
              {authority.missionPhases?.map((phase) => <span key={phase} className="badge badge-dim">{phase}</span>)}
            </div>
          </div>
          <div className="prompt-block">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Operating Layers</div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {authority.operatingLayers?.map((layer) => (
                <div key={layer.id} style={{ border: '1px solid var(--border-dim)', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{layer.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{layer.role}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </SectionCard>
  );
}

export function ReleaseSpinePanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const { loading, error, data } = useRemote(() => getJson('/api/release-spine/status'), [reloadKey]);
  const spine = data?.releaseSpine || null;

  return (
    <SectionCard
      title="Release Spine"
      subtitle="Operator truth surface for worktree classification, route parity, source truth, and build review."
      actions={<button className="btn btn-secondary btn-sm" onClick={() => setReloadKey((value) => value + 1)}>Refresh</button>}
    >
      {loading ? <div className="page-subtitle">Loading release spine...</div> : null}
      {error ? <div className="page-subtitle" style={{ color: 'var(--accent-red)' }}>{error}</div> : null}
      {spine ? (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 mb-4">
            <div className="prompt-block"><div>Status</div><div style={{ fontSize: 16, fontWeight: 800 }}>{spine.status}</div></div>
            <div className="prompt-block"><div>Unknown</div><div style={{ fontSize: 18, fontWeight: 800 }}>{spine.artifactRegistry?.unknownEntries?.length || 0}</div></div>
            <div className="prompt-block"><div>Route Drift</div><div style={{ fontSize: 18, fontWeight: 800 }}>{spine.contractLedger?.summary?.notImplemented || 0}</div></div>
            <div className="prompt-block"><div>Build Review</div><div style={{ fontSize: 16, fontWeight: 800 }}>{spine.buildReviewGate?.status || 'unknown'}</div></div>
            <div className="prompt-block"><div>Source Truth</div><div style={{ fontSize: 16, fontWeight: 800 }}>{spine.projectSource?.summary?.completenessState || 'missing'}</div></div>
          </div>
          <div className="prompt-block mb-4">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Blocked Reasons</div>
            <div className="flex flex-wrap gap-2">
              {(spine.blocked || []).length
                ? spine.blocked.map((item) => <span key={item} className="badge badge-gold">{item}</span>)
                : <span className="badge badge-green">no blockers</span>}
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="prompt-block">
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Worktree</div>
              <div style={{ fontSize: 12 }}>Classified entries: {spine.artifactRegistry?.counts?.total || 0}</div>
              <div style={{ fontSize: 12 }}>Generated: {spine.artifactRegistry?.counts?.byType?.generated || 0}</div>
              <div style={{ fontSize: 12 }}>Imported: {spine.artifactRegistry?.counts?.byType?.imported || 0}</div>
            </div>
            <div className="prompt-block">
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Source Truth</div>
              <div style={{ fontSize: 12 }}>Coverage: {spine.projectSource?.summary?.coveragePercent || 0}%</div>
              <div style={{ fontSize: 12 }}>Claims: {spine.projectSource?.summary?.claimCount || 0}</div>
              <div style={{ fontSize: 12 }}>Packet imported: {spine.promptPacket?.imported ? 'yes' : 'no'}</div>
            </div>
          </div>
        </>
      ) : null}
    </SectionCard>
  );
}
