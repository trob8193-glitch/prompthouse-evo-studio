import React, { useState, useEffect } from 'react';
import { Gauge, FileSearch, Code, FolderTree, AlertTriangle } from 'lucide-react';
import TruthBadge from './TruthBadge.jsx';
import {
  getRouteDiagnostics,
  getImportDiagnostics,
  getCssVarDiagnostics,
  getWorktreeDiagnostics
} from '../services/diagnostics-client.js';

/**
 * PH EVO STUDIO — ROUTE DIAGNOSTICS PANEL
 * ═══════════════════════════════════════════════════════════════
 * Dashboard panel for real-time bridge diagnostics:
 * Routes, Imports, CSS Vars, and Worktree structure.
 * Uses TruthBadge for state.
 */
export default function RouteDiagnosticsPanel() {
  const [data, setData] = useState({
    routes: null,
    imports: null,
    css: null,
    worktree: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [routes, imports, css, worktree] = await Promise.all([
          getRouteDiagnostics(),
          getImportDiagnostics(),
          getCssVarDiagnostics(),
          getWorktreeDiagnostics()
        ]);
        
        if (cancelled) return;

        // If any of the requests failed with an error, we bubble it up
        if (!routes.ok) throw new Error(routes.error || 'Failed to fetch routes diagnostics');
        
        setData({
          routes: routes.data,
          imports: imports.ok ? imports.data : null,
          css: css.ok ? css.data : null,
          worktree: worktree.ok ? worktree.data : null
        });
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const cardStyle = {
    padding: '24px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-mid)',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  const statBoxStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    background: 'var(--bg-deep)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    fontSize: '12px',
  };

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px', height: '36px',
          background: 'linear-gradient(135deg, #6366f1, #d946ef)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Gauge size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>System Diagnostics</div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            Routes &amp; Integrity
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
          Running diagnostics...
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: '8px',
          color: 'var(--accent-red)', fontSize: '12px',
        }}>
          <AlertTriangle size={14} />
          Bridge unavailable — {error}
        </div>
      )}

      {/* Content */}
      {!loading && !error && data.routes && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* Route Coverage */}
          <div style={statBoxStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gauge size={14} color="var(--accent-indigo)" />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>Total Routes Read</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 800 }}>
              {data.routes?.total || 0}
            </span>
          </div>

          {/* Missing Routes */}
          {data.routes?.missing?.length > 0 && (
            <div style={{
              padding: '10px 14px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: 700 }}>
                <AlertTriangle size={13} /> Missing README Routes
              </div>
              {data.routes.missing.map((route, i) => (
                <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-primary)' }}>
                  {route.method} {route.path}
                </div>
              ))}
            </div>
          )}

          {/* Import Audit */}
          {data.imports && (
            <div style={statBoxStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSearch size={14} color="#10b981" />
                <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>Import Audit</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{data.imports?.totalFilesScanned || 0} files</span>
                <TruthBadge state={data.imports?.status === 'passed' ? 'VERIFIED' : 'ERROR'} compact />
              </div>
            </div>
          )}

          {/* CSS Variables */}
          {data.css && (
            <div style={statBoxStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code size={14} color="#06b6d4" />
                <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>CSS Variables</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{data.css?.definedTokens || 0} defined</span>
                <TruthBadge state={data.css?.status === 'passed' ? 'VERIFIED' : 'ERROR'} compact />
              </div>
            </div>
          )}

          {/* Worktree */}
          {data.worktree && (
            <div style={statBoxStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderTree size={14} color="#f97316" />
                <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>Worktree State</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {data.worktree?.generatedDirs || 0} Gen · {data.worktree?.importedDirs || 0} Imp
                </span>
              </div>
            </div>
          )}
          
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !data.routes && (
         <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
           No diagnostics data available.
         </div>
      )}
    </div>
  );
}
