import React from 'react';
import { CheckCircle2, Palette, RefreshCw, RotateCcw, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';
import { safeFetchBridge } from '../config/bridge-config.js';

const card = {
  background: 'rgba(15,23,42,0.82)',
  border: '1px solid rgba(168,85,247,0.25)',
  borderRadius: 18,
  padding: 18,
  boxShadow: '0 18px 60px rgba(0,0,0,0.28)'
};

const button = {
  border: '1px solid rgba(216,180,254,0.35)',
  background: 'rgba(88,28,135,0.28)',
  color: '#f3e8ff',
  borderRadius: 12,
  padding: '10px 12px',
  fontSize: 12,
  fontWeight: 850,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8
};

function Badge({ value, tone = 'purple' }) {
  const colors = {
    green: ['rgba(22,163,74,0.18)', '#86efac', 'rgba(34,197,94,0.32)'],
    red: ['rgba(153,27,27,0.22)', '#fecaca', 'rgba(239,68,68,0.32)'],
    amber: ['rgba(180,83,9,0.18)', '#fde68a', 'rgba(245,158,11,0.32)'],
    purple: ['rgba(88,28,135,0.25)', '#e9d5ff', 'rgba(168,85,247,0.35)']
  };
  const c = colors[tone] || colors.purple;
  return <span style={{ background: c[0], color: c[1], border: `1px solid ${c[2]}`, borderRadius: 999, padding: '4px 9px', fontSize: 10, fontWeight: 900 }}>{value || 'UNKNOWN'}</span>;
}

function ColorChip({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#cbd5e1' }}>
      <span style={{ width: 18, height: 18, borderRadius: 6, background: color, border: '1px solid rgba(255,255,255,.18)' }} />
      <span>{label}</span>
    </div>
  );
}

export default function ThemeEvolutionDashboard() {
  const [status, setStatus] = React.useState(null);
  const [profiles, setProfiles] = React.useState([]);
  const [selectedThemeId, setSelectedThemeId] = React.useState('evoCore');
  const [page, setPage] = React.useState('proof-console');
  const [state, setState] = React.useState('normal');
  const [preference, setPreference] = React.useState('make proof and cost dashboards feel premium and clear');
  const [preview, setPreview] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const refresh = React.useCallback(async () => {
    const [statusRes, profilesRes] = await Promise.all([
      safeFetchBridge('/api/theme-evolution/status'),
      safeFetchBridge('/api/theme-evolution/profiles')
    ]);
    if (statusRes.ok) {
      setStatus(statusRes.data.status || null);
      const active = statusRes.data.status?.activeThemeId;
      if (active) setSelectedThemeId(active);
    }
    if (profilesRes.ok) setProfiles(profilesRes.data.profiles || []);
  }, []);

  React.useEffect(() => { refresh(); }, [refresh]);

  const post = async (path, body = {}) => {
    setBusy(true);
    setMessage('Running...');
    try {
      const result = await safeFetchBridge(path, { method: 'POST', body: JSON.stringify(body) });
      if (!result.ok) {
        setMessage(`ERROR: ${result.error}`);
        return null;
      }
      setMessage('PASS');
      await refresh();
      return result.data;
    } finally {
      setBusy(false);
    }
  };

  const suggest = async () => {
    const data = await post('/api/theme-evolution/suggest', { page, state, preference });
    if (data?.suggestion) {
      setPreview(data.suggestion);
      setSelectedThemeId(data.suggestion.themeId);
    }
  };

  const runPreview = async () => {
    const data = await post('/api/theme-evolution/preview', { themeId: selectedThemeId });
    if (data?.preview) setPreview(data.preview);
  };

  const approve = async () => post('/api/theme-evolution/approve', { themeId: selectedThemeId });
  const applyTheme = async () => post('/api/theme-evolution/apply', { themeId: selectedThemeId });
  const rollback = async () => post('/api/theme-evolution/rollback', {});

  const active = status?.activeProfile || profiles.find(item => item.id === selectedThemeId) || null;
  const receipts = status?.receipts || [];
  const activePalette = active?.palette || {};
  const previewPalette = preview?.profile?.palette || activePalette;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, color: '#e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 950, margin: 0, letterSpacing: '-.04em' }}>Theme Evolution Command</h1>
          <p style={{ margin: '8px 0 0', color: '#94a3b8', maxWidth: 820 }}>Preview, approve, apply, and roll back colors, motion, density, and mode-based studio themes. It evolves the outfit, not the payment buttons. Civilization gets one boundary. 🎨</p>
        </div>
        <button style={button} onClick={refresh} disabled={busy}><RefreshCw size={15} /> Refresh</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
        <div style={card}><div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 900 }}>ACTIVE THEME</div><div style={{ marginTop: 10 }}><Badge value={status?.activeThemeId || 'evoCore'} /></div></div>
        <div style={card}><div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 900 }}>APPROVED THEME</div><div style={{ marginTop: 10 }}><Badge value={status?.approvedThemeId || 'evoCore'} tone="green" /></div></div>
        <div style={card}><div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 900 }}>PROFILES</div><div style={{ marginTop: 10, fontSize: 24, fontWeight: 950 }}>{profiles.length}</div></div>
        <div style={card}><div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 900 }}>RECEIPTS</div><div style={{ marginTop: 10, fontSize: 24, fontWeight: 950 }}>{receipts.length}</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 16 }}>
        <div style={card}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Suggest or Preview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
            <label style={{ fontSize: 12, color: '#cbd5e1' }}>Page
              <input value={page} onChange={(e) => setPage(e.target.value)} style={{ marginTop: 6, width: '100%', background: '#020617', color: '#e2e8f0', border: '1px solid #1e293b', borderRadius: 10, padding: 10 }} />
            </label>
            <label style={{ fontSize: 12, color: '#cbd5e1' }}>State
              <input value={state} onChange={(e) => setState(e.target.value)} style={{ marginTop: 6, width: '100%', background: '#020617', color: '#e2e8f0', border: '1px solid #1e293b', borderRadius: 10, padding: 10 }} />
            </label>
          </div>
          <label style={{ display: 'block', marginTop: 10, fontSize: 12, color: '#cbd5e1' }}>Preference
            <textarea value={preference} onChange={(e) => setPreference(e.target.value)} style={{ marginTop: 6, width: '100%', minHeight: 72, background: '#020617', color: '#e2e8f0', border: '1px solid #1e293b', borderRadius: 10, padding: 10 }} />
          </label>
          <label style={{ display: 'block', marginTop: 10, fontSize: 12, color: '#cbd5e1' }}>Theme Profile
            <select value={selectedThemeId} onChange={(e) => setSelectedThemeId(e.target.value)} style={{ marginTop: 6, width: '100%', background: '#020617', color: '#e2e8f0', border: '1px solid #1e293b', borderRadius: 10, padding: 10 }}>
              {profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
            </select>
          </label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
            <button style={button} disabled={busy} onClick={suggest}><Wand2 size={15} /> Suggest</button>
            <button style={button} disabled={busy} onClick={runPreview}><Sparkles size={15} /> Preview</button>
            <button style={button} disabled={busy} onClick={approve}><ShieldCheck size={15} /> Approve</button>
            <button style={button} disabled={busy} onClick={applyTheme}><CheckCircle2 size={15} /> Apply</button>
            <button style={{ ...button, background: 'rgba(127,29,29,.22)', borderColor: 'rgba(248,113,113,.35)', color: '#fecaca' }} disabled={busy} onClick={rollback}><RotateCcw size={15} /> Rollback</button>
          </div>
          {message && <div style={{ marginTop: 12, color: message.startsWith('ERROR') ? '#fecaca' : '#86efac', fontSize: 12, fontWeight: 850 }}>{message}</div>}
        </div>

        <div style={{ ...card, background: `linear-gradient(145deg, ${previewPalette.background || '#020617'}, ${previewPalette.surfaceStrong || '#111827'})` }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: previewPalette.text || '#f8fafc' }}>Preview Surface</h2>
          <p style={{ color: previewPalette.muted || '#94a3b8', fontSize: 12, lineHeight: 1.6 }}>Theme: {preview?.profile?.name || active?.name || 'Evo Core'} · Scope: {preview?.profile?.scope || active?.scope || 'global'}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
            <ColorChip color={previewPalette.primary} label="Primary" />
            <ColorChip color={previewPalette.secondary} label="Secondary" />
            <ColorChip color={previewPalette.accent} label="Accent" />
            <ColorChip color={previewPalette.warning} label="Warning" />
            <ColorChip color={previewPalette.danger} label="Danger" />
            <ColorChip color={previewPalette.surface} label="Surface" />
          </div>
          {preview && <div style={{ marginTop: 14, background: 'rgba(2,6,23,.72)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><Badge value={preview.truthState} tone={preview.truthState === 'BLOCKED' ? 'red' : 'green'} /><Badge value={preview.requiresApproval ? 'APPROVAL REQUIRED' : 'AUTO SAFE'} tone="amber" /></div>
            <div style={{ marginTop: 8, color: '#cbd5e1', fontSize: 12 }}>Contrast: {preview.accessibility?.passed ? 'passed' : 'blocked'} · Motion: {preview.performance?.passed ? 'passed' : 'blocked'}</div>
          </div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={card}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Theme Profiles</h2>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {profiles.map(profile => <div key={profile.id} style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: 12, padding: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><b style={{ fontSize: 12 }}>{profile.name}</b><Badge value={profile.scope} /></div><div style={{ marginTop: 6, color: '#94a3b8', fontSize: 12 }}>Density: {profile.density} · Motion: {profile.motion?.intensity}</div></div>)}
          </div>
        </div>

        <div style={card}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Theme Receipts</h2>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {receipts.length === 0 && <p style={{ color: '#64748b', fontSize: 12 }}>No theme receipts yet.</p>}
            {receipts.slice(0, 10).map(item => <div key={item.id} style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: 12, padding: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><b style={{ fontSize: 12 }}>{item.action}</b><Badge value={item.truthState} tone={item.truthState === 'BLOCKED' ? 'red' : 'green'} /></div><div style={{ marginTop: 6, color: '#94a3b8', fontSize: 12 }}>{item.themeId || item.fromThemeId || 'theme'} · {item.createdAt}</div></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
