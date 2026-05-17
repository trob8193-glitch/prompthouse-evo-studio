import React, { useState, useEffect } from 'react';
import { getPreviewAccessStatus } from '../services/preview-access-client.js';

function TruthBadge({ state }) {
  const colors = {
    'VERIFIED': 'bg-blue-900 text-blue-200 border-blue-700',
    'AUTH_PROTECTED': 'bg-indigo-900 text-indigo-200 border-indigo-700',
    'PUBLIC_ACCESSIBLE': 'bg-green-900 text-green-200 border-green-700',
    'NEEDS_MANUAL_BROWSER_CHECK': 'bg-yellow-900 text-yellow-200 border-yellow-700',
    'NEEDS_CREDENTIALS': 'bg-yellow-900 text-yellow-200 border-yellow-700',
    'ERROR': 'bg-red-900 text-red-200 border-red-700',
    'UNKNOWN': 'bg-gray-800 text-gray-300 border-gray-600'
  };
  const color = colors[state] || colors['UNKNOWN'];
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono border ${color}`}>
      {state}
    </span>
  );
}

export function PreviewAccessDecisionPanel() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const res = await getPreviewAccessStatus();
      if (mounted) {
        if (res.ok) setStatus(res.data);
        else setError(res.error || 'Failed to load preview access status');
      }
    }
    load();
    const interval = setInterval(load, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  if (error) {
    return (
      <div className="border border-red-800 bg-red-950 p-4 rounded-md mb-4 text-sm text-red-200">
        Error loading Preview Access Status: {error}
      </div>
    );
  }

  if (!status) {
    return (
      <div className="border border-gray-800 bg-gray-900 p-4 rounded-md mb-4 text-sm text-gray-400">
        Loading Preview Access Status...
      </div>
    );
  }

  return (
    <div className="border border-indigo-800 bg-indigo-950/30 p-4 rounded-md mb-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-indigo-300 font-semibold text-sm">Preview Access Decision</h3>
        <TruthBadge state={status.accessMode} />
      </div>

      <div className="space-y-3 text-sm">
        <div className="bg-black/40 p-3 rounded border border-indigo-900/50 font-mono text-xs">
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <div className="text-gray-500">Preview URL:</div>
            <div className="text-indigo-300 break-all">{status.deploymentUrl || 'Not available'}</div>
            <div className="text-gray-500">Smoke Result:</div>
            <div className="text-gray-300">{status.smokeResult || 'Not performed'}</div>
          </div>
        </div>

        {status.accessMode === 'AUTH_PROTECTED' && (
          <div className="bg-indigo-900/40 p-3 rounded border border-indigo-800/60 text-indigo-200 text-xs">
            <strong>Note:</strong> The HTTP 401 response is caused by Vercel Authentication. This is a valid security gate and not an application failure.
          </div>
        )}

        <div className="space-y-2 mt-4">
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Recommended Options</div>
          {status.options?.map((opt) => (
            <div key={opt.id} className={`p-2 rounded border ${opt.recommended ? 'bg-indigo-900/30 border-indigo-700/50' : 'bg-gray-900/50 border-gray-800'} flex flex-col gap-1`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${opt.recommended ? 'bg-indigo-500' : 'bg-gray-600'}`}></span>
                <span className="font-semibold text-gray-200 text-xs">{opt.title}</span>
                {opt.recommended && <span className="text-[10px] bg-indigo-800 text-indigo-200 px-1.5 rounded uppercase font-bold tracking-wider">Recommended</span>}
              </div>
              <p className="text-gray-400 text-xs ml-4">{opt.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
