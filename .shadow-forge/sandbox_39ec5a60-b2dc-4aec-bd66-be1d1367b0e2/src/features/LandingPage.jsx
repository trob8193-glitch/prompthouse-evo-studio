import React, { useState, useEffect } from 'react';
import { useSovereignStore } from '../store.js';

/**
 * LandingPage — Public marketing page for PromptHouse Evo Studio.
 * Shown when ?landing=1 or when user is not authenticated.
 */

const FEATURES = [
  {
    icon: '🤖',
    title: '32 Specialized AI Agents',
    desc: 'From Evo (Master Orchestrator) to Cipher Lynx (Security Auditor) — every role purpose-built.',
    color: '#00f0ff',
  },
  {
    icon: '🌀',
    title: 'Self-Evolution Engine',
    desc: 'The studio analyzes its own codebase and proposes improvements autonomously — with a kill switch.',
    color: '#8b5cf6',
  },
  {
    icon: '💎',
    title: '10 Living UI Paradigms',
    desc: 'Nexus, Forge, Genome, Hologram, Royal — your interface evolves with your usage patterns.',
    color: '#f59e0b',
  },
  {
    icon: '🔐',
    title: 'Cryptographic Audit Ledger',
    desc: 'Every prompt, every agent action, every file mutation — signed and immutable in EvoGit.',
    color: '#10b981',
  },
  {
    icon: '🏠',
    title: 'Local-First, Cloud-Optional',
    desc: 'Runs on your machine with Ollama. No data sent anywhere without your explicit consent.',
    color: '#ec4899',
  },
  {
    icon: '📡',
    title: 'AGI Iron Man HUD',
    desc: 'Real-time OS-level telemetry across all 7 autonomous subsystems. Live. Always.',
    color: '#38bdf8',
  },
];

const PRICING = [
  {
    name: 'Indie Builder',
    price: '$49',
    period: '/month',
    color: '#00f0ff',
    features: [
      '32 AI agent roster',
      'Prompt registry & scoring',
      'EvoEyes visual audit',
      '10 UI themes',
      'Local-first (Ollama support)',
    ],
  },
  {
    name: 'Studio Pro',
    price: '$149',
    period: '/month',
    color: '#8b5cf6',
    popular: true,
    features: [
      'Everything in Indie',
      'NightForge autonomous builds',
      'WorkTwin workflow capture',
      'Evo Duel Arena',
      'Pattern Miner',
      'Chrome Extension builder',
    ],
  },
  {
    name: 'Studio Sovereign',
    price: '$999',
    period: '/month',
    color: '#f59e0b',
    features: [
      'Everything in Pro',
      'EvoGit cryptographic ledger',
      'AGI Iron Man HUD',
      'Multi-model registry',
      'Cost firewall & governance',
      'Priority support',
    ],
  },
];

export function LandingPage({ onEnterStudio }) {
  const setAuthenticated = useSovereignStore((s) => s.setAuthenticated);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleEnter = () => {
    if (onEnterStudio) onEnterStudio();
  };

  return (
    <div style={ls.root}>
      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <nav style={{
        ...ls.nav,
        background: scrollY > 40 ? 'rgba(5,5,8,0.95)' : 'transparent',
        backdropFilter: scrollY > 40 ? 'blur(20px)' : 'none',
      }}>
        <div style={ls.navInner}>
          <div style={ls.navLogo}>
            <div style={ls.navLogoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" stroke="#00f0ff" strokeWidth="1.5" fill="rgba(0,240,255,0.1)"/>
                <circle cx="12" cy="12" r="3" fill="#00f0ff"/>
              </svg>
            </div>
            <span style={ls.navBrand}>PROMPTHOUSE</span>
          </div>
          <div style={ls.navLinks}>
            <a href="#features" style={ls.navLink}>Features</a>
            <a href="#pricing" style={ls.navLink}>Pricing</a>
            <button onClick={handleEnter} style={ls.navCta}>Enter Studio →</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={ls.hero}>
        <div style={ls.heroGlow1} />
        <div style={ls.heroGlow2} />
        <div style={ls.heroContent}>
          <div style={ls.heroBadge}>
            <span style={{ color: '#00f0ff', marginRight: 6 }}>●</span>
            Self-Evolving AI Development Environment
          </div>
          <h1 style={ls.heroTitle}>
            Build with AI.<br />
            <span style={{
              background: 'linear-gradient(135deg, #00f0ff, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Evolve Autonomously.
            </span>
          </h1>
          <p style={ls.heroSub}>
            32 specialized AI agents. 10 living UI paradigms. A studio that improves its own codebase overnight
            — with a cryptographic audit trail of every decision it makes.
          </p>
          <div style={ls.heroActions}>
            <button onClick={handleEnter} style={ls.heroPrimaryBtn}>
              Launch Studio Free →
            </button>
            <a href="#features" style={ls.heroSecondaryBtn}>
              See what's inside
            </a>
          </div>
          <p style={ls.heroNote}>No credit card required. Local-first.</p>
        </div>

        {/* Animated grid */}
        <div style={ls.heroGrid} aria-hidden="true">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 1, height: 1, borderRadius: '50%',
                background: '#00f0ff',
                opacity: Math.random() * 0.4 + 0.05,
                animation: `pulse ${2 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section id="features" style={ls.section}>
        <div style={ls.sectionInner}>
          <div style={ls.sectionLabel}>What You Get</div>
          <h2 style={ls.sectionTitle}>Everything a serious AI builder needs</h2>
          <div style={ls.featureGrid}>
            {FEATURES.map(f => (
              <div key={f.title} style={ls.featureCard}>
                <div style={{ ...ls.featureIcon, color: f.color, borderColor: `${f.color}30`, background: `${f.color}0d` }}>
                  {f.icon}
                </div>
                <h3 style={ls.featureTitle}>{f.title}</h3>
                <p style={ls.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section style={{ ...ls.section, background: 'rgba(255,255,255,0.01)' }}>
        <div style={ls.sectionInner}>
          <div style={ls.sectionLabel}>The Difference</div>
          <h2 style={ls.sectionTitle}>Not a chatbox. A sovereign AI workspace.</h2>
          <div style={ls.stepsRow}>
            {[
              { n: '01', title: 'Prompt', desc: 'Type your intent. Route it to any of 32 specialists automatically.' },
              { n: '02', title: 'Execute', desc: 'Agents build files, run audits, deploy code — all with your approval.' },
              { n: '03', title: 'Evolve', desc: 'The studio analyzes your patterns overnight and proposes improvements to itself.' },
            ].map(step => (
              <div key={step.n} style={ls.stepCard}>
                <div style={ls.stepNum}>{step.n}</div>
                <h3 style={ls.stepTitle}>{step.title}</h3>
                <p style={ls.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────── */}
      <section id="pricing" style={ls.section}>
        <div style={ls.sectionInner}>
          <div style={ls.sectionLabel}>Pricing</div>
          <h2 style={ls.sectionTitle}>Fair pricing. Full power.</h2>
          <div style={ls.pricingGrid}>
            {PRICING.map(plan => (
              <div
                key={plan.name}
                style={{
                  ...ls.pricingCard,
                  borderColor: plan.popular ? plan.color : 'rgba(255,255,255,0.07)',
                  boxShadow: plan.popular ? `0 0 40px ${plan.color}15` : 'none',
                }}
              >
                {plan.popular && (
                  <div style={{ ...ls.popularBadge, background: plan.color }}>Most Popular</div>
                )}
                <h3 style={ls.planName}>{plan.name}</h3>
                <div style={ls.planPrice}>
                  <span style={{ ...ls.planPriceNum, color: plan.color }}>{plan.price}</span>
                  <span style={ls.planPeriod}>{plan.period}</span>
                </div>
                <ul style={ls.planFeatures}>
                  {plan.features.map(f => (
                    <li key={f} style={ls.planFeature}>
                      <span style={{ color: plan.color, marginRight: 8 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleEnter}
                  style={{
                    ...ls.planBtn,
                    background: plan.popular ? `linear-gradient(135deg, ${plan.color}, #7c3aed)` : 'transparent',
                    borderColor: plan.color,
                    color: plan.popular ? '#000' : plan.color,
                  }}
                >
                  {plan.popular ? 'Start Free Trial' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ───────────────────────────────────────────── */}
      <section style={ls.ctaSection}>
        <div style={ls.ctaGlow} />
        <h2 style={ls.ctaTitle}>Ready to evolve?</h2>
        <p style={ls.ctaSub}>Join developers building the future with AI that builds back.</p>
        <button onClick={handleEnter} style={ls.ctaBtn}>
          Launch Evo Studio →
        </button>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer style={ls.footer}>
        <div style={ls.footerInner}>
          <div style={ls.footerLogo}>
            <div style={ls.navLogoIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" stroke="#00f0ff" strokeWidth="1.5" fill="none"/>
                <circle cx="12" cy="12" r="3" fill="#00f0ff"/>
              </svg>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700 }}>
              PROMPTHOUSE EVO STUDIO
            </span>
          </div>
          <p style={ls.footerNote}>Built to evolve. Designed to stay sovereign.</p>
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.05; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.5); }
        }
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

const ls = {
  root: {
    minHeight: '100vh', background: '#050508',
    color: '#fff', fontFamily: "'Inter', -apple-system, sans-serif",
    overflowX: 'hidden',
  },
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    transition: 'background 0.3s, backdrop-filter 0.3s',
    borderBottom: '1px solid rgba(255,255,255,0)',
  },
  navInner: {
    maxWidth: 1200, margin: '0 auto', padding: '16px 24px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  navLogo: { display: 'flex', alignItems: 'center', gap: 10 },
  navLogoIcon: {
    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 8,
  },
  navBrand: {
    fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', color: '#fff',
  },
  navLinks: { display: 'flex', alignItems: 'center', gap: 24 },
  navLink: {
    color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13, fontWeight: 600,
    transition: 'color 0.2s',
  },
  navCta: {
    padding: '8px 18px', borderRadius: 8,
    background: 'rgba(0,240,255,0.12)', border: '1px solid rgba(0,240,255,0.3)',
    color: '#00f0ff', fontSize: 12, fontWeight: 800, cursor: 'pointer',
    fontFamily: 'inherit', transition: 'all 0.2s', letterSpacing: '0.02em',
  },
  hero: {
    minHeight: '100vh', position: 'relative',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '120px 24px 80px', textAlign: 'center', overflow: 'hidden',
  },
  heroGlow1: {
    position: 'absolute', width: 800, height: 800, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,240,255,0.07) 0%, transparent 70%)',
    top: '50%', left: '50%', transform: 'translate(-50%, -60%)',
    pointerEvents: 'none',
  },
  heroGlow2: {
    position: 'absolute', width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
    bottom: '10%', right: '-10%', pointerEvents: 'none',
  },
  heroContent: { position: 'relative', zIndex: 2, maxWidth: 700 },
  heroBadge: {
    display: 'inline-flex', alignItems: 'center',
    padding: '6px 16px', borderRadius: 100,
    background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)',
    fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
    color: 'rgba(255,255,255,0.7)', marginBottom: 24,
  },
  heroTitle: {
    fontSize: 'clamp(40px, 6vw, 72px)',
    fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1,
    margin: '0 0 20px',
  },
  heroSub: {
    fontSize: 'clamp(15px, 2vw, 18px)', color: 'rgba(255,255,255,0.5)',
    lineHeight: 1.6, margin: '0 0 36px', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto',
  },
  heroActions: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  heroPrimaryBtn: {
    padding: '16px 36px', borderRadius: 14,
    background: 'linear-gradient(135deg, #00f0ff, #7c3aed)',
    border: 'none', color: '#000', fontSize: 15, fontWeight: 900,
    cursor: 'pointer', letterSpacing: '0.02em', fontFamily: 'inherit',
    transition: 'transform 0.2s, opacity 0.2s',
  },
  heroSecondaryBtn: {
    padding: '16px 28px', borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 700,
    textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
    transition: 'border-color 0.2s',
  },
  heroNote: { fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 16 },
  heroGrid: {
    position: 'absolute', inset: 0, zIndex: 1,
    display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)',
    gridTemplateRows: 'repeat(8, 1fr)', padding: 40,
    pointerEvents: 'none',
  },
  section: {
    padding: 'clamp(60px, 8vw, 120px) 24px',
  },
  sectionInner: { maxWidth: 1200, margin: '0 auto' },
  sectionLabel: {
    fontSize: 10, fontWeight: 800, letterSpacing: '0.2em',
    color: '#00f0ff', textTransform: 'uppercase', marginBottom: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900,
    letterSpacing: '-0.02em', textAlign: 'center', margin: '0 0 60px',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 20,
  },
  featureCard: {
    padding: 28, borderRadius: 20,
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
    transition: 'border-color 0.2s, transform 0.2s',
  },
  featureIcon: {
    width: 48, height: 48, fontSize: 22,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, border: '1px solid', marginBottom: 16,
  },
  featureTitle: {
    fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 8, margin: '0 0 8px',
  },
  featureDesc: {
    fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0,
  },
  stepsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32,
  },
  stepCard: { padding: '24px 0' },
  stepNum: {
    fontSize: 40, fontWeight: 900, color: 'rgba(0,240,255,0.15)',
    fontVariantNumeric: 'tabular-nums', marginBottom: 16, lineHeight: 1,
  },
  stepTitle: { fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 10px' },
  stepDesc: { fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 },
  pricingGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24,
  },
  pricingCard: {
    padding: '32px 28px', borderRadius: 24, border: '1px solid',
    background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden',
  },
  popularBadge: {
    position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
    padding: '4px 16px', borderRadius: '0 0 10px 10px',
    fontSize: 10, fontWeight: 900, color: '#000', letterSpacing: '0.1em',
  },
  planName: { fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 16px' },
  planPrice: { display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 },
  planPriceNum: { fontSize: 44, fontWeight: 900, letterSpacing: '-0.03em' },
  planPeriod: { fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 600 },
  planFeatures: { listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 },
  planFeature: { fontSize: 13, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'flex-start' },
  planBtn: {
    width: '100%', padding: '13px', borderRadius: 12, border: '1px solid',
    fontSize: 13, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit',
    letterSpacing: '0.03em', transition: 'opacity 0.2s',
  },
  ctaSection: {
    padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden',
  },
  ctaGlow: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,240,255,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  ctaTitle: {
    fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900,
    letterSpacing: '-0.03em', margin: '0 0 16px', position: 'relative',
  },
  ctaSub: {
    fontSize: 16, color: 'rgba(255,255,255,0.45)', margin: '0 0 36px', position: 'relative',
  },
  ctaBtn: {
    padding: '18px 48px', borderRadius: 16,
    background: 'linear-gradient(135deg, #00f0ff, #7c3aed)',
    border: 'none', color: '#000', fontSize: 16, fontWeight: 900,
    cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.02em',
    position: 'relative',
  },
  footer: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    padding: '32px 24px',
  },
  footerInner: {
    maxWidth: 1200, margin: '0 auto',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: 16,
  },
  footerLogo: { display: 'flex', alignItems: 'center', gap: 10 },
  footerNote: { fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0 },
};

export default LandingPage;
