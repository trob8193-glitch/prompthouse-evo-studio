import React from 'react';
import { Log } from '../core/autonomy/SovereignLogger.js';
import { useSovereignStore } from '../store.js';

// Browser-safe AI adaptor proxy — the real UniversalAIAdaptor uses Node.js
// modules (fs, child_process) which crash in the browser.
class BrowserAIAdaptor {
  async routeRequest(prompt) {
    try {
      const res = await fetch('/api/intelligence/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 'repair', action: 'diagnose', payload: { prompt } })
      });
      if (!res.ok) throw new Error('AI repair endpoint unavailable');
      return await res.json();
    } catch {
      return { content: '{"diagnosis":"AI repair unavailable in browser","suggestedCode":"Reload the page."}' };
    }
  }
}

export default class AutonomousSelfRepairBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, isRepairing: false, repairPatch: null };
    this.ai = new BrowserAIAdaptor();
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  async componentDidCatch(error, errorInfo) {
    Log.error("UI Crashed! Engaging Autonomous Self-Repair...", error);
    this.setState({ isRepairing: true });

    try {
      const prompt = `
[NUCLEAR FATAL EXCEPTION INTERCEPTED]
The React UI crashed with the following error:
${error.toString()}
Stack: ${errorInfo.componentStack}

As the Sovereign Evolution Studio, analyze this React error and output a physical JSON repair payload.
Output exactly this JSON format with no markdown wrappers:
{ "diagnosis": "short reason for crash", "patchType": "css | js | state", "suggestedCode": "raw code or action" }
`;
      // Use the API keys to work as a team
      const response = await this.ai.routeRequest(prompt, { model: 'gpt-4o-mini', provider: 'openai' });
      
      let patch;
      try {
        const jsonStr = response.content.replace(/```json/g, '').replace(/```/g, '').trim();
        patch = JSON.parse(jsonStr);
      } catch(e) {
         patch = { diagnosis: 'AI Parsing failed', suggestedCode: 'Fallback to manual reload.' };
      }

      this.setState({ isRepairing: false, repairPatch: patch });
      Log.warn("Autonomous Patch Generated:", patch);
    } catch (aiErr) {
      this.setState({ isRepairing: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black/90 text-white flex flex flex-col gap-4 items-center justify-center p-10 font-mono z-9999 overflow-auto">
          <h1 className="text-red-500 text-3xl font-black uppercase tracking-widest mb-4 animate-pulse">Sovereign Boundary Tripped</h1>
          <p className="text-gray-400 mb-6">The UI encountered a fatal structural flaw. Engaging autonomous AI self-repair protocols.</p>
          
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-3xl text-red-400 text-xs mb-6 max-w-2xl w-full whitespace-pre-wrap">
            {this.state.error?.toString()}
          </div>

          {this.state.isRepairing && (
            <div className="flex items-center gap-3 text-[#00f0ff]">
              <div className="w-4 h-4 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin" />
              AI Team analyzing stack trace using Sovereign APIs...
            </div>
          )}

          {this.state.repairPatch && (
            <div className="bg-[#00f0ff]/10 border border-[#00f0ff]/30 p-4 rounded-3xl text-left w-full max-w-2xl">
              <h3 className="text-[#00f0ff] font-bold uppercase mb-2">Automated AI Diagnosis</h3>
              <p className="text-sm text-gray-300 mb-4">{this.state.repairPatch.diagnosis}</p>
              <pre className="text-xs text-green-400 bg-black p-3 rounded overflow-auto whitespace-pre-wrap">
                {this.state.repairPatch.suggestedCode}
              </pre>
              <button 
                onClick={() => {
                  useSovereignStore.getState().rollbackState(); // Revert any bad mutations
                  window.location.reload();
                }}
                className="mt-4 px-6 py-2 bg-[#00f0ff] text-black font-bold uppercase tracking-widest rounded hover:bg-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.5)]"
              >
                Rollback State & Re-Ignite
              </button>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
