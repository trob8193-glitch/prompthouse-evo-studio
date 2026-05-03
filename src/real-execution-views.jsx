import React, { useEffect, useMemo, useState } from 'react';

const BRIDGE_URL = 'http://localhost:3001';

const FALLBACK = {
  manifest: {
    file_count: 33,
    backend_python_compile_ok: true,
    mock_data: false,
    dummy_data: false,
    real_logic_included: [
      'SQLite persistence',
      'Connector registry',
      'Connector handshake',
      'OpenAI Responses API invoke path',
      'GitHub REST invoke path',
      'Generic REST invoke path',
      'Audit logs',
      'Proof cards',
      'Artifacts',
      'Manifest-to-Proof endpoint',
      'Flutter API client',
    ],
    blocked_until_user_environment: [
      'Flutter runtime verification',
      'FastAPI dependency install',
      'Live OpenAI call with user key',
      'Live GitHub call with user token',
      'Deployment and production hardening',
    ],
  },
  files: [
    'README.md',
    '00_NO_BULLSHIT/REALITY_BOUNDARY.md',
    '01_MASTER_PROMPTS/MASTER_REAL_EXECUTION_PROMPT.md',
    '01_MASTER_PROMPTS/PROMPTLINK_REAL_API_PROMPT.md',
    '01_MASTER_PROMPTS/50_REAL_MASTER_BUILD_PROMPTS.md',
    '02_CONTRACTS/promptlink_connector_manifest.schema.json',
    '02_CONTRACTS/promptlink_openapi.yaml',
    '03_EXECUTION/RUNBOOK.md',
    '04_PROOF_OS/PROOF_PROTOCOL.md',
    '05_RECOVERY/OMEGA_RECOVERY_PROMPT.md',
    'scaffolds/promptends_promptlink_backend/README.md',
    'scaffolds/promptshell_flutter/README.md',
  ],
};

const QUICK_FILES = [
  'README.md',
  '00_NO_BULLSHIT/REALITY_BOUNDARY.md',
  '03_EXECUTION/RUNBOOK.md',
  '04_PROOF_OS/PROOF_PROTOCOL.md',
  '02_CONTRACTS/promptlink_openapi.yaml',
  '02_CONTRACTS/promptlink_connector_manifest.schema.json',
  'scaffolds/promptends_promptlink_backend/app/main.py',
  'scaffolds/promptshell_flutter/lib/main.dart',
];

const SETUP_COMMANDS = [
  {
    title: 'Backend install',
    command: 'cd generated_apps/real_execution_buildkit/promptends_promptlink_backend && python -m venv .venv && .venv\\Scripts\\pip install -e ".[dev]"',
  },
  {
    title: 'Backend run',
    command: 'cd generated_apps/real_execution_buildkit/promptends_promptlink_backend && .venv\\Scripts\\uvicorn app.main:app --reload',
  },
  {
    title: 'Backend tests',
    command: 'cd generated_apps/real_execution_buildkit/promptends_promptlink_backend && .venv\\Scripts\\pytest',
  },
  {
    title: 'Flutter shell',
    command: 'cd generated_apps/real_execution_buildkit/promptshell_flutter && flutter create . && flutter pub get && flutter run -d chrome --dart-define=PROMPTENDS_BASE_URL=http://localhost:8000',
  },
];

function copyText(text, label, setCopied) {
  navigator.clipboard.writeText(text);
  setCopied(label);
  setTimeout(() => setCopied(''), 1400);
}

function groupFiles(files) {
  return files.reduce((groups, file) => {
    const group = file.startsWith('scaffolds/')
      ? file.split('/').slice(0, 2).join('/')
      : file.split('/')[0];
    groups[group] = groups[group] || [];
    groups[group].push(file);
    return groups;
  }, {});
}

export function RealExecutionView() {
  const [data, setData] = useState(FALLBACK);
  const [selectedFile, setSelectedFile] = useState(QUICK_FILES[0]);
  const [fileContent, setFileContent] = useState('');
  const [loadingFile, setLoadingFile] = useState(false);
  const [bridgeState, setBridgeState] = useState('checking');
  const [materializing, setMaterializing] = useState(false);
  const [materialized, setMaterialized] = useState(null);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    let mounted = true;
    fetch(`${BRIDGE_URL}/buildkit/manifest`)
      .then((res) => res.json())
      .then((payload) => {
        if (!mounted) return;
        if (payload.success) {
          setData(payload);
          setBridgeState('active');
          setSelectedFile(payload.files.includes(selectedFile) ? selectedFile : payload.files[0]);
        } else {
          setBridgeState('offline');
        }
      })
      .catch(() => setBridgeState('offline'));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!selectedFile) return;
    setLoadingFile(true);
    fetch(`${BRIDGE_URL}/buildkit/file?path=${encodeURIComponent(selectedFile)}`)
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) {
          setFileContent(payload.content);
        } else {
          setFileContent('Start the CLI bridge with `npm run bridge` to read this BuildKit file.');
        }
      })
      .catch(() => setFileContent('Start the CLI bridge with `npm run bridge` to read this BuildKit file.'))
      .finally(() => setLoadingFile(false));
  }, [selectedFile]);

  const manifest = data.manifest || FALLBACK.manifest;
  const files = data.files || FALLBACK.files;
  const groups = useMemo(() => groupFiles(files), [files]);
  const visibleFiles = QUICK_FILES.filter((file) => files.includes(file));

  const materialize = async () => {
    setMaterializing(true);
    setMaterialized(null);
    try {
      const response = await fetch(`${BRIDGE_URL}/buildkit/materialize`, { method: 'POST' });
      const payload = await response.json();
      setMaterialized(payload);
    } catch (error) {
      setMaterialized({ success: false, error: 'Bridge offline. Start it with `npm run bridge`.' });
    } finally {
      setMaterializing(false);
    }
  };

  return (
    <div className="flex-col animate-in">
      <div className="flex-between">
        <div>
          <div className="page-title">Real Execution BuildKit</div>
          <div className="page-subtitle">PromptEnds, PromptLink, PromptShell, contracts, proof protocol, and runbook from the imported ZIP.</div>
        </div>
        <span className={`badge ${bridgeState === 'active' ? 'badge-green' : 'badge-gold'}`}>
          {bridgeState === 'active' ? 'BRIDGE READING ZIP' : 'BRIDGE NEEDED'}
        </span>
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="card-title">Truth Boundary</div>
          <div className="card-body" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <div className="flex-col gap-8">
              <span className={`badge ${manifest.mock_data === false ? 'badge-green' : 'badge-red'}`}>mock data: {String(manifest.mock_data)}</span>
              <span className={`badge ${manifest.dummy_data === false ? 'badge-green' : 'badge-red'}`}>dummy data: {String(manifest.dummy_data)}</span>
              <span className={`badge ${manifest.backend_python_compile_ok ? 'badge-green' : 'badge-gold'}`}>backend compile: {String(manifest.backend_python_compile_ok)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Real Logic Included</div>
          <div className="card-body" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <div className="flex-col gap-8">
              {manifest.real_logic_included?.slice(0, 7).map((item) => (
                <div key={item} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>OK {item}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Blocked Until Local Setup</div>
          <div className="card-body" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <div className="flex-col gap-8">
              {manifest.blocked_until_user_environment?.map((item) => (
                <div key={item} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>BLOCKED {item}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ border: '1px solid var(--accent-green)' }}>
        <div className="card-header">
          <div className="flex-between">
            <div>
              <div className="card-title">Materialize Real Scaffolds</div>
              <div className="card-desc">Copies backend and Flutter scaffold files into generated_apps/real_execution_buildkit. Existing files are skipped.</div>
            </div>
            <button className="btn btn-primary" onClick={materialize} disabled={materializing || bridgeState !== 'active'}>
              {materializing ? 'Copying...' : 'Write BuildKit Scaffolds'}
            </button>
          </div>
        </div>
        {materialized && (
          <div className="card-body">
            <div className={`badge ${materialized.success ? 'badge-green' : 'badge-red'}`}>
              {materialized.success ? `Built ${materialized.copiedCount} files` : materialized.error}
            </div>
            {materialized.success && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {materialized.target} | proof: {materialized.proof}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid-builder">
        <div className="card">
          <div className="card-header">
            <div className="card-title">BuildKit Files</div>
            <div className="card-desc">{files.length} readable files excluding Python cache artifacts.</div>
          </div>
          <div className="card-body flex-col" style={{ maxHeight: 560, overflow: 'auto' }}>
            {Object.entries(groups).map(([group, groupFiles]) => (
              <div key={group}>
                <div className="field-label" style={{ marginTop: 8, marginBottom: 6 }}>{group}</div>
                {groupFiles.map((file) => (
                  <button
                    key={file}
                    className={`nav-item ${selectedFile === file ? 'active' : ''}`}
                    style={{ width: '100%', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    onClick={() => setSelectedFile(file)}
                  >
                    <span>{file.replace(`${group}/`, '')}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex-between">
              <div>
                <div className="card-title">File Preview</div>
                <div className="card-desc" style={{ fontFamily: 'var(--font-mono)' }}>{selectedFile}</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => copyText(fileContent, 'file', setCopied)}>
                {copied === 'file' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="tabs-bar" style={{ marginBottom: 12 }}>
              {visibleFiles.map((file) => (
                <button key={file} className={`tab-btn ${selectedFile === file ? 'active' : ''}`} onClick={() => setSelectedFile(file)}>
                  {file.split('/').pop().replace(/\.(md|yaml|json|py|dart)$/i, '')}
                </button>
              ))}
            </div>
            <div className="prompt-block" style={{ maxHeight: 520, fontSize: 11 }}>
              {loadingFile ? 'Loading BuildKit file...' : fileContent}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Run Commands</div>
          <div className="card-desc">Use after materializing the scaffolds and adding real secrets to the backend .env.</div>
        </div>
        <div className="card-body grid-2">
          {SETUP_COMMANDS.map((item) => (
            <div key={item.title} className="pack-card" style={{ padding: 14 }}>
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 800 }}>{item.title}</div>
                <button className="btn btn-secondary btn-sm" onClick={() => copyText(item.command, item.title, setCopied)}>
                  {copied === item.title ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="prompt-block" style={{ minHeight: 'unset', maxHeight: 82, fontSize: 11 }}>{item.command}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
