import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  MessageSquare,
  Monitor,
  PanelsTopLeft,
  RefreshCw,
  Route,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { safeFetchBridge } from '../config/bridge-config.js';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';

const SURFACES = [
  {
    id: 'studio',
    label: 'Studio',
    surface: 'studio_native_panel',
    brainId: 'studio_brain',
    abilityClass: 'audit',
    targetBrain: 'studio_brain',
    intent: 'RUN_STUDIO_SURFACE_AUDIT',
    icon: Monitor,
    mode: 'Local execution',
  },
  {
    id: 'chatgpt',
    label: 'ChatGPT Operator',
    surface: 'actions_gpt',
    brainId: 'chatgpt_operator_brain',
    abilityClass: 'report',
    targetBrain: 'chatgpt_operator_brain',
    intent: 'PLAN_CHATGPT_OPERATOR_REPORT',
    icon: MessageSquare,
    mode: 'Proposal and approval cockpit',
  },
  {
    id: 'ide',
    label: 'IDE Agent',
    surface: 'ide_desktop_bridge',
    brainId: 'ide_agent_brain',
    abilityClass: 'verify',
    targetBrain: 'ide_agent_brain',
    intent: 'VERIFY_IDE_AGENT_ROUTE',
    icon: Code2,
    mode: 'Local repo and proof bridge',
  },
  {
    id: 'external',
    label: 'External Experience',
    surface: 'apps_mcp_cockpit',
    brainId: 'external_experience_brain',
    abilityClass: 'interact',
    targetBrain: null,
    intent: 'PLAN_EXTERNAL_EXPERIENCE_SURFACE',
    icon: PanelsTopLeft,
    mode: 'Gateway routed UI surface',
  },
];

function truthTone(value) {
  const normalized = String(value || '').toUpperCase();
  if (normalized.includes('READY') || normalized.includes('VERIFIED') || normalized.includes('PROVEN')) {
    return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200';
  }
  if (normalized.includes('GATED') || normalized.includes('WARNING') || normalized.includes('APPROVAL')) {
    return 'border-amber-500/40 bg-amber-500/10 text-amber-200';
  }
  if (normalized.includes('BLOCKED') || normalized.includes('ERROR')) {
    return 'border-red-500/40 bg-red-500/10 text-red-200';
  }
  return 'border-cyan-500/30 glass-extreme border-neon-glow/70 text-slate-300';
}

function Badge({ children, tone }) {
  return (
    <span className={`inline-flex min-h-7 items-center rounded-md border px-2.5 py-1 text-[11px] font-bold uppercase ${tone || 'border-cyan-500/30 glass-extreme border-neon-glow text-slate-300'}`}>
      {children}
    </span>
  );
}

function getBrainState(status, brainId) {
  return status?.router?.brains?.[brainId] || null;
}

function getCapability(status, brainId) {
  return status?.capabilityMatrix?.[brainId] || null;
}

function compactAbilityList(abilities = []) {
  if (!abilities.length) return 'No abilities advertised';
  if (abilities.length <= 5) return abilities.join(', ');
  return `${abilities.slice(0, 5).join(', ')} +${abilities.length - 5}`;
}

export default function PromptBridgeSurfacesView() {
  const [loading, setLoading] = useState(false);
  const [routeLoading, setRouteLoading] = useState('');
  const [error, setError] = useState('');
  const [triStatus, setTriStatus] = useState(null);
  const [quadStatus, setQuadStatus] = useState(null);
  const [quadContract, setQuadContract] = useState(null);
  const [selectedSurface, setSelectedSurface] = useState(SURFACES[0]);
  const [surfaceRoute, setSurfaceRoute] = useState(null);
  const [triPlan, setTriPlan] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [tri, quad, contract] = await Promise.all([
        safeFetchBridge('/api/tribrain/status'),
        safeFetchBridge('/api/quadbrain/status'),
        safeFetchBridge('/api/quadbrain/contract'),
      ]);
      const failed = [tri, quad, contract].find((result) => !result.ok);
      if (failed) throw new Error(failed.error || 'PromptBridge surface status failed.');
      setTriStatus(tri.data?.status || null);
      setQuadStatus(quad.data?.status || null);
      setQuadContract(contract.data || null);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function planSurface(surfaceDef) {
    setSelectedSurface(surfaceDef);
    setRouteLoading(surfaceDef.id);
    setError('');
    try {
      const quad = await safeFetchBridge('/api/quadbrain/route', {
        method: 'POST',
        body: JSON.stringify({
          surface: surfaceDef.surface,
          abilityClass: surfaceDef.abilityClass,
        }),
      });
      if (!quad.ok) throw new Error(quad.error || 'QuadBrain route failed.');
      setSurfaceRoute(quad.data?.route || null);

      if (surfaceDef.targetBrain) {
        const tri = await safeFetchBridge('/api/tribrain/route', {
          method: 'POST',
          headers: {
            'x-tribrain-role': 'developer',
            'x-ide-online': surfaceDef.id === 'ide' ? 'true' : 'false',
            'x-chatgpt-online': surfaceDef.id === 'chatgpt' ? 'true' : 'false',
          },
          body: JSON.stringify({
            command: {
              intent: surfaceDef.intent,
              sourceBrain: 'studio_brain',
              targetBrain: surfaceDef.targetBrain,
              abilityClass: surfaceDef.abilityClass,
              riskLevel: 'low',
              payload: { surface: surfaceDef.surface, projectId: 'studio-core' },
            },
          }),
        });
        if (!tri.ok) throw new Error(tri.error || 'TriBrain route plan failed.');
        setTriPlan(tri.data?.plan || null);
      } else {
        setTriPlan({
          truthState: 'GATEWAY_SURFACE',
          selectedResponse: {
            respondingBrain: 'external_experience_brain',
            summary: 'External experience routing is handled by QuadBrain and Studio Gateway contracts.',
            nextActions: ['Keep external UI actions proposal-only until provider proof and owner approval exist.'],
          },
        });
      }
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setRouteLoading('');
    }
  }

  useEffect(() => {
    load();
  }, []);

  const statusCounts = useMemo(() => {
    const triBrains = triStatus?.router?.brains || {};
    const available = Object.values(triBrains).filter((state) => state.available).length;
    const enabled = Object.values(triBrains).filter((state) => state.enabled).length;
    return {
      enabled,
      available,
      quadSurfaces: Object.keys(quadContract?.surfaces || quadStatus?.surfaces || {}).length,
      quadBrains: Object.keys(quadStatus?.capabilityMatrix || {}).length,
    };
  }, [triStatus, quadStatus, quadContract]);

  return (
    <IDEPageLayout
      title="Studio Brain Surface Router"
      description="Operator view for Studio, ChatGPT operator, IDE agent, and external experience surfaces using the active TriBrain and QuadBrain bridge contracts."
      icon={Route}
      actions={
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border-cyan-400/40 bg-cyan-400/10 px-4 text-sm font-bold text-cyan-100 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      }
    >
    <div className="flex-col gap-6">

      {error && (
        <div className="flex items-start gap-3 rounded-md border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <section className="grid gap-3 md:grid-cols-4">
        <div className="rounded-md border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] bg-slate-950/70 p-4">
          <p className="text-xs font-bold uppercase text-slate-500">TriBrain</p>
          <p className="mt-2 text-xl font-black text-white">{triStatus?.truthLabel || 'Loading'}</p>
        </div>
        <div className="rounded-md border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] bg-slate-950/70 p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Enabled Brains</p>
          <p className="mt-2 text-xl font-black text-white">{statusCounts.enabled}</p>
        </div>
        <div className="rounded-md border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] bg-slate-950/70 p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Available Now</p>
          <p className="mt-2 text-xl font-black text-white">{statusCounts.available}</p>
        </div>
        <div className="rounded-md border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] bg-slate-950/70 p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Quad Surfaces</p>
          <p className="mt-2 text-xl font-black text-white">{statusCounts.quadSurfaces}</p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {SURFACES.map((surface) => {
          const Icon = surface.icon;
          const brainState = getBrainState(triStatus, surface.brainId);
          const capability = getCapability(quadStatus, surface.brainId) || brainState?.capability;
          const available = brainState?.available === true || surface.brainId === 'external_experience_brain';
          const active = selectedSurface.id === surface.id;

          return (
            <article
              key={surface.id}
              className={`rounded-md border bg-slate-950/70 p-4 transition-colors ${active ? 'border-cyan-400/60' : 'border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] hover:border-cyan-500/30'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border glass-extreme border-neon-glow text-cyan-200">
                    <Icon size={19} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-black text-white">{surface.label}</h2>
                    <p className="truncate text-xs text-slate-400">{surface.mode}</p>
                  </div>
                </div>
                {available ? <CheckCircle2 size={18} className="text-emerald-300" /> : <ShieldCheck size={18} className="text-amber-300" />}
              </div>

              <div className="mt-4 flex-wrap gap-2">
                <Badge tone={available ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/40 bg-amber-500/10 text-amber-200'}>
                  {available ? 'Ready' : 'Gated'}
                </Badge>
                <Badge>{surface.abilityClass}</Badge>
                {capability?.defaultMode && <Badge>{capability.defaultMode}</Badge>}
              </div>

              <p className="mt-4 min-h-20 text-sm leading-6 text-slate-300">
                {capability?.authority || 'Capability contract is not loaded yet.'}
              </p>

              <p className="mt-3 text-xs leading-5 text-slate-500">{compactAbilityList(capability?.abilities || [])}</p>

              <button
                type="button"
                onClick={() => planSurface(surface)}
                disabled={routeLoading === surface.id}
                className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border-indigo-400/40 bg-indigo-500/10 px-3 text-xs font-black uppercase text-indigo-100 hover:bg-indigo-500/20 disabled:cursor-wait disabled:opacity-60"
              >
                <Send size={14} />
                {routeLoading === surface.id ? 'Planning' : 'Plan Route'}
              </button>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-md border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] bg-slate-950/70 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase text-slate-500">QuadBrain Surface Route</p>
              <h2 className="mt-1 text-xl font-black text-white">{selectedSurface.label}</h2>
            </div>
            <Badge tone={truthTone(surfaceRoute?.truthLabel)}>{surfaceRoute?.truthLabel || 'Not planned'}</Badge>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <RouteFact label="Surface" value={surfaceRoute?.surface || selectedSurface.surface} />
            <RouteFact label="Selected Brain" value={surfaceRoute?.selectedBrain || selectedSurface.brainId} />
            <RouteFact label="Ability" value={surfaceRoute?.abilityClass || selectedSurface.abilityClass} />
            <RouteFact label="Studio Gateway" value={surfaceRoute ? (surfaceRoute.requiresStudioGateway ? 'Required' : 'Local') : 'Pending'} />
          </div>
        </div>

        <div className="rounded-md border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] bg-slate-950/70 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase text-slate-500">TriBrain Plan</p>
              <h2 className="mt-1 text-xl font-black text-white">{triPlan?.selectedResponse?.respondingBrain || triPlan?.selectedBrain || 'Waiting for route plan'}</h2>
            </div>
            <Badge tone={truthTone(triPlan?.truthState)}>{triPlan?.truthState || 'Idle'}</Badge>
          </div>

          <p className="mt-4 min-h-16 text-sm leading-6 text-slate-300">
            {triPlan?.selectedResponse?.summary || triPlan?.summary || 'Choose a surface to ask PromptBridge for a route plan.'}
          </p>

          <div className="mt-4 rounded-md border shadow-[0_0_15px_rgba(0,240,255,0.05)] glass-extreme border-neon-glow/60 p-4">
            <p className="text-xs font-black uppercase text-slate-500">Next Actions</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {(triPlan?.selectedResponse?.nextActions || triPlan?.nextActions || ['Route a surface to populate the current plan.']).map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
    </IDEPageLayout>
  );
}

function RouteFact({ label, value }) {
  return (
    <div className="rounded-md border shadow-[0_0_15px_rgba(0,240,255,0.05)] glass-extreme border-neon-glow/60 p-3">
      <p className="text-[11px] font-black uppercase text-slate-500">{label}</p>
      <p className="mt-1 wrap-break-word text-sm font-bold text-slate-100">{value}</p>
    </div>
  );
}
