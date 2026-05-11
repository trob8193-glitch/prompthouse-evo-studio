import React, { useMemo, useState } from "react";
import { LIVEFORGE_TEMPLATES } from "../../lib/liveforge/liveForgeTemplates";
import { createProofReceipt, promptBridgeCall } from "../../lib/liveforge/promptBridgeClient";

const deviceWidths = {
  mobile: "390px",
  tablet: "768px",
  desktop: "100%"
};

function now() {
  return new Date().toISOString();
}

function buildSrcDoc(draft) {
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>html,body{margin:0;min-height:100%;height:100%}${draft.css}</style></head><body>${draft.html}<script>try{${draft.js || ""}}catch(error){document.body.insertAdjacentHTML('beforeend','<pre style="color:#ff6b6b;background:#111;padding:12px;">JS Error: '+error.message+'</pre>')}</script></body></html>`;
}

export function EvoLiveForgePreview({ promptBridgeBaseUrl = "http://127.0.0.1:3001" }) {
  const first = LIVEFORGE_TEMPLATES[0];
  const [selectedTemplateId, setSelectedTemplateId] = useState(first.id);
  const [instruction, setInstruction] = useState("");
  const [output, setOutput] = useState("LiveForge ready.");
  const [draft, setDraft] = useState({
    id: `draft_${Date.now()}`,
    templateId: first.id,
    name: first.name,
    html: first.html,
    css: first.css,
    js: first.js ?? "",
    device: "desktop",
    status: "draft",
    createdAt: now(),
    updatedAt: now()
  });

  const selectedTemplate = LIVEFORGE_TEMPLATES.find((item) => item.id === selectedTemplateId) ?? first;
  const srcDoc = useMemo(() => buildSrcDoc(draft), [draft]);

  function chooseTemplate(id) {
    const template = LIVEFORGE_TEMPLATES.find((item) => item.id === id) ?? first;
    setSelectedTemplateId(id);
    setDraft({
      id: `draft_${Date.now()}`,
      templateId: template.id,
      name: template.name,
      html: template.html,
      css: template.css,
      js: template.js ?? "",
      device: draft.device,
      status: "draft",
      createdAt: now(),
      updatedAt: now()
    });
    setOutput(`Template loaded: ${template.name}`);
  }

  function patchDraft(partial) {
    setDraft((current) => ({ ...current, ...partial, updatedAt: now(), status: "previewing" }));
  }

  async function sendToPromptBridge(action) {
    setOutput(`PromptBridge request: ${action}...`);
    try {
      const result = await promptBridgeCall(
        { action, draft, userInstruction: instruction || selectedTemplate.promptHint, liveRun: true },
        { baseUrl: promptBridgeBaseUrl }
      );
      if (result.draft) setDraft(result.draft);
      setOutput(JSON.stringify(result, null, 2));
    } catch (error) {
      setOutput(`Blocked or failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  function localProofReceipt() {
    setOutput(JSON.stringify(createProofReceipt("local_live_preview", draft.id), null, 2));
  }

  return (
    <div style={styles.shell}>
      <section style={styles.header}>
        <div>
          <div style={styles.kicker}>PromptHouse Evo · Live Maker Preview</div>
          <h1 style={styles.h1}>Build apps with live editing.</h1>
          <p style={styles.p}>Choose a template, edit live, preview instantly, then send the draft to the App Connector, Build Line, Safe Box, or App Builder.</p>
        </div>
        <div style={styles.status}>{draft.status}</div>
      </section>

      <section style={styles.toolbar}>
        <label style={styles.label}>Template
          <select style={styles.select} value={selectedTemplateId} onChange={(event) => chooseTemplate(event.target.value)}>
            {LIVEFORGE_TEMPLATES.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
          </select>
        </label>
        <label style={styles.label}>Device
          <select style={styles.select} value={draft.device} onChange={(event) => patchDraft({ device: event.target.value })}>
            <option value="mobile">Mobile</option><option value="tablet">Tablet</option><option value="desktop">Desktop</option>
          </select>
        </label>
        <button style={styles.button} onClick={() => sendToPromptBridge("improve_preview")}>Ask Evo LM</button>
        <button style={styles.button} onClick={() => sendToPromptBridge("export_artifact")}>Export</button>
        <button style={styles.button} onClick={() => sendToPromptBridge("send_to_forgerail")}>ForgeRail</button>
        <button style={styles.button} onClick={localProofReceipt}>Local Proof</button>
      </section>

      <section style={styles.main}>
        <div style={styles.editor}>
          <label style={styles.label}>Evo instruction</label>
          <textarea style={styles.smallTextarea} value={instruction} onChange={(event) => setInstruction(event.target.value)} placeholder={selectedTemplate.promptHint} />
          <label style={styles.label}>HTML</label>
          <textarea style={styles.textarea} value={draft.html} onChange={(event) => patchDraft({ html: event.target.value })} />
          <label style={styles.label}>CSS</label>
          <textarea style={styles.textarea} value={draft.css} onChange={(event) => patchDraft({ css: event.target.value })} />
          <label style={styles.label}>JS sandbox script</label>
          <textarea style={styles.smallTextarea} value={draft.js} onChange={(event) => patchDraft({ js: event.target.value })} />
        </div>
        <div style={styles.previewWrap}>
          <div style={styles.previewBar}><strong>Live Preview</strong><span>{draft.name}</span></div>
          <div style={styles.deviceFrame}>
            <iframe title="PromptHouse Evo Live Maker Preview" sandbox="allow-scripts" srcDoc={srcDoc} style={{ ...styles.iframe, width: deviceWidths[draft.device] }} />
          </div>
          <pre style={styles.output}>{output}</pre>
        </div>
      </section>

      <section style={styles.boundary}><strong>Honest Truth Boundary:</strong> preview renders sandboxed UI drafts. Real provider calls, file writes, repo writes, builds, and deployments require backend access, credentials, owner approval, and Safe Box receipts.</section>
    </div>
  );
}

const styles = {
  shell: { minHeight: "100vh", background: "#070a12", color: "#f8f0de", padding: 22, fontFamily: "Inter, system-ui, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", gap: 16, padding: 20, borderRadius: 22, background: "linear-gradient(135deg,#17223a,#0d1424)", border: "1px solid rgba(255,255,255,.12)", marginBottom: 14 },
  kicker: { color: "#f5b942", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".12em", fontSize: 12 },
  h1: { margin: "8px 0", fontSize: 34 },
  p: { margin: 0, color: "#b8c0d4", maxWidth: 760 },
  status: { alignSelf: "flex-start", padding: "8px 12px", borderRadius: 999, background: "rgba(245,185,66,.14)", color: "#ffe2a3", border: "1px solid rgba(245,185,66,.3)", fontWeight: 800 },
  toolbar: { display: "flex", flexWrap: "wrap", gap: 10, padding: 14, borderRadius: 18, background: "#111827", border: "1px solid rgba(255,255,255,.1)", marginBottom: 14 },
  label: { color: "#b8c0d4", display: "grid", gap: 6, fontSize: 13, fontWeight: 700 },
  select: { background: "#070a12", color: "#f8f0de", border: "1px solid rgba(255,255,255,.14)", borderRadius: 12, padding: "10px 12px" },
  button: { background: "rgba(245,185,66,.14)", color: "#f8f0de", border: "1px solid rgba(245,185,66,.35)", borderRadius: 12, padding: "10px 12px", fontWeight: 800, cursor: "pointer" },
  main: { display: "grid", gridTemplateColumns: "minmax(320px, 520px) minmax(0,1fr)", gap: 14 },
  editor: { display: "grid", gap: 10, padding: 14, borderRadius: 18, background: "#111827", border: "1px solid rgba(255,255,255,.1)" },
  textarea: { minHeight: 190, background: "#070a12", color: "#f8f0de", border: "1px solid rgba(255,255,255,.14)", borderRadius: 12, padding: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 },
  smallTextarea: { minHeight: 76, background: "#070a12", color: "#f8f0de", border: "1px solid rgba(255,255,255,.14)", borderRadius: 12, padding: 12 },
  previewWrap: { minWidth: 0, borderRadius: 18, background: "#111827", border: "1px solid rgba(255,255,255,.1)", padding: 14 },
  previewBar: { display: "flex", justifyContent: "space-between", color: "#b8c0d4", marginBottom: 12 },
  deviceFrame: { minHeight: 580, display: "flex", justifyContent: "center", alignItems: "stretch", background: "#05070d", borderRadius: 16, padding: 12, overflow: "auto" },
  iframe: { minHeight: 560, height: "100%", border: "1px solid rgba(255,255,255,.14)", borderRadius: 14, background: "#fff" },
  output: { marginTop: 12, background: "#070a12", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, color: "#b8c0d4", padding: 12, whiteSpace: "pre-wrap", overflow: "auto" },
  boundary: { marginTop: 14, padding: 14, borderRadius: 18, background: "rgba(255,107,107,.09)", border: "1px solid rgba(255,107,107,.25)", color: "#ffd1d1" }
};
