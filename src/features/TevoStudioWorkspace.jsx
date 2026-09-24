import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import {
  Bot, Box, Code2, Play, TestTube2, Bug, GitBranch,
  BrainCircuit, Sparkles, ShieldCheck, Activity, TerminalSquare,
  FolderTree, Settings2, Rocket, Pause, CheckCircle2
} from 'lucide-react';
import { useSovereignStore } from '../store.js';
import { safeFetchBridge } from '../config/bridge-config.js';

const panel = {
  background: 'rgba(8, 12, 20, 0.88)',
  border: '1px solid rgba(72, 190, 255, 0.16)',
  borderRadius: 14,
  boxShadow: '0 18px 50px rgba(0,0,0,.28)',
};

function ScenePreview() {
  return (
    <Canvas camera={{ position: [5, 4, 7], fov: 45 }} style={{ background: '#050810' }}>
      <PerspectiveCamera makeDefault position={[5, 4, 7]} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[4, 7, 5]} intensity={2} />
      <Grid args={[20, 20]} cellSize={0.5} sectionSize={2} fadeDistance={22} />
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[2.4, 2, 2.4]} />
        <meshStandardMaterial metalness={0.55} roughness={0.3} color="#18283c" />
      </mesh>
      <mesh position={[0, 2.3, 0]}>
        <sphereGeometry args={[0.45, 32, 20]} />
        <meshStandardMaterial emissive="#16c7ff" emissiveIntensity={2} color="#16384a" />
      </mesh>
      <OrbitControls makeDefault />
    </Canvas>
  );
}

function Pill({ children, active }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 8px',
      borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: .6,
      color: active ? '#baf3ff' : '#8997ab',
      background: active ? 'rgba(22,199,255,.1)' : 'rgba(255,255,255,.04)',
      border: '1px solid rgba(255,255,255,.08)'
    }}>{children}</span>
  );
}

export default function TevoStudioWorkspace() {
  const sendChatMessage = useSovereignStore((s) => s.sendChatMessage);
  const chatMessages = useSovereignStore((s) => s.chatMessages);
  const chatLoading = useSovereignStore((s) => s.chatLoading);
  const bridgeStatus = useSovereignStore((s) => s.bridgeStatus);
  const fetchBridgeStatus = useSovereignStore((s) => s.fetchBridgeStatus);
  const [mission, setMission] = React.useState('Build a production-ready 3D application from this workspace.');
  const [code, setCode] = React.useState('// TEVO workspace\n// Select a mission and ask the agent to evolve the project.');
  const [activeTab, setActiveTab] = React.useState('code');
  const [autonomy, setAutonomy] = React.useState('ask');
  const [running, setRunning] = React.useState(false);
  const [evolution, setEvolution] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('tevo_user_profile') || 'null') || { cycles: 0, preferences: {}, skills: [] }; }
    catch { return { cycles: 0, preferences: {}, skills: [] }; }
  });

  const [evolutionStatus, setEvolutionStatus] = React.useState(null);

  const refreshEvolutionStatus = React.useCallback(async () => {
    try {
      const result = await safeFetchBridge('/api/evolution/status', { timeout: 5000 });
      if (result.ok) setEvolutionStatus(result.data);
    } catch {}
  }, []);

  React.useEffect(() => { fetchBridgeStatus(); refreshEvolutionStatus(); }, [fetchBridgeStatus, refreshEvolutionStatus]);

  const runMission = async () => {
    setRunning(true);
    const result = await sendChatMessage(
      `TEVO AUTONOMOUS DEVELOPMENT MISSION\nMission: ${mission}\nAutonomy boundary: ${autonomy}\nContext: desktop IDE, React/Three.js, production-only, no mocks or fake completion.\nReturn: implementation plan, files to change, code-level actions, validation commands, and explicit proof requirements. Do not claim an action happened unless it produced evidence.`
    );
    if (result?.content) {
      setCode((prev) => `${prev}\n\n/* AGENT MISSION RESULT */\n${result.content}`);
      const next = { ...evolution, cycles: evolution.cycles + 1, lastMission: mission, lastRun: new Date().toISOString() };
      setEvolution(next);
      localStorage.setItem('tevo_user_profile', JSON.stringify(next));
    }
    await refreshEvolutionStatus();
    setRunning(false);
  };

  const tabs = [
    ['code', <Code2 size={14} />, 'Code'],
    ['3d', <Box size={14} />, '3D View'],
    ['tests', <TestTube2 size={14} />, 'Tests'],
    ['evolution', <BrainCircuit size={14} />, 'Evolution'],
  ];

  return (
    <div style={{ height: '100%', minHeight: 680, display: 'grid', gridTemplateRows: 'auto auto 1fr', gap: 12, color: '#e8f1ff' }}>
      <header style={{ ...panel, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#11c7ff,#7c4dff)' }}>
            <Sparkles size={20} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 950, letterSpacing: 1 }}>TEVO STUDIO</div>
            <div style={{ fontSize: 10, color: '#8190a6', letterSpacing: 1.4 }}>ADAPTIVE AUTONOMOUS DEVELOPMENT ENVIRONMENT</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Pill active><Activity size={11} /> {bridgeStatus === 'connected' ? 'BRIDGE CONNECTED' : 'BRIDGE CHECKING'}</Pill>
          <Pill active><ShieldCheck size={11} /> PROOF-GATED</Pill>
          <Pill><GitBranch size={11} /> LOCAL-FIRST</Pill>
        </div>
      </header>

      <section style={{ ...panel, padding: 12, display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 9, color: '#718198', fontWeight: 900, letterSpacing: 1.2, marginBottom: 5 }}>AUTONOMOUS MISSION</div>
          <input value={mission} onChange={(e) => setMission(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 0, outline: 0, color: '#edf6ff', fontSize: 13 }} />
        </div>
        <select value={autonomy} onChange={(e) => setAutonomy(e.target.value)}
          style={{ background: '#0c1420', color: '#cfe8ff', border: '1px solid #20344a', borderRadius: 8, padding: '9px 10px', fontSize: 11 }}>
          <option value="ask">Ask before consequential actions</option>
          <option value="session">Session-scoped autonomy</option>
          <option value="manual">Manual execution only</option>
        </select>
        <button onClick={runMission} disabled={running}
          style={{ border: 0, borderRadius: 9, padding: '10px 14px', fontWeight: 900, color: '#001018', background: '#49d9ff', cursor: running ? 'wait' : 'pointer', display: 'flex', gap: 7, alignItems: 'center' }}>
          {running ? <Pause size={14} /> : <Rocket size={14} />} {running ? 'EVOLVING…' : 'RUN MISSION'}
        </button>
      </section>

      <main style={{ display: 'grid', gridTemplateColumns: '220px minmax(0,1fr) 340px', gap: 12, minHeight: 0 }}>
        <aside style={{ ...panel, padding: 10, overflow: 'auto' }}>
          <div style={{ fontSize: 9, color: '#718198', fontWeight: 900, letterSpacing: 1.2, padding: '8px 8px 10px' }}>PROJECT</div>
          {['src/', 'components/', 'features/', 'core/', 'tests/', 'assets/'].map((x, i) => (
            <div key={x} style={{ padding: '9px 8px', borderRadius: 7, color: i === 0 ? '#dff7ff' : '#8795aa', background: i === 0 ? 'rgba(73,217,255,.07)' : 'transparent', fontSize: 11, display: 'flex', gap: 8 }}>
              <FolderTree size={13} /> {x}
            </div>
          ))}
          <div style={{ marginTop: 18, padding: 10, borderRadius: 10, background: 'rgba(124,77,255,.08)', border: '1px solid rgba(124,77,255,.18)' }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: '#c5b4ff' }}>USER EVOLUTION</div>
            <div style={{ marginTop: 6, fontSize: 11, color: '#91a0b5' }}>Cycles: <b style={{ color: '#e8f1ff' }}>{evolution.cycles}</b></div>
            <div style={{ fontSize: 11, color: '#91a0b5' }}>Adaptive profile: <b style={{ color: '#e8f1ff' }}>ACTIVE</b></div>
            <div style={{ fontSize: 11, color: '#91a0b5' }}>Verified promotions: <b style={{ color: '#e8f1ff' }}>{evolutionStatus?.evidence?.promotions ?? 0}</b></div>
            <div style={{ fontSize: 11, color: '#91a0b5' }}>Regression defenses: <b style={{ color: '#e8f1ff' }}>{evolutionStatus?.evidence?.regressionDefenses ?? 0}</b></div>
          </div>
        </aside>

        <section style={{ ...panel, minWidth: 0, display: 'grid', gridTemplateRows: '42px 1fr', overflow: 'hidden' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
            {tabs.map(([id, icon, label]) => (
              <button key={id} onClick={() => setActiveTab(id)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 11px', borderRadius: 7, border: 0, color: activeTab === id ? '#dff8ff' : '#748197', background: activeTab === id ? 'rgba(73,217,255,.1)' : 'transparent', cursor: 'pointer', fontSize: 11 }}>
                {icon}{label}
              </button>
            ))}
          </nav>
          <div style={{ minHeight: 0, overflow: 'hidden' }}>
            {activeTab === '3d' ? <ScenePreview /> : activeTab === 'code' ? (
              <textarea value={code} onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                style={{ width: '100%', height: '100%', resize: 'none', border: 0, outline: 0, padding: 18, background: '#050810', color: '#cfe7ff', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12, lineHeight: 1.6 }} />
            ) : activeTab === 'tests' ? (
              <div style={{ padding: 18 }}>
                <div style={{ display: 'flex', gap: 9, alignItems: 'center', marginBottom: 14 }}><TestTube2 size={17} /> Validation pipeline</div>
                {['Typecheck', 'Unit tests', 'Build', '3D asset validation', 'Runtime smoke test', 'Proof receipt'].map((x) => (
                  <div key={x} style={{ padding: 12, marginBottom: 7, ...panel, background: 'rgba(255,255,255,.02)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11 }}>{x}</span><span style={{ color: '#8290a4', fontSize: 10 }}>READY TO RUN</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 18, overflow: 'auto', height: '100%' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: 15 }}>Adaptive Evolution Loop</h3>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 10 }}>
                  <Pill active>{evolutionStatus?.stage?.toUpperCase() || 'STATUS UNKNOWN'}</Pill>
                  <Pill>Cycles: {evolutionStatus?.cycleCount ?? evolution.cycles}</Pill>
                  <Pill>Lessons: {evolutionStatus?.evidence?.lessons ?? 0}</Pill>
                </div>
                <p style={{ color: '#8b99ad', fontSize: 12, lineHeight: 1.6 }}>TEVO records project interactions and uses them as bounded context for future planning. Evolution is evidence-driven: observe → propose → validate → retain.</p>
                <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
                  {['Observe user workflow', 'Infer reusable preferences', 'Generate candidate improvement', 'Validate against tests and project constraints', 'Persist only verified improvement'].map((x, i) => (
                    <div key={x} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 11, borderRadius: 9, background: 'rgba(73,217,255,.045)', border: '1px solid rgba(73,217,255,.09)' }}>
                      <span style={{ width: 23, height: 23, borderRadius: 7, display: 'grid', placeItems: 'center', background: 'rgba(73,217,255,.1)', color: '#49d9ff', fontSize: 10, fontWeight: 900 }}>{i + 1}</span>{x}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <aside style={{ ...panel, display: 'grid', gridTemplateRows: '48px 1fr auto', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ padding: '13px 14px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bot size={16} color="#49d9ff" /><b style={{ fontSize: 12 }}>TEVO CODING AGENT</b>
          </div>
          <div style={{ padding: 12, overflow: 'auto' }}>
            {chatMessages.slice(-8).map((m) => (
              <div key={m.id} style={{ marginBottom: 10, padding: 10, borderRadius: 9, background: m.role === 'user' ? 'rgba(73,217,255,.06)' : 'rgba(255,255,255,.035)', border: '1px solid rgba(255,255,255,.06)', fontSize: 11, lineHeight: 1.55 }}>
                <div style={{ fontSize: 9, color: '#708096', marginBottom: 4, fontWeight: 900 }}>{m.role.toUpperCase()}</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
              </div>
            ))}
            {chatLoading && <div style={{ padding: 10, color: '#49d9ff', fontSize: 11 }}>Agent is reasoning through the mission…</div>}
          </div>
          <div style={{ padding: 10, borderTop: '1px solid rgba(255,255,255,.07)', display: 'flex', gap: 8 }}>
            <button onClick={() => setActiveTab('code')} style={{ flex: 1, border: '1px solid #20344a', background: '#0b121d', color: '#b8c9dc', borderRadius: 8, padding: 9, fontSize: 10 }}><TerminalSquare size={12} /> Open editor</button>
            <button onClick={() => setActiveTab('tests')} style={{ flex: 1, border: '1px solid #20344a', background: '#0b121d', color: '#b8c9dc', borderRadius: 8, padding: 9, fontSize: 10 }}><TestTube2 size={12} /> Validate</button>
          </div>
        </aside>
      </main>
    </div>
  );
}
