import React, { useState, useEffect, useMemo } from 'react';
import { Play, Code2, Clock, Globe, ArrowRight, ServerCrash, DollarSign, Wallet, LayoutGrid, Sparkles, Activity } from 'lucide-react';
import { IDEPageLayout } from './layouts/IDEPageLayout.jsx';
import { BRIDGE_URL } from '../config/bridge-config.js';
import { useSovereignStore } from '../store.js';

export default function AppMarket() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [launching, setLaunching] = useState(null);
    const [hoveredProject, setHoveredProject] = useState(null);
    const [layoutPulse, setLayoutPulse] = useState('nexus');
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('recent');
    const [scrollDepth, setScrollDepth] = useState(0);
    const [ambientFlux, setAmbientFlux] = useState(0);
    const globalTheme = useSovereignStore((s) => s.globalTheme);
    const inventing = globalTheme?.inventing || 'alpha';

    useEffect(() => {
        fetch(BRIDGE_URL + '/api/portfolio')
            .then(res => res.json())
            .then(data => {
                setProjects(data.projects || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load portfolio:', err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const layouts = ['nexus', 'terminal', 'royal', 'forge', 'genome', 'cloud', 'hologram', 'retro', 'clean', 'tactical'];
        let i = 0;
        const interval = setInterval(() => {
            i = (i + 1) % layouts.length;
            setLayoutPulse(layouts[i]);
        }, 4200);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY || 0;
            setScrollDepth(Math.min(1, y / 600));
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const fluxInterval = setInterval(() => {
            setAmbientFlux((f) => (f + 0.07) % 1);
        }, 240);
        return () => clearInterval(fluxInterval);
    }, []);

    const launchApp = (projectId) => {
        setLaunching(projectId);
        fetch(BRIDGE_URL + '/api/portfolio/launch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.url) {
                window.open(data.url, '_blank');
            }
            setLaunching(null);
        })
        .catch(() => setLaunching(null));
    };

    const handleConnectStripe = async () => {
        try {
            const res = await fetch(BRIDGE_URL + '/api/marketplace/onboard', { method: 'POST' });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (e) {
            console.error('Failed to connect Stripe', e);
        }
    };

    const handleBuyApp = async (projectId) => {
        try {
            const res = await fetch(BRIDGE_URL + '/api/marketplace/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId })
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (e) {
            console.error('Failed to initiate checkout', e);
        }
    };

    const filteredProjects = useMemo(() => {
        let next = [...projects];
        if (filter === 'recent') {
            const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 3;
            next = next.filter(p => new Date(p.createdAt).getTime() >= cutoff);
        }
        if (filter === 'revenue') {
            next = next.filter(p => p.revenue && p.revenue > 0);
        }

        if (sort === 'recent') {
            next = next.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sort === 'alpha') {
            next = next.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }

        return next;
    }, [projects, filter, sort]);

    const headerActions = (
        <div className="relative flex items-center gap-4">
            <div className="pointer-events-none absolute -inset-2 opacity-60 anim-nexus">
                <div className="w-full h-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.18),_transparent_55%)] blur-xl" />
            </div>
            <button
                onClick={handleConnectStripe}
                className="group relative flex items-center space-x-2 text-neon-cyan bg-indigo-500/10 hover:bg-indigo-500/30 px-4 py-2 rounded-2xl border border-indigo-500/40 transition-all duration-300 anim-terminal shadow-[0_0_18px_rgba(129,140,248,0.45)] hover:shadow-[0_0_30px_rgba(129,140,248,0.8)] backdrop-blur-lg"
            >
                <span className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_120deg,_rgba(56,189,248,0.14),_rgba(244,114,182,0.1),_transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen pointer-events-none" />
                <span className="absolute -inset-px rounded-2xl border border-cyan-300/0 group-hover:border-cyan-300/50 transition-colors duration-500" />
                <Wallet className="w-4 h-4 animate-pulse" />
                <span className="font-bold text-[10px] tracking-[0.22em] uppercase">Connect Bank</span>
                <span className="inline-flex items-center gap-1 ml-1 text-[8px] text-cyan-200/70">
                    <Sparkles className="w-3 h-3" />
                    <span>Live Split</span>
                </span>
            </button>
            <div className="relative flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/40 anim-genome backdrop-blur-lg overflow-hidden">
                <span className="absolute -inset-[1px] rounded-2xl bg-[linear-gradient(120deg,rgba(16,185,129,0.2),transparent,rgba(45,212,191,0.25))] opacity-30 mix-blend-screen" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,1)] mr-1 animate-ping" />
                <Globe className="relative w-4 h-4" />
                <span className="relative font-bold text-[10px] tracking-[0.3em] uppercase">Proof Gated</span>
            </div>
        </div>
    );

    const ambientStatus = (
        <div className="pointer-events-none fixed right-6 bottom-6 z-[40] hidden md:flex items-center gap-2 anim-hologram">
            <div className="relative">
                <div className="absolute inset-0 rounded-full bg-cyan-400/30 blur-md" />
                <div className="relative h-9 w-9 rounded-full bg-slate-950 border border-cyan-400/60 flex items-center justify-center shadow-[0_0_22px_rgba(34,211,238,0.9)]">
                    <span className="absolute inset-[5px] rounded-full bg-gradient-to-br from-cyan-500/10 via-emerald-500/10 to-sky-500/10" />
                    <span className="relative h-2 w-2 rounded-full bg-emerald-400 animate-[ping_1.6s_cubic-bezier(0,0,0.2,1)_infinite]" />
                </div>
            </div>
            <div className="relative text-[10px] uppercase tracking-[0.24em] text-cyan-200/70 bg-slate-900/90 border border-cyan-500/30 rounded-full px-3 py-1 backdrop-blur-xl overflow-hidden">
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(34,211,238,0.35),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(52,211,153,0.28),transparent_55%)] opacity-40 mix-blend-screen" />
                <span className="relative">
                    Studio Daemons: <span className="text-emerald-400 font-semibold">Online</span>
                    <span className="ml-2 text-[9px] text-cyan-300/80">
                        • Flux {Math.round(ambientFlux * 100)}%
                    </span>
                </span>
            </div>
        </div>
    );

    if (loading) {
        return (
            <IDEPageLayout 
                title="Autonomous Portfolio"
                subtitle="Streaming generated micro-apps from daemon lattice..."
                icon={LayoutGrid}
                headerActions={headerActions}
            >
                <div className="relative flex items-center justify-center h-full overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 anim-cloud opacity-70">
                        <div className="absolute -inset-32 bg-[radial-gradient(circle_at_0%_0%,rgba(56,189,248,0.20),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(236,72,153,0.16),transparent_55%),radial-gradient(circle_at_50%_100%,rgba(34,197,94,0.18),transparent_55%)] blur-3xl" />
                    </div>

                    <div className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-70">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(56,189,248,0.15),transparent_55%),radial-gradient(circle_at_90%_90%,rgba(236,72,153,0.18),transparent_55%)] blur-3xl" />
                        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.9),rgba(2,6,23,0.98))]" />
                    </div>

                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(26)].map((_, i) => (
                            <div
                                key={i}
                                className={`
                                    absolute h-px w-24 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent 
                                    animate-[scrollBeam_5s_linear_infinite]
                                    opacity-40 anim-tactical
                                `}
                                style={{
                                    top: `${(i * 4) % 100}%`,
                                    left: `${(i * 11) % 100}%`,
                                    animationDelay: `${i * -0.3}s`
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative flex flex-col items-center gap-6 anim-nexus">
                        <div className="relative">
                            <div className="absolute -inset-8 rounded-full bg-gradient-to-tr from-emerald-400/20 via-cyan-400/10 to-sky-500/15 blur-3xl" />
                            <div className="relative flex items-center justify-center">
                                <div className="relative animate-spin-slow rounded-full h-20 w-20 border-2 border-dashed border-emerald-400/40" />
                                <div className="absolute inset-2 rounded-full border border-emerald-400/70 animate-[pulse_2.4s_ease-in-out_infinite]" />
                                <div className="absolute inset-4 rounded-full bg-[conic-gradient(from_140deg,_rgba(16,185,129,0.7),rgba(56,189,248,0.8),rgba(94,234,212,0.9),rgba(16,185,129,0.7))] opacity-80 shadow-[0_0_40px_rgba(16,185,129,0.85)]" />
                                <div className="absolute h-8 w-8 rounded-full bg-slate-950 flex items-center justify-center border border-emerald-300/70">
                                    <Activity className="w-4 h-4 text-emerald-300 animate-pulse" />
                                </div>
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-xs uppercase tracking-[0.32em] text-emerald-200/80 anim-terminal">
                                Initializing Daemon Index
                            </p>
                            <p className="text-[10px] text-slate-400 anim-retro">
                                Synthesizing holographic portfolio topology...
                            </p>
                            <p className="text-[10px] text-cyan-300/80 uppercase tracking-[0.28em] anim-hologram">
                                Live Telemetry: <span className="ml-1 text-emerald-400">Streaming</span>
                            </p>
                        </div>
                    </div>
                    {ambientStatus}
                </div>
            </IDEPageLayout>
        );
    }

    const cardBaseByInvent = {
        beta: 'bg-white/5 border-white/20 rounded-3xl backdrop-blur-2xl shadow-[0_18px_60px_rgba(15,23,42,0.85)]',
        gamma: 'bg-[#170021] border-fuchsia-500/60 rounded-[28px] shadow-[0_0_0_1px_rgba(236,72,153,0.65),0_22px_60px_rgba(244,114,182,0.55)] anim-royal',
        zeta: 'bg-[#faf7ff] border-black border-[3px] rounded-none shadow-[4px_4px_0_#000000] anim-retro',
        theta: 'bg-gradient-to-br from-black via-slate-950 to-fuchsia-950/50 border-fuchsia-500/20 rounded-[30px] shadow-[0_0_40px_rgba(236,72,153,0.55)] anim-hologram',
        alpha: 'bg-[#050811] border-slate-800/80 rounded-2xl hover:border-emerald-400/80 hover:shadow-[0_0_42px_rgba(16,185,129,0.8)]'
    };

    const holographicOverlay = (
        <div className="pointer-events-none fixed inset-x-0 top-0 h-24 opacity-70 mix-blend-screen anim-hologram z-[5]">
            <div className="w-full h-full bg-[linear-gradient(120deg,rgba(34,197,94,0.2),rgba(34,211,238,0.16),rgba(147,51,234,0.22))] blur-2xl" />
            <div className="absolute inset-x-16 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent opacity-70" />
        </div>
    );

    const toolbar = (
        <div className="relative flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.3em] text-slate-400 anim-tactical">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-1.5 w-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 rounded-full animate-pulse" />
                    <span>Layout Blend: {layoutPulse.toUpperCase()}</span>
                </div>
                <div className="hidden md:flex items-center gap-2 text-[9px]">
                    <span className="text-emerald-400 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Live
                    </span>
                    <span className="text-slate-500">Reactive Commerce Enabled</span>
                </div>
            </div>
            <div className="flex items-center gap-3 text-[9px]">
                <div className="hidden sm:flex items-center gap-1 bg-slate-900/70 border border-slate-700/60 rounded-full px-2 py-1 backdrop-blur">
                    <span className="text-slate-500 mr-1">Filter</span>
                    {['all', 'recent', 'revenue'].map(key => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setFilter(key)}
                            className={`px-2 py-0.5 rounded-full transition-all ${
                                filter === key 
                                    ? 'bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.8)]' 
                                    : 'text-slate-400 hover:text-slate-100'
                            }`}
                        >
                            {key}
                        </button>
                    ))}
                </div>
                <div className="hidden md:flex items-center gap-1 bg-slate-900/70 border border-slate-700/60 rounded-full px-2 py-1 backdrop-blur">
                    <span className="text-slate-500 mr-1">Sort</span>
                    {['recent', 'alpha'].map(key => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setSort(key)}
                            className={`px-2 py-0.5 rounded-full transition-all ${
                                sort === key 
                                    ? 'bg-cyan-400 text-slate-950 shadow-[0_0_14px_rgba(34,211,238,0.8)]' 
                                    : 'text-slate-400 hover:text-slate-100'
                            }`}
                        >
                            {key}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <IDEPageLayout 
            title="Autonomous Portfolio"
            subtitle={`${projects.length} micro-apps flowing from the daemon swarm lattice`}
            icon={LayoutGrid}
            headerActions={headerActions}
        >
            <div className="relative h-full overflow-hidden">
                {holographicOverlay}

                <div className="pointer-events-none absolute inset-0 opacity-70 anim-genome">
                    <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(15,23,42,0.8),rgba(10,10,15,0.9)),radial-gradient(circle_at_top,_rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.16),transparent_55%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(180deg,rgba(148,163,184,0.14)_1px,transparent_1px)] bg-[size:80px_80px] opacity-25 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.28),transparent_55%),radial-gradient(circle_at_80%_100%,rgba(16,185,129,0.24),transparent_55%)] opacity-40 mix-blend-soft-light" />
                </div>

                <div className="pointer-events-none absolute inset-0 opacity-40">
                    {[...Array(22)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-gradient-to-br from-cyan-400/20 via-emerald-400/12 to-sky-500/10 blur-2xl anim-hologram"
                            style={{
                                width: `${20 + (i % 5) * 10}px`,
                                height: `${20 + (i % 4) * 12}px`,
                                top: `${(i * 13) % 100}%`,
                                left: `${(i * 29) % 100}%`,
                                opacity: 0.25 + ((i % 4) * 0.1),
                                animationDelay: `${i * -0.4}s`
                            }}
                        />
                    ))}
                </div>

                <div className="relative overflow-y-auto p-4 space-y-4 z-[10]">
                    {toolbar}

                    {filteredProjects.length === 0 ? (
                        <div className="relative text-center py-24 border-dashed border-slate-800/80 rounded-3xl h-full flex flex-col gap-4 items-center justify-center bg-slate-950/60 backdrop-blur-xl anim-clean overflow-hidden">
                            <div className="absolute inset-0 opacity-60">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(56,189,248,0.25),transparent_55%),radial-gradient(circle_at_90%_0%,rgba(236,72,153,0.22),transparent_55%)] blur-3xl" />
                                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.9),rgba(2,6,23,0.95))]" />
                            </div>
                            <div className="relative">
                                <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-slate-500/10 via-sky-500/10 to-emerald-500/10 blur-xl" />
                                <ServerCrash className="relative w-16 h-16 text-slate-500" />
                            </div>
                            <h3 className="relative text-xl font-semibold text-slate-100">No Apps Found</h3>
                            <p className="relative text-sm text-slate-400">
                                Your daemons are dormant. Initiate a new Studio session to spawn micro-apps.
                            </p>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-0 anim-forge opacity-60">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(94,234,212,0.22),transparent_60%),radial-gradient(circle_at_80%_100%,rgba(96,165,250,0.24),transparent_60%)] blur-2xl" />
                            </div>

                            <div className="pointer-events-none absolute inset-0 mix-blend-soft-light">
                                {[...Array(18)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute h-px w-24 bg-gradient-to-r from-transparent via-emerald-500/80 to-transparent anim-terminal"
                                        style={{
                                            top: `${(i * 5 + 12) % 100}%`,
                                            left: `${(i * 17 + 8) % 100}%`,
                                            opacity: 0.2 + (i % 3) * 0.08,
                                            animationDuration: `${4 + (i % 5)}s`,
                                        }}
                                    />
                                ))}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-[5]">
                                {filteredProjects.map((project, index) => {
                                    const isHovered = hoveredProject === project.id;
                                    const base = cardBaseByInvent[inventing] || cardBaseByInvent.alpha;
                                    const createdAt = new Date(project.createdAt);
                                    const isNew = Date.now() - createdAt.getTime() < 1000 * 60 * 60 * 24 * 3;

                                    return (
                                        <div 
                                            key={project.id} 
                                            onMouseEnter={() => setHoveredProject(project.id)}
                                            onMouseLeave={() => setHoveredProject(null)}
                                            className={`
                                                group relative border transition-all duration-500 flex flex-col gap-4 p-5 cursor-pointer overflow-hidden
                                                ${base}
                                                ${isHovered ? 'scale-[1.02] -translate-y-1 shadow-[0_22px_60px_rgba(16,185,129,0.75)]' : 'scale-[1.0]'}
                                                anim-${layoutPulse}
                                            `}
                                            style={{
                                                transformOrigin: index % 2 === 0 ? 'center top' : 'center bottom',
                                            }}
                                        >
                                            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen">
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(56,189,248,0.32),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(16,185,129,0.26),transparent_55%)] blur-2xl" />
                                                <div className="absolute -inset-[1px] border border-emerald-400/40 rounded-[inherit] animate-[pulse_2.4s_ease-in-out_infinite]" />
                                                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent" />
                                            </div>

                                            <div className="pointer-events-none absolute -top-10 -right-20 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/30 via-cyan-400/20 to-sky-500/10 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-500" />

                                            <div className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-gradient-to-br from-sky-500/10 via-cyan-400/18 to-emerald-400/14 blur-3xl opacity-40 group-hover:opacity-75 transition-opacity duration-500" />

                                            <div className="pointer-events-none absolute inset-x-6 top-10 bottom-10 border-l border-r border-emerald-500/10 opacity-0 group-hover:opacity-90 transition-opacity duration-500" />

                                            {/* 3D-inspired holographic chip */}
                                            <div className="absolute right-4 top-4 text-[9px] uppercase tracking-[0.25em] text-emerald-200/80 anim-hologram">
                                                <div className="relative px-2 py-0.5 rounded-full bg-slate-900/80 border border-emerald-400/40 shadow-[0_0_18px_rgba(16,185,129,0.6)] flex items-center gap-1.5 backdrop-blur">
                                                    <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                                                    <span>Daemon</span>
                                                    <span className="text-[8px] text-emerald-200/70">
                                                        v{(project.version || '1.0').toString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Card Top */}
                                            <div className="mb-3 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="relative">
                                                        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-400/40 via-cyan-400/40 to-sky-400/40 opacity-0 group-hover:opacity-90 blur-md transition-opacity duration-500" />
                                                        <div className="relative w-12 h-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-700 flex items-center justify-center shadow-[0_0_22px_rgba(15,23,42,0.9)] group-hover:shadow-[0_0_32px_rgba(16,185,129,0.85)] group-hover:scale-105 transition-all duration-300">
                                                            <Code2 className="w-6 h-6 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
                                                            <div className="absolute inset-[2px] rounded-3xl border border-emerald-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1 text-[10px] uppercase tracking-[0.28em] text-slate-500">
                                                        <span className="inline-flex items-center gap-1">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                            Deployed
                                                        </span>
                                                        <span className="text-[9px] text-slate-500/80">
                                                            ID: {project.id.slice(0, 6).toUpperCase()}
                                                        </span>
                                                        {isNew && (
                                                            <span className="mt-0.5 text-[8px] text-emerald-300 uppercase tracking-[0.26em]">
                                                                New
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className={`text-lg font-semibold leading-tight mb-1.5 capitalize truncate ${inventing === 'zeta' ? 'text-black' : 'text-slate-50'}`}>
                                                        {project.name}
                                                    </h3>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center text-[11px] font-medium text-slate-400 uppercase tracking-[0.25em]">
                                                            <Clock className="w-3 h-3 mr-1 text-slate-500" />
                                                            {createdAt.toLocaleDateString()}
                                                        </div>
                                                        <div className="text-[10px] font-medium text-emerald-300/90 uppercase tracking-[0.24em] flex items-center gap-1 anim-terminal">
                                                            <span className="h-1 w-4 bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400 rounded-full" />
                                                            <span>{(project.tier || 'Core').toString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Divider */}
                                            <div className="relative my-3">
                                                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700/80 to-transparent" />
                                                <div className="absolute inset-x-1 -top-[1px] h-px bg-gradient-to-r from-emerald-400/50 via-cyan-400/60 to-sky-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            </div>

                                            {/* Holographic status row */}
                                            <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.26em] text-slate-500 mb-2 anim-tactical">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,1)]" />
                                                    <span>Daemon Linked</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-emerald-300/80">
                                                    <span className="h-[1px] w-6 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                                                    <span className="opacity-80">Auto-Scaling</span>
                                                </div>
                                            </div>

                                            {/* Micro metrics band */}
                                            <div className="mb-2 grid grid-cols-3 gap-2 text-[9px] uppercase tracking-[0.2em] text-slate-400">
                                                <div className="flex items-center justify-between px-2 py-1 rounded-xl bg-slate-900/60 border border-slate-700/60 anim-terminal">
                                                    <span>Latency</span>
                                                    <span className="text-emerald-300">
                                                        {(project.latency || 32) + 'ms'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between px-2 py-1 rounded-xl bg-slate-900/60 border border-slate-700/60 anim-nexus">
                                                    <span>Uptime</span>
                                                    <span className="text-cyan-300">
                                                        {(project.uptime || 99.9) + '%'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between px-2 py-1 rounded-xl bg-slate-900/60 border border-slate-700/60 anim-hologram">
                                                    <span>Rev</span>
                                                    <span className="text-sky-300">
                                                        {'$' + (project.revenue || 0).toFixed(0)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="mt-auto flex flex-col gap-3">
                                                <div className="flex gap-3">
                                                    <button 
                                                        onClick={() => launchApp(project.id)}
                                                        disabled={launching === project.id}
                                                        className="group/launch relative flex-1 bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-300 hover:from-emerald-300 hover:via-emerald-200 hover:to-cyan-200 text-slate-950 font-semibold py-2.5 px-4 rounded-3xl flex items-center justify-center transition-all duration-300 disabled:opacity-60 shadow-[0_18px_40px_rgba(16,185,129,0.7)] hover:shadow-[0_22px_50px_rgba(45,212,191,0.9)] anim-nexus"
                                                    >
                                                        <div className="absolute inset-[1px] rounded-[inherit] bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-0 group-hover/launch:opacity-20 mix-blend-overlay transition-opacity duration-300" />
                                                        {launching === project.id ? (
                                                            <div className="flex items-center gap-2 text-[11px] tracking-[0.26em] uppercase">
                                                                <div className="w-4 h-4 border-[2px] border-slate-900 border-t-transparent rounded-full animate-spin" />
                                                                <span>Launching</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <Play className="w-4 h-4 mr-2 group-hover/launch:translate-x-0.5 transition-transform duration-200" fill="currentColor" />
                                                                <span className="text-[11px] tracking-[0.28em] uppercase">Launch</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => launchApp(project.id)}
                                                        disabled={launching === project.id}
                                                        aria-label={`Open ${project.name}`}
                                                        className="group/open relative bg-slate-900/90 hover:bg-slate-800 text-slate-50 p-2.5 rounded-3xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 border border-slate-700/80 hover:border-emerald-400/80 anim-terminal"
                                                    >
                                                        <span className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-sky-500/10 opacity-0 group-hover/open:opacity-100 transition-opacity duration-500" />
                                                        <ArrowRight className="w-5 h-5 group-hover/open:translate-x-0.5 transition-transform duration-200" />
                                                    </button>
                                                </div>
                                                <button 
                                                    onClick={() => handleBuyApp(project.id)}
                                                    className="group/buy relative w-full bg-gradient-to-r from-blue-500/15 via-sky-500/25 to-cyan-500/20 hover:from-blue-500/20 hover:via-sky-500/35 hover:to-cyan-500/30 text-neon-cyan font-semibold py-2.5 px-4 rounded-3xl flex items-center justify-center transition-all duration-300 border border-sky-400/40 shadow-[0_16px_40px_rgba(56,189,248,0.5)] anim-hologram"
                                                >
                                                    <div className="absolute inset-[1px] rounded-[inherit] bg-slate-950/80" />
                                                    <div className="absolute -inset-px rounded-[inherit] opacity-0 group-hover/buy:opacity-100 transition-opacity duration-500 bg-[conic-gradient(from_220deg,_rgba(56,189,248,0.32),rgba(6,182,212,0.1),transparent_60%)] mix-blend-screen" />
                                                    <div className="relative flex items-center justify-between w-full gap-3 text-[11px] uppercase tracking-[0.3em]">
                                                        <div className="flex items-center gap-2">
                                                            <DollarSign className="w-4 h-4" />
                                                            <span>Buy App</span>
                                                        </div>
                                                        <span className="flex items-center gap-1 text-sky-200/90">
                                                            <span className="h-1 w-1 rounded-full bg-sky-300 animate-ping" />
                                                            <span>${(project.price || 9).toFixed(2)}</span>
                                                        </span>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
                {ambientStatus}

                {/* Scroll depth indicator */}
                <div className="pointer-events-none fixed left-4 top-24 bottom-24 z-[30] hidden lg:flex flex-col justify-end">
                    <div className="relative h-full w-1 rounded-full bg-slate-800/80 overflow-hidden anim-tactical">
                        <div
                            className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-400 via-cyan-400 to-sky-400 shadow-[0_0_18px_rgba(34,211,238,0.9)] transition-all duration-500"
                            style={{ height: `${(scrollDepth || 0.05) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </IDEPageLayout>
    );
}

// [Autonomous Evolution] FULL LLM mutation applied by PromptHouse Singularity Engine on 2026-06-26T14:36:48.544Z

// [Autonomous Evolution] FULL LLM mutation applied by PromptHouse Singularity Engine on 2026-06-26T14:56:53.744Z