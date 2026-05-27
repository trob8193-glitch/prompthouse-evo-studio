import React, { useState, useEffect, useRef } from 'react';

/**
 * PH EVO STUDIO — AI MODEL SELECTOR
 * ═══════════════════════════════════════════════════════════════
 * A premium dropdown UI component that mirrors the Antigravity IDE
 * model picker. Allows the user (or daemons via API) to switch
 * the active AI model powering the studio brain.
 * ═══════════════════════════════════════════════════════════════
 */

const TIER_BADGES = {
  fast: { label: 'Fast', color: '#00e676', icon: '⚡' },
  high: { label: 'High', color: '#448aff', icon: '🔷' },
  thinking: { label: 'Thinking', color: '#e040fb', icon: '🧠' },
  local: { label: 'Local', color: '#ffab40', icon: '💻' },
};

const PROVIDER_ICONS = {
  gemini: '✦',
  openai: '◉',
  anthropic: '◈',
  ollama: '⬡',
  custom: '⬢',
};

export default function ModelSelector() {
  const [models, setModels] = useState({});
  const [activeModel, setActiveModel] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchModels() {
    try {
      const res = await fetch('/api/ai/models');
      const data = await res.json();
      setModels(data.models || {});
      setActiveModel(data.activeModel || null);
    } catch {
      // Fallback: use hardcoded registry for offline/demo mode
      setModels({
        gemini: [
          { id: 'gemini-2.5-pro', displayName: 'Gemini 2.5 Pro', tier: 'high', online: true },
          { id: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash', tier: 'fast', online: true },
          { id: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash', tier: 'fast', online: true },
        ],
        openai: [
          { id: 'gpt-4o', displayName: 'GPT-4o', tier: 'high', online: true },
          { id: 'gpt-4o-mini', displayName: 'GPT-4o Mini', tier: 'fast', online: true },
          { id: 'o3', displayName: 'o3', tier: 'thinking', online: true },
        ],
        anthropic: [
          { id: 'claude-sonnet-4', displayName: 'Claude Sonnet 4', tier: 'high', online: true },
          { id: 'claude-opus-4', displayName: 'Claude Opus 4', tier: 'thinking', online: true },
        ],
        ollama: [
          { id: 'evo-lm-local', displayName: 'EvoLM (Local)', tier: 'local', online: true },
          { id: 'llama3-local', displayName: 'Llama 3 (Local)', tier: 'local', online: true },
        ],
      });
      setActiveModel({ id: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash', tier: 'fast', provider: 'gemini' });
    } finally {
      setLoading(false);
    }
  }

  async function selectModel(modelId) {
    try {
      const res = await fetch('/api/ai/models/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId }),
      });
      const data = await res.json();
      if (data.activeModel) setActiveModel(data.activeModel);
    } catch {
      // Offline mode: just set locally
      const allModels = Object.values(models).flat();
      const found = allModels.find(m => m.id === modelId);
      if (found) setActiveModel(found);
    }
    setIsOpen(false);
  }

  if (loading) {
    return (
      <div style={styles.trigger}>
        <span style={styles.triggerIcon}>🧠</span>
        <span style={styles.triggerText}>Loading models...</span>
      </div>
    );
  }

  const activeTier = activeModel ? TIER_BADGES[activeModel.tier] : TIER_BADGES.fast;

  return (
    <div ref={dropdownRef} style={styles.container}>
      {/* Trigger Button */}
      <button
        id="model-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...styles.trigger,
          borderColor: isOpen ? activeTier.color : 'rgba(255,255,255,0.1)',
        }}
      >
        <span style={styles.triggerIcon}>{activeTier.icon}</span>
        <span style={styles.triggerText}>
          {activeModel ? activeModel.displayName : 'Select Model'}
        </span>
        <span
          style={{
            ...styles.tierBadge,
            background: activeTier.color + '22',
            color: activeTier.color,
          }}
        >
          {activeTier.label}
        </span>
        <span style={styles.chevron}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>Select AI Model</div>
          {Object.entries(models).map(([provider, providerModels]) => (
            <div key={provider}>
              <div style={styles.providerHeader}>
                <span style={styles.providerIcon}>{PROVIDER_ICONS[provider] || '●'}</span>
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </div>
              {providerModels.map((model) => {
                const tier = TIER_BADGES[model.tier] || TIER_BADGES.fast;
                const isActive = activeModel && activeModel.id === model.id;
                return (
                  <button
                    key={model.id}
                    id={`model-option-${model.id}`}
                    onClick={() => selectModel(model.id)}
                    style={{
                      ...styles.modelOption,
                      background: isActive
                        ? 'rgba(255,255,255,0.08)'
                        : 'transparent',
                      borderLeft: isActive
                        ? `3px solid ${tier.color}`
                        : '3px solid transparent',
                    }}
                  >
                    <span style={styles.modelName}>{model.displayName}</span>
                    <span
                      style={{
                        ...styles.tierBadgeSmall,
                        background: tier.color + '22',
                        color: tier.color,
                      }}
                    >
                      {tier.label} {tier.icon}
                    </span>
                    {!model.online && (
                      <span style={styles.offlineBadge}>Offline</span>
                    )}
                    {isActive && <span style={styles.checkmark}>✓</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    display: 'inline-block',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    zIndex: 9999,
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#e0e0e0',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(12px)',
    outline: 'none',
  },
  triggerIcon: {
    fontSize: '16px',
  },
  triggerText: {
    fontWeight: 500,
    letterSpacing: '0.02em',
  },
  tierBadge: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  chevron: {
    fontSize: '10px',
    opacity: 0.5,
    marginLeft: '4px',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    minWidth: '320px',
    maxHeight: '420px',
    overflowY: 'auto',
    background: 'rgba(18, 18, 24, 0.98)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    padding: '8px 0',
    animation: 'fadeInDown 0.15s ease-out',
  },
  dropdownHeader: {
    padding: '10px 16px 8px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'rgba(255,255,255,0.35)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    marginBottom: '4px',
  },
  providerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px 4px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'rgba(255,255,255,0.5)',
  },
  providerIcon: {
    fontSize: '12px',
  },
  modelOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '9px 16px',
    border: 'none',
    color: '#d4d4d4',
    cursor: 'pointer',
    fontSize: '13px',
    textAlign: 'left',
    transition: 'background 0.15s ease',
  },
  modelName: {
    flex: 1,
    fontWeight: 500,
  },
  tierBadgeSmall: {
    padding: '1px 6px',
    borderRadius: '3px',
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.04em',
  },
  offlineBadge: {
    padding: '1px 6px',
    borderRadius: '3px',
    fontSize: '10px',
    fontWeight: 600,
    background: 'rgba(255,82,82,0.15)',
    color: '#ff5252',
  },
  checkmark: {
    color: '#00e676',
    fontWeight: 700,
    fontSize: '14px',
  },
};
