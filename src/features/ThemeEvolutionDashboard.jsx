import React from 'react';
import { CheckCircle2, Palette, RefreshCw, RotateCcw, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';
import { safeFetchBridge } from '../config/bridge-config.js';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';
const card = {
  background: 'rgba(12,12,18,0.7)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 20,
  padding: 24,
  boxShadow: '0 0 30px rgba(0,240,255,0.03)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
};

const button = {
  border: '1px solid rgba(0,240,255,0.3)',
  background: 'rgba(0,240,255,0.1)',
  color: '#00f0ff',
  borderRadius: 12,
  padding: '10px 16px',
  fontSize: 11,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  transition: 'all 0.3s ease',
  boxShadow: '0 0 15px rgba(0,240,255,0.1)',
};

function Badge({ value, tone = 'purple' }) {
  const colors = {
    green: ['rgba(0,255,136,0.1)', '#00ff88', 'rgba(0,255,136,0.3)', '0 0 10px rgba(0,255,136,0.4)'],
    red: ['rgba(255,51,102,0.1)', '#ff3366', 'rgba(255,51,102,0.3)', '0 0 10px rgba(255,51,102,0.4)'],
    amber: ['rgba(255,170,0,0.1)', '#ffaa00', 'rgba(255,170,0,0.3)', '0 0 10px rgba(255,170,0,0.4)'],
    purple: ['rgba(138,43,226,0.1)', '#8a2be2', 'rgba(138,43,226,0.3)', '0 0 10px rgba(138,43,226,0.4)']
  };
  const c = colors[tone] || colors.purple;
  return <span style={{ background: c[0], color: c[1], border: `1px solid ${c[2]}`, borderRadius: 999, padding: '4px 10px', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: c[3] }}>{value || 'UNKNOWN'}</span>;
}

function ColorChip({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: '#b4b4c4', fontWeight: 600 }}>
      <span style={{ width: 20, height: 20, borderRadius: 6, background: color, border: '1px solid rgba(255,255,255,.1)', boxShadow: `0 0 10px ${color}80` }} />
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
    setMessage('Engaging Matrix...');
    try {
      const result = await safeFetchBridge(path, { method: 'POST', body: JSON.stringify(body) });
      if (!result.ok) {
        setMessage(`ERROR: ${result.error}`);
        return null;
      }
      setMessage('SYNC ESTABLISHED');
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
    <IDEPageLayout
      title={
        <>
          <Palette color="#8a2be2" size={16} style={{ filter: 'drop-shadow(0 0 10px rgba(138,43,226,0.6))' }} />
          Theme Evolution Matrix
        </>
      }
      description="Autonomous Singularity protocol for visual structure. Command the AI to dynamically adjust palettes, motion curves, and layout densities across the studio."
      actions={
        <button style={button} onClick={refresh} disabled={busy} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,240,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,240,255,0.1)'}>
          <RefreshCw size={14} className={busy ? 'animate-spin' : ''} /> Refresh Vector
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, color: '#ffffff' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
        <div style={card}><div style={{ color: '#00f0ff', fontSize: 10, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Active Matrix</div><div style={{ marginTop: 12 }}><Badge value={status?.activeThemeId || 'evoCore'} tone="purple" /></div></div>
        <div style={card}><div style={{ color: '#00ff88', fontSize: 10, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Verified Vector</div><div style={{ marginTop: 12 }}><Badge value={status?.approvedThemeId || 'evoCore'} tone="green" /></div></div>
        <div style={card}><div style={{ color: '#b4b4c4', fontSize: 10, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Available Profiles</div><div style={{ marginTop: 12, fontSize: 28, fontWeight: 900, textShadow: '0 0 15px rgba(255,255,255,0.2)' }}>{profiles.length}</div></div>
        <div style={card}><div style={{ color: '#b4b4c4', fontSize: 10, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Evolution Ledger</div><div style={{ marginTop: 12, fontSize: 28, fontWeight: 900, textShadow: '0 0 15px rgba(255,255,255,0.2)' }}>{receipts.length}</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{...card, background: 'rgba(5,5,8,0.8)'}}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#00f0ff', display: 'flex', alignItems: 'center', gap: 8 }}><Wand2 size={16} /> Autonomous Suggestions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
            <label style={{ fontSize: 10, color: '#b4b4c4', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Target Surface
              <input value={page} onChange={(e) => setPage(e.target.value)} style={{ marginTop: 8, width: '100%', background: '#0a0a10', color: '#ffffff', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 12, padding: 12, fontSize: 13, outline: 'none' }} />
            </label>
            <label style={{ fontSize: 10, color: '#b4b4c4', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Context State
              <input value={state} onChange={(e) => setState(e.target.value)} style={{ marginTop: 8, width: '100%', background: '#0a0a10', color: '#ffffff', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 12, padding: 12, fontSize: 13, outline: 'none' }} />
            </label>
          </div>
          <label style={{ display: 'block', marginTop: 16, fontSize: 10, color: '#b4b4c4', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Directive
            <textarea value={preference} onChange={(e) => setPreference(e.target.value)} style={{ marginTop: 8, width: '100%', minHeight: 80, background: '#0a0a10', color: '#ffffff', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 12, padding: 12, fontSize: 13, outline: 'none', resize: 'vertical' }} />
          </label>
          <label style={{ display: 'block', marginTop: 16, fontSize: 10, color: '#b4b4c4', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Force Profile Override
            <select value={selectedThemeId} onChange={(e) => setSelectedThemeId(e.target.value)} style={{ marginTop: 8, width: '100%', background: '#0a0a10', color: '#ffffff', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 12, padding: 12, fontSize: 13, outline: 'none' }}>
              {profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
            </select>
          </label>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
            <button style={{...button, flex: 1, justifyContent: 'center'}} disabled={busy} onClick={suggest}><Wand2 size={14} /> Suggest</button>
            <button style={{...button, flex: 1, justifyContent: 'center'}} disabled={busy} onClick={runPreview}><Sparkles size={14} /> Preview</button>
            <button style={{...button, flex: 1, justifyContent: 'center'}} disabled={busy} onClick={approve}><ShieldCheck size={14} /> Approve</button>
            <button style={{...button, flex: 1, justifyContent: 'center', background: 'rgba(0,255,136,0.1)', borderColor: 'rgba(0,255,136,0.3)', color: '#00ff88', boxShadow: '0 0 15px rgba(0,255,136,0.1)'}} disabled={busy} onClick={applyTheme}><CheckCircle2 size={14} /> Execute</button>
            <button style={{...button, flex: 1, justifyContent: 'center', background: 'rgba(255,51,102,0.1)', borderColor: 'rgba(255,51,102,0.3)', color: '#ff3366', boxShadow: '0 0 15px rgba(255,51,102,0.1)'}} disabled={busy} onClick={rollback}><RotateCcw size={14} /> Rollback</button>
          </div>
          {message && <div style={{ marginTop: 16, color: message.startsWith('ERROR') ? '#ff3366' : '#00ff88', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>{message}</div>}
        </div>

        <div style={{ ...card, background: `linear-gradient(135deg, ${previewPalette.background || '#020205'}, ${previewPalette.surfaceStrong || '#0a0a10'})`, border: `1px solid ${previewPalette.primary || '#00f0ff'}40`, boxShadow: `0 0 40px ${previewPalette.primary || '#00f0ff'}10` }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: previewPalette.text || '#ffffff' }}>Holographic Preview</h2>
          <p style={{ color: previewPalette.muted || '#b4b4c4', fontSize: 12, lineHeight: 1.6, marginTop: 8 }}>Matrix: {preview?.profile?.name || active?.name || 'Singularity Core'} · Domain: {preview?.profile?.scope || active?.scope || 'Global'}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
            <ColorChip color={previewPalette.primary || '#00f0ff'} label="Primary Resonance" />
            <ColorChip color={previewPalette.secondary || '#8a2be2'} label="Secondary Tone" />
            <ColorChip color={previewPalette.accent || '#00ff88'} label="Accent Spark" />
            <ColorChip color={previewPalette.warning || '#ffaa00'} label="Warning Node" />
            <ColorChip color={previewPalette.danger || '#ff3366'} label="Critical Error" />
            <ColorChip color={previewPalette.surface || '#12121a'} label="Base Surface" />
          </div>
          {preview && <div style={{ marginTop: 24, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <Badge value={preview.truthState} tone={preview.truthState === 'BLOCKED' ? 'red' : 'green'} />
              <Badge value={preview.requiresApproval ? 'HUMAN OVERRIDE REQUIRED' : 'AUTONOMOUS EXECUTION SAFE'} tone={preview.requiresApproval ? 'amber' : 'purple'} />
            </div>
            <div style={{ marginTop: 12, color: '#b4b4c4', fontSize: 11, fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
              <span>Contrast Matrix: <span style={{color: preview.accessibility?.passed ? '#00ff88' : '#ff3366'}}>{preview.accessibility?.passed ? 'VERIFIED' : 'FAILED'}</span></span>
              <span>Motion Curves: <span style={{color: preview.performance?.passed ? '#00ff88' : '#ff3366'}}>{preview.performance?.passed ? 'OPTIMIZED' : 'DEGRADED'}</span></span>
            </div>
          </div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={card}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b4b4c4' }}>Available Matrices</h2>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {profiles.map(profile => (
              <div key={profile.id} style={{ background: '#050508', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 16, transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,240,255,0.3)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                  <b style={{ fontSize: 13, color: '#ffffff' }}>{profile.name}</b>
                  <Badge value={profile.scope} tone="purple" />
                </div>
                <div style={{ marginTop: 8, color: '#737385', fontSize: 11, fontWeight: 600, display: 'flex', gap: 12 }}>
                  <span>Density: <span style={{color: '#b4b4c4'}}>{profile.density}</span></span>
                  <span>Motion: <span style={{color: '#b4b4c4'}}>{profile.motion?.intensity}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b4b4c4' }}>Execution Ledger</h2>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {receipts.length === 0 && <div style={{ color: '#4a4a5e', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: 20, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: 14 }}>No modifications logged.</div>}
            {receipts.slice(0, 10).map(item => (
              <div key={item.id} style={{ background: '#050508', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                  <b style={{ fontSize: 12, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.action}</b>
                  <Badge value={item.truthState} tone={item.truthState === 'BLOCKED' ? 'red' : 'green'} />
                </div>
                <div style={{ marginTop: 8, color: '#737385', fontSize: 11, fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.themeId || item.fromThemeId || 'MATRIX ID'}</span>
                  <span>{item.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </IDEPageLayout>
  );
}
