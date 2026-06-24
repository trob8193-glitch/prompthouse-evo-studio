# Full UI Button-to-Route Matrix

**Generated**: 2026-06-24T09:54:26.583Z
**Components Scanned**: 190
**Known Backend Routes**: 323
**Potential Dead Links Detected**: 10

## Matrix

### src\agent-bridge-views.jsx
**Interactive Controls**: 
- RESCAN_VAULT
- console.log('Clearing receipts...')}>CLEAR_RECEIPTS

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\AgentBridgeView.jsx
**Interactive Controls**: 
- { navigator.clipboard.writeText(MASTER_INSTRUCTIONS); setCopied('instr'); setTimeout(()=>setCopied(''),1500); }}>
                {copied === 'instr' ? '✅ Copied!' : '📋 Copy Instructions'}
- { navigator.clipboard.writeText(JSON.stringify(OPENAI_ACTIONS, null, 2)); setCopied('schema'); setTimeout(()=>setCopied(''),1500); }}>
                {copied === 'schema' ? '✅ Copied!' : '📋 Copy Actions Schema'}
- setStrictEthicsMode(!strictEthicsMode)}
                style={{ background: strictEthicsMode ? 'var(--accent-violet)' : 'transparent', borderColor: 'var(--accent-violet)' }}
              >
                {strictEthicsMode ? '✅ ETHICS ACTIVE' : '⭕ DISABLE ETHICS'}
- downloadFile('PH_EVO_MASTER_AGENCY.md', MASTER_INSTRUCTIONS)}>⬇️ Download Master Agency Kit (.md)
- downloadFile('PH_EVO_OPENAI_ACTIONS.json', JSON.stringify(OPENAI_ACTIONS, null, 2))}>⬇️ Download API Actions (.json)

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\ai-prompt-generator-view.jsx
**Interactive Controls**: 
- {copied ? '✓ Copied' : 'Copy'}
- setDomain(d.id)} style={{
                background: domain === d.id ? `${d.color}22` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${domain === d.id ? d.color : 'rgba(255,255,255,0.1)'}`,
                color: domain === d.id ? d.color : '#666', borderRadius: 6, padding: '5px 10px',
                fontSize: 11, cursor: 'pointer', fontWeight: domain === d.id ? 700 : 400,
              }}>
                {d.icon} {d.name}
- setStrictness(m.id)} style={{
                background: strictness === m.id ? 'rgba(245,200,66,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${strictness === m.id ? '#f5c842' : 'rgba(255,255,255,0.1)'}`,
                color: strictness === m.id ? '#f5c842' : '#666', borderRadius: 6, padding: '5px 10px',
                fontSize: 11, cursor: 'pointer', fontWeight: strictness === m.id ? 700 : 400,
              }}>
                {m.icon} {m.name}
- {loading ? '⏳ Generating...' : '🧬 Generate Prompt Stack + Live AI Response'}
- setActiveOutput(k)} style={{
                background: activeOutput === k ? `${color}22` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeOutput === k ? color : 'rgba(255,255,255,0.1)'}`,
                color: activeOutput === k ? color : '#666', borderRadius: 6, padding: '5px 12px',
                fontSize: 11, cursor: 'pointer', fontWeight: activeOutput === k ? 700 : 400,
              }}>{label}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\ai-views.jsx
**Interactive Controls**: 
- EXECUTE

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\app\AppShell.jsx
**Interactive Controls**: 
- setActiveTab('workspace')} className={`text-left hover:text-white transition-colors ${activeTab === 'workspace' ? 'text-white' : ''}`}>Workspace
- setActiveTab('local-intel')} className={`text-left hover:text-[#00ffcc] transition-colors ${activeTab === 'local-intel' ? 'text-[#00ffcc]' : ''}`}>Local Intelligence
- setActiveTab('omni')} className={`text-left hover:text-white transition-colors ${activeTab === 'omni' ? 'text-white' : ''}`}>Omni-Tether
- setActiveTab('forge')} className={`text-left hover:text-white transition-colors ${activeTab === 'forge' ? 'text-white' : ''}`}>Forge
- setActiveTab('ledger')} className={`text-left hover:text-white transition-colors ${activeTab === 'ledger' ? 'text-white' : ''}`}>Value Ledger

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\App.jsx
**Interactive Controls**: 
- setSingularityActive(true)} 
            className="absolute top-16 right-4 z-50 bg-[#00f0ff]/10 text-[#00f0ff] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-[#00f0ff]/30 hover:bg-[#00f0ff]/20 shadow-[0_0_20px_rgba(0,240,255,0.15)] flex items-center gap-2 group transition-all duration-300"
          >
            
            Open Evo Singularity Engine
- setMobileMenuOpen(true)} className="text-white p-2">

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\autonomous-command-center.jsx
**Interactive Controls**: 
- 🔄 Self-Build
- {isUnbound ? '⚠️ UNBOUND DEPLOYMENT MODE' : 'Enable Automated Deployment'}
- setActiveTab(t.id)}
            style={{ 
              background: activeTab === t.id ? '#1e293b' : 'transparent', 
              color: activeTab === t.id ? 'white' : '#94a3b8', 
              border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' 
            }}
          >
            {t.label}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\autonomous-views.jsx
**Interactive Controls**: 
- {building ? '🔄 Building...' : '🚀 Build App — Full Autonomous'}
- downloadAsZip(result.app)}>
                  📦 Download ZIP
- 💾 Write to Local Disk
- {
                        navigator.clipboard.writeText(result.app.files[selectedFile]);
                      }}>📋 Copy
- {
                        downloadFile(selectedFile, result.app.files[selectedFile]);
                      }}>💾 Save

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\chrome-extension-views.jsx
**Interactive Controls**: 
- Write Extension to Disk
- navigator.clipboard.writeText(`generated_apps/${extension.name}`)}>Copy Load Path
- Save Current File
- setSelectedFile(file)}>
                  {file}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\commerce-rail-view.jsx
**Interactive Controls**: 
- {loading ?  : }
                Generate Checkout Session

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\AiProviderProofPanel.jsx
**Interactive Controls**: 
- handleProbe('openai')}
                disabled={!approvalEnvelope || probeLoading}
                style={{
                  flex: 1, padding: '10px', borderRadius: '6px',
                  background: !approvalEnvelope ? 'var(--bg-surface)' : 'var(--accent-indigo)',
                  color: !approvalEnvelope ? 'var(--text-dim)' : '#fff',
                  border: !approvalEnvelope ? '1px solid var(--border-subtle)' : 'none', 
                  cursor: !approvalEnvelope ? 'not-allowed' : 'pointer',
                  fontSize: '12px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                 Run OpenAI Safe Probe
- handleProbe('gemini')}
                disabled={!approvalEnvelope || probeLoading}
                style={{
                  flex: 1, padding: '10px', borderRadius: '6px',
                  background: !approvalEnvelope ? 'var(--bg-surface)' : 'var(--accent-indigo)',
                  color: !approvalEnvelope ? 'var(--text-dim)' : '#fff',
                  border: !approvalEnvelope ? '1px solid var(--border-subtle)' : 'none', 
                  cursor: !approvalEnvelope ? 'not-allowed' : 'pointer',
                  fontSize: '12px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                 Run Gemini Safe Probe

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\AppMarket.jsx
**Interactive Controls**: 
- Connect Bank
- launchApp(project.id)}
                                            disabled={launching === project.id}
                                            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2.5 px-4 rounded-3xl flex items-center justify-center transition-colors disabled:opacity-50"
                                        >
                                            {launching === project.id ? (
                                                
                                            ) : (
                                                <>
                                                    
                                                    Launch
                                                
                                            )}
- launchApp(project.id)}
                                            disabled={launching === project.id}
                                            aria-label={`Open ${project.name}`}
                                            className="bg-gray-800 hover:bg-gray-700 text-white p-2.5 rounded-3xl transition-colors flex items-center justify-center disabled:opacity-50"
                                        >
- handleBuyApp(project.id)}
                                        className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-neon-cyan font-bold py-2.5 px-4 rounded-3xl flex items-center justify-center transition-colors border-blue-500/30"
                                    >
                                        
                                        Buy App ($9.00)

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\AutonomousSelfRepairBoundary.jsx
**Interactive Controls**: 
- {
                  useSovereignStore.getState().rollbackState(); // Revert any bad mutations
                  window.location.reload();
                }}
                className="mt-4 px-6 py-2 bg-[#00f0ff] text-black font-bold uppercase tracking-widest rounded hover:bg-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.5)]"
              >
                Rollback State & Re-Ignite

**API Calls Triggered**:
- `/api/intelligence/execute` -> ✅ ALIVE

---

### src\components\BotAutomationDeck.jsx
**Interactive Controls**: 
- handleSync('trello')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${syncing.trello ? 'bg-black/40 backdrop-blur-md border-white/5 text-slate-500' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
              >
                {syncing.trello ? 'SYNCING...' : 'SYNC NOW'}
- handleSync('slack')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${syncing.slack ? 'bg-black/40 backdrop-blur-md border-white/5 text-slate-500' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
              >
                {syncing.slack ? 'SYNCING...' : 'SYNC NOW'}
- setPermissionsVisible((value) => !value)}
          aria-expanded={permissionsVisible}
          className="flex items-center gap-2 text-neon-cyan text-xs font-bold hover:text-indigo-300 transition-colors"
        >
          MANAGE PERMISSIONS

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\Dashboard.jsx
**Interactive Controls**: 
- console.log('Window minimized')}>_
- console.log('Window closed')}>X

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\DeploymentControlPanel.jsx
**Interactive Controls**: 
- {deploying ? 'Requesting Deploy...' : 'Request Vercel Preview Deploy'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\ErrorBoundary.jsx
**Interactive Controls**: 
- Retry

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\EvoCopilot.jsx
**Interactive Controls**: 
- Run in Terminal
- {applied ?  : }
                      {applied ? 'Applied!' : 'Apply to File'}
- setActivePage('settings')}
              className="p-2 rounded-lg hover:bg-gray-800/70 hover:shadow-lg transition-colors"
            >
- {
                setSelectedBot(bot.id);
                if (COPILOT_LAYOUTS.some(l => l.id === bot.id)) {
                  setActiveLayout(bot.id);
                }
              }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-black tracking-wider transition border ${
                selectedBot === bot.id
                  ? 'text-white border-transparent shadow-lg'
                  : 'text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200 bg-slate-800/50'
              }`}
              style={selectedBot === bot.id ? { backgroundColor: bot.palette?.primary || '#10b981', boxShadow: `0 0 12px ${bot.palette?.primary || '#10b981'}40` } : {}}
              title={bot.role}
            >
              {bot.icon} {bot.name}
- handleQuickAction('debt')} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gray-800/50 border border-gray-700/40 rounded-xl text-[11px] font-bold text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-gray-600 transition-all hover:shadow-lg cursor-pointer">
           Scan Debt
- handleQuickAction('audit')} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gray-800/50 border border-gray-700/40 rounded-xl text-[11px] font-bold text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-gray-600 transition-all hover:shadow-lg cursor-pointer">
           Nuclear Audit
- handleQuickAction('evolve')} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-xl text-[11px] font-bold text-purple-300 hover:bg-purple-800/40 hover:text-purple-100 hover:border-purple-400/50 transition-all hover:shadow-[0_0_12px_rgba(168,85,247,0.2)] cursor-pointer">
           Evolve Module
- handleQuickAction('singularity')} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-red-900/30 border border-red-500/30 rounded-xl text-[11px] font-bold text-red-300 hover:bg-red-800/40 hover:text-red-100 hover:border-red-400/50 transition-all hover:shadow-[0_0_12px_rgba(239,68,68,0.3)] cursor-pointer">
           Singularity
- handleQuickAction('deploy')} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-emerald-900/30 border border-emerald-500/30 rounded-xl text-[11px] font-bold text-emerald-300 hover:bg-emerald-800/40 hover:text-emerald-100 hover:border-emerald-400/50 transition-all hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer">
           Deploy
- handleQuickAction('health')} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-cyan-900/30 border border-cyan-500/30 rounded-xl text-[11px] font-bold text-cyan-300 hover:bg-cyan-800/40 hover:text-cyan-100 hover:border-cyan-400/50 transition-all hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer">
           Suit Health
- handleQuickAction('evo-eyes')} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-violet-900/30 border border-violet-500/30 rounded-xl text-[11px] font-bold text-violet-300 hover:bg-violet-800/40 hover:text-violet-100 hover:border-violet-400/50 transition-all hover:shadow-[0_0_12px_rgba(139,92,246,0.3)] cursor-pointer">
           Evo Eyes
- handleQuickAction('swarm')} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-amber-900/30 border border-amber-500/30 rounded-xl text-[11px] font-bold text-amber-300 hover:bg-amber-800/40 hover:text-amber-100 hover:border-amber-400/50 transition-all hover:shadow-[0_0_12px_rgba(245,158,11,0.3)] cursor-pointer">
           Swarm Build
- {/* Pulse glow (pseudo-element) */}
              {isRecording && }
- {loading ?  : }

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\EvoCopilot_original.jsx
**Interactive Controls**: 
- Run in Terminal
- {applied ?  : }
                      {applied ? 'Applied!' : 'Apply to File'}
- setActivePage('settings')}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
            >
- setSelectedBot(bot.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-black tracking-wider transition border ${
                selectedBot === bot.id
                  ? 'text-white border-transparent shadow-lg'
                  : 'text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200 bg-slate-800/50'
              }`}
              style={selectedBot === bot.id ? { backgroundColor: bot.palette?.primary || '#10b981' } : {}}
              title={bot.role}
            >
              {bot.icon} {bot.name}
- {loading ?  : }

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\EvoEyes.jsx
**Interactive Controls**: 
- setSingularityLayer(layer.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                singularityLayer === layer.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              
              {layer.label}
- {isEvolving ?  : }
            {isEvolving ? 'Evolving UI...' : 'UI Evolution'}
- setEvoEyesActive(false)} className="text-slate-500 hover:text-white transition-colors">
- setSelectedNode(null)} className="text-slate-500 hover:text-white">

**API Calls Triggered**:
- `/api/intelligence/execute` -> ✅ ALIVE
- `/api/intelligence/execute` -> ✅ ALIVE
- `/api/platform-sentinel/status` -> ✅ ALIVE

---

### src\components\GhostEditor.jsx
**Interactive Controls**: (No static buttons found)

**API Calls Triggered**:
- `/api/intelligence/execute` -> ✅ ALIVE
- `/api/feedback-adaptation` -> ✅ ALIVE
- `/api/intelligence/execute` -> ✅ ALIVE
- `/api/feedback-adaptation` -> ✅ ALIVE

---

### src\components\liveforge\EvoLiveForgePreview.jsx
**Interactive Controls**: 
- sendToPromptBridge("improve_preview")}>Ask Evo LM
- sendToPromptBridge("export_artifact")}>Export
- sendToPromptBridge("send_to_forgerail")}>ForgeRail
- Local Proof

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\liveforge\EvoMobileController.jsx
**Interactive Controls**: 
- setActiveTab('local-cli')}>Local CLI Emulator Controller
- setActiveTab('cloud-appetize')}>Cloud Appetize.io Streamer
- {isLoadingDevices ? 'Searching...' : '🔄 Refresh List'}
- { e.stopPropagation(); handleBootLocalDevice(d); }}>
                          🚀 Boot Virtual Machine
- 📥 Install to Booted Simulator
- 📜 Read Native Logs
- 📤 Package & Stream to Appetize

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\MatrixTerminal.jsx
**Interactive Controls**: 
- setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\ModelSelector.jsx
**Interactive Controls**: 
- setIsOpen(!isOpen)}
        style={{
          ...styles.trigger,
          borderColor: isOpen ? activeTier.color : (isCopilot ? 'var(--hologram-color-40)' : 'rgba(255,255,255,0.1)'),
          background: isCopilot ? 'transparent' : 'rgba(255,255,255,0.04)',
          color: isCopilot ? 'var(--hologram-color)' : '#e0e0e0',
          boxShadow: isCopilot && isOpen ? `0 0 15px ${activeTier.color}40` : (isCopilot ? '0 0 8px var(--hologram-color-20)' : 'none'),
          textShadow: isCopilot ? '0 0 5px var(--hologram-color)' : 'none',
        }}
      >
        {activeTier.icon}
        
          {activeModel ? activeModel.displayName : 'Select Model'}
        
        
          {activeTier.label}
        
        {isOpen ? '▲' : '▼'}
- selectModel(model.id)}
                    style={{
                      ...styles.modelOption,
                      fontFamily: isCopilot ? 'monospace' : 'inherit',
                      background: isActive
                        ? (isCopilot ? 'var(--hologram-color-20)' : 'rgba(255,255,255,0.08)')
                        : 'transparent',
                      borderLeft: isActive
                        ? `3px solid ${isCopilot ? 'var(--hologram-color)' : tier.color}`
                        : '3px solid transparent',
                      color: isCopilot ? (isActive ? '#fff' : 'var(--hologram-color-80)') : '#d4d4d4',
                      textShadow: isCopilot && isActive ? '0 0 5px var(--hologram-color)' : 'none',
                    }}
                  >
                    {model.displayName}
                    
                      {tier.label} {tier.icon}
                    
                    {!model.online && (
                      Offline
                    )}
                    {isActive && ✓}

**API Calls Triggered**:
- `/api/ai/models` -> ✅ ALIVE
- `/api/ai/models/select` -> ✅ ALIVE

---

### src\components\Navigation.jsx
**Interactive Controls**: 
- {
                  setActiveGroup(group.id);
                  if (collapsed) toggleSidebar();
                }}
                title={group.label}
                style={{
                  width: 44, height: 44, borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-dim)',
                  background: isActive ? 'var(--accent-cyan-dim)' : 'transparent',
                  marginBottom: 8, transition: 'var(--transition)',
                  position: 'relative', border: 'none', cursor: 'pointer',
                  boxShadow: isActive ? 'var(--shadow-glass)' : 'none'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--accent-cyan)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-dim)'; }}
              >
                {isActive && }
- setActivePage(item.id)}
                    className={isActive ? "hologram-text-glow-accent" : "hologram-text-glow"}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                      padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                      fontSize: 13, fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'white' : 'var(--text-secondary)',
                      background: isActive ? 'var(--accent-cyan-dim)' : 'transparent',
                      border: '1px solid transparent', textAlign: 'left', marginBottom: 4,
                      transition: 'var(--transition)', borderColor: isActive ? 'var(--border-neon)' : 'transparent',
                      boxShadow: isActive ? 'var(--shadow-glass), inset 0 0 20px rgba(0,240,255,0.05)' : 'none'
                    }}
                    onMouseEnter={e => { if (!isActive) Object.assign(e.currentTarget.style, { background: 'var(--bg-glass-light)', color: 'white' }); }}
                    onMouseLeave={e => { if (!isActive) Object.assign(e.currentTarget.style, { background: 'transparent', color: 'var(--text-secondary)' }); }}
                  >
                    
                    {item.label}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\NightForgePanel.jsx
**Interactive Controls**: 
- {loading ? 'Running...' : 'Force Run'}
- Force Scan
- {swarmLoading ? 'SPAWNING SWARM AGENTS...' : 'BUILD VIA SWARM'}

**API Calls Triggered**:
- `/api/autonomy/intents` -> ❌ DEAD LINK / UNREGISTERED
- `/api/agi/health` -> ✅ ALIVE
- `/api/autonomy/intent/scan` -> ❌ DEAD LINK / UNREGISTERED
- `/api/evo-lm/swarm-build` -> ❌ DEAD LINK / UNREGISTERED

---

### src\components\OwnerApprovalPanel.jsx
**Interactive Controls**: 
- Approve
- Grant Explicit Approval

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\OwnerApprovalRail.jsx
**Interactive Controls**: 
- handleDecision(false)}
            disabled={processing}
            style={{ flex: 1, background: 'transparent', color: '#f8fafc', border: '1px solid #ef4444', padding: '12px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
             Reject & Suspend
- handleDecision(true)}
            disabled={processing}
            style={{ flex: 1, background: '#ef4444', color: '#f8fafc', border: 'none', padding: '12px', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
             Authorize Action

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\primitives.jsx
**Interactive Controls**: 
- {variant === 'primary' && }
      
        {loading ?  ENGAGING... : children}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\SingularityEngineOverlay.jsx
**Interactive Controls**: 
- setSingularityActive(false)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-mid)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              transition: 'all 0.2s',
            }}
          >
- setSingularityLayer(l.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: singularityLayer === l.id ? 'var(--accent-gold-dim)' : 'transparent',
                      border: '1px solid',
                      borderColor: singularityLayer === l.id ? 'var(--accent-gold-glow)' : 'transparent',
                      color: singularityLayer === l.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    
                    {l.label}

**API Calls Triggered**:
- `/api/platform-sentinel/status` -> ✅ ALIVE

---

### src\components\SovereignTabs.jsx
**Interactive Controls**: 
- setActiveTab(tab.id)}
                className={`relative px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-500 ${
                  isActive 
                    ? 'text-white scale-110 shadow-[0_0_30px_rgba(0,240,255,0.6)]' 
                    : 'text-cyan-900 hover:text-cyan-400 hover:scale-105'
                }`}
                style={{
                  transform: isActive ? 'translateZ(30px)' : 'translateZ(0px)',
                  background: isActive ? 'linear-gradient(180deg, rgba(0,240,255,0.2) 0%, rgba(0,0,0,0.8) 100%)' : 'transparent',
                  border: isActive ? '1px solid rgba(0,240,255,0.8)' : '1px solid transparent'
                }}
              >
                {/* Active Light Beam */}
                {isActive && (
                  
                )}
                {/* Active Underglow */}
                {isActive && (
                  
                )}
                
                  {tab.icon && } {tab.label}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\StripeProofPanel.jsx
**Interactive Controls**: 
- {probeLoading ? 'Probing...' : 'Run Test Account Probe'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\StripeTestCheckoutPanel.jsx
**Interactive Controls**: 
- {sessionLoading ? 'Creating Session...' : 'Create Stripe Test Checkout Session'}
- {recordingLoading ? 'Recording...' : 'Record Browser Verification Run'}
- handleUpdateStatus(step.status)}
                        disabled={verificationLoading || browserRun.status === step.status}
                        style={{
                          padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-subtle)',
                          background: browserRun.status === step.status ? 'var(--bg-surface-mid)' : 'transparent',
                          color: browserRun.status === step.status ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                          fontSize: '11px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                      >
                        {step.icon} {step.label} {browserRun.status === step.status && '✓'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\Terminal.jsx
**Interactive Controls**: 
- setTerminalOpen(true)}
          className="absolute inset-0 w-full h-full flex items-center px-6 z-50 cursor-pointer group hover:bg-white/5 transition-colors"
          style={{ opacity: terminalOpen ? 0 : 1, pointerEvents: terminalOpen ? 'none' : 'auto' }}
        >
          
          
          
            EvoShell Master Control
          
          
            
            STANDBY
- setActivePane(paneId)}
                    style={{
                      padding: '4px 0', fontSize: 10, fontWeight: 700,
                      border: 'none', borderBottom: activePane === paneId ? `2px solid ${tc.accent}` : '2px solid transparent',
                      cursor: 'pointer', transition: 'all 0.2s',
                      background: 'transparent',
                      color: activePane === paneId ? '#fff' : '#94a3b8',
                    }}
                  >
                    {pane}
- setTerminalTheme(t.id)}
                  style={{
                    width: 10, height: 10, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: t.color,
                    opacity: terminalTheme === t.id ? 1 : 0.3,
                    boxShadow: terminalTheme === t.id ? `0 0 8px ${t.color}` : 'none',
                    transition: 'all 0.2s'
                  }}
                />
              ))}
            

            

            {/* Action Buttons */}
            
              {[
                { icon: Zap, title: 'Debug with AI', onClick: debugWithAI },
                { icon: Copy, title: 'Copy Output', onClick: copyToClipboard },
                { icon: Download, title: 'Download Logs', onClick: downloadLogs },
                { icon: Trash2, title: 'Clear Session', onClick: () => clearTerminal(activeTerminalSession) },
                { icon: isFullscreen ? Minimize2 : Maximize2, title: 'Fullscreen', onClick: () => setIsFullscreen(!isFullscreen) },
                { icon: ChevronDown, title: 'Minimize', onClick: () => setTerminalOpen(false) }
              ].map((btn, i) => (
- { e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = tc.accent; e.currentTarget.style.transform = 'scale(1)'; }}
                >

**API Calls Triggered**:
- `/api/intelligence/execute` -> ✅ ALIVE

---

### src\components\TimeSlipLedger.jsx
**Interactive Controls**: 
- setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
          &times;
- setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
          &times;
- console.log('Exporting slip...')} style={{ background: 'none', border: 'none', padding: 0, fontSize: 10, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}> Export
- console.log('Reverting to commit', commit.id)}>
                 Revert to {commit.id}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\Toolbar.jsx
**Interactive Controls**: 
- console.log('Executing Run.exe...')}>Run.exe
- console.log('Opening Options...')}>Options

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\TopBar.jsx
**Interactive Controls**: 
- {sidebarCollapsed ?  : }
- setShowThemeMenu(!showThemeMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-[10px] font-black tracking-wider hover:bg-white/10 transition-colors"
          >
             METAMORPHOSIS: {globalTheme.layout.toUpperCase()}
- { 
                    setGlobalTheme({ layout: t, ui: t, bots: t, wiring: t, building: t, routing: t, inventing: t, agent: t, brain: t, module: t }); 
                    setShowThemeMenu(false); 
                  }}
                  className={`px-3 py-2 text-left rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    globalTheme.layout === t ? 'bg-cyan-400/10 text-cyan-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {t} Version
- setActivePage('proof-console')}
          className="relative text-slate-400 hover:text-cyan-400 transition-colors p-1.5"
          aria-label="Notifications"
        >
          
          {notifications.length > 0 && (
            
          )}
- setActivePage('settings')}
          className="text-slate-400 hover:text-cyan-400 transition-colors p-1.5"
          aria-label="Settings"
        >

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\VercelPreviewDeployPanel.jsx
**Interactive Controls**: 
- {deploying ?  : }
          {deploying ? 'Deploying to Vercel...' : 'Run Vercel Preview Deploy Proof'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\deploy-rail-view.jsx
**Interactive Controls**: 
- {status === 'deploying' ? '🚀 Deploying...' : '🚀 Start Deploy Rail'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\evo-duel-engine-view.jsx
**Interactive Controls**: 
- setActiveTab(t)} style={btn('#818cf8', activeTab === t)}>
              {t === 'duel' ? '⚔️ Duel' : t === 'matrix' ? '🤖 Bot Matrix' : '📜 History'}
- {loading ? '⏳ Dueling...' : '⚔️ Start Duel'}
- { setResponseA(''); setResponseB(''); setScoreA(undefined); setScoreB(undefined); setPrompt(''); }}
              style={{ ...btn('#f87171'), padding: '10px 16px' }}>Clear

**API Calls Triggered**:
- `/src/prompthouse_50_master_build_prompts.json` -> ✅ ALIVE

---

### src\evo-exchange-view.jsx
**Interactive Controls**: 
- useSovereignStore.getState().addNotification({ msg: 'Publishing to public exchange requires Enterprise Sovereignty.', type: 'warning' })}>
          🌐 Go Public
- setActiveCategory(c.id)}
          >
            {c.label}
- console.log('Selling module...')}>Sell Module

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\AuthSentry.jsx
**Interactive Controls**: 
- {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
- Enter Demo Mode
- { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={styles.switchLink}
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\autonomous\SovereignCommandNexus.jsx
**Interactive Controls**: 
- { fetch(`${getBridgeUrl()}/api/evolution/kill-switch/engage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'Manual nexus wipe' }) }).catch(() => {}); }}>INITIATE WIPE
- { fetch(`${getBridgeUrl()}/status`).then(r => r.json()).then(d => console.log('[Nexus] Route traffic check:', d)).catch(() => {}); }}>ROUTE TRAFFIC

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\autonomous\SynapticForge.jsx
**Interactive Controls**: 
- { const textarea = document.querySelector('textarea'); if (textarea?.value) { console.log('[SynapticForge] Compiling prompt:', textarea.value.substring(0, 100)); } }}>
            COMPILE

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\ConnectionManager.jsx
**Interactive Controls**: 
- {scanning ?  : }
              Auto-Discover
- BLE Pair
- {bonding ?  : }
              Bond Node
- handleBond(null, node.ip)}
                  className="px-3 py-1.5 bg-indigo-600/20 text-neon-cyan hover:bg-indigo-600 hover:text-white rounded text-xs font-bold transition-colors"
                >
                  Bond
- setTargetIp(item.url || item.target || item.ip || '')}
                        className="text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors"
                      >
                        Configure

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\CostFirewallDashboard.jsx
**Interactive Controls**: 
- Refresh
- runEstimate('free')}> Free Plan Probe
- runEstimate('paid')}> Paid Plan Probe
- Clear Cache

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\EvoDiffuserDashboard.jsx
**Interactive Controls**: 
- { if (imageResult?.url) window.open(imageResult.url, '_blank'); }}> EXPORT ASSET

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\EvoEyesView.jsx
**Interactive Controls**: (No static buttons found)

**API Calls Triggered**:
- `/api/agi/evo-eyes/audits` -> ❌ DEAD LINK / UNREGISTERED

---

### src\features\EvoLayoutDashboard.jsx
**Interactive Controls**: 
- setPreviewExpanded((value) => !value)}
                      aria-pressed={previewExpanded}
                      className="text-[#737385] hover:text-[#00f0ff] transition-colors"
                    >
- { if (result?.code) { navigator.clipboard.writeText(result.code); console.log('[EvoLayout] Code copied to clipboard'); } }}> EXPORT
- { console.log('[EvoLayout] Deploying to Forge:', result?.code?.substring(0, 100)); }}>DEPLOY TO FORGE

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\EvoPixelatorDashboard.jsx
**Interactive Controls**: 
- setBitDepth(b)}
                      className={`flex-1 py-2 px-3 rounded-2xl text-xs font-bold border transition-all ${bitDepth === b ? 'bg-[#00ff88]/20 border-[#00ff88] text-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.2)]' : 'bg-[#0a0a10] border-white/10 text-[#737385] hover:border-white/20'}`}
                    >
                      {b}
- { if (imageResult?.url) window.open(imageResult.url, '_blank'); }}> PNG
- console.log('[EvoPixelator] Exporting sprite sheet...') }> SPRITE SHEET

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\EvoPulseGridView.jsx
**Interactive Controls**: 
- triggerTridallIngestion('Analyze SaaS CRM trends', { time: 'Q4' })}
            disabled={tridallState?.status === 'INGESTING'}
          >
            {tridallState?.status === 'INGESTING' ? 'EXTRACTING...' : 'INITIATE INGESTION'}
- console.log('Window closed')}>X

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\ExtensionCockpitView.jsx
**Interactive Controls**: 
- setActivePanel(panel.id)}
        className={`flex items-center gap-4 w-full p-4 rounded-3xl transition-all border ${
          isActive 
            ? 'bg-black/40 backdrop-blur-md border-white/5 border-indigo-500/50 shadow-lg shadow-indigo-500/10' 
            : 'bg-transparent border-transparent hover:bg-black/40 backdrop-blur-md border-white/5/30'
        }`}
      >
        
          
        
        {panel.label}
        {isActive && }

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\FirstRunWizard.jsx
**Interactive Controls**: 
- setStep(2)}
              style={{ background: '#6366f1', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
            >
              Configure Credentials
- onComplete()}
              style={{ background: 'transparent', color: '#64748b', border: 'none', padding: '12px 24px', cursor: 'pointer', width: '100%', marginTop: 8 }}
            >
              Skip for now (Run in Demo Mode)
- setStep(1)}
                style={{ flex: 1, background: '#334155', color: 'white', border: 'none', padding: '10px', borderRadius: 6, cursor: 'pointer' }}
              >
                Back
- {saving ? 'Securing...' : 'Lock in Vault'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\GlobalAPISettingsView.jsx
**Interactive Controls**: 
- {apiConfigSaving ?  : saved ?  : }
          
            {apiConfigSaving ? 'Synchronizing...' : saved ? 'Synchronized' : 'Save Configurations'}
- setShowOpenAiKey(!showOpenAiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-neon-cyan transition-colors"
                  >
                    {showOpenAiKey ?  : }
- setShowVercelKey(!showVercelKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-400 transition-colors"
                  >
                    {showVercelKey ?  : }
- setShowEnvMask(!showEnvMask)}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                {showEnvMask ?  : }
                {showEnvMask ? 'Mask Active' : 'Raw Output'}
- {envSaving ?  : }
                  Inject to Runtime
- {testing ?  : }
                    {testing ? 'Probing...' : 'Run Probe'}
- {generatingKey ?  : }
                Create Key
- {
                      navigator.clipboard.writeText(newKeyPayload);
                      addNotification('Key copied to clipboard.', 'success');
                    }}
                    className="px-4 py-2.5 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 font-bold rounded-2xl border-pink-500/30 transition-colors flex items-center"
                  >
                    
                    Copy
- handleRevokeKey(key.id)}
                        className="p-2 text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-colors opacity-0 group-hover/item:opacity-100"
                        title="Revoke Key"
                      >
- {nfLoading || nfSaving ?  : nfForce3 ? 'Strict Mode Active' : 'Enable Strict Mode'}
- {
                  try {
                    const res = await fetch('http://localhost:11434/api/tags');
                    if (res.ok) {
                      const data = await res.json();
                      addNotification(`✅ Local Engine !Online Models: ${data.models.map(m => m.name).join(', ') || 'None'}`, 'success');
                    }
                  } catch (err) {
                    addNotification('❌ Engine Offline. Start the local daemon.', 'error');
                  }
                }}
                className="w-full py-2.5 rounded-2xl bg-gray-800 hover:bg-gray-700 border-gray-700 text-white text-xs font-bold transition-all flex items-center justify-center"
              >
                
                Ping Engine

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\LandingPage.jsx
**Interactive Controls**: 
- Enter Studio →
- Launch Studio Free →
- {plan.popular ? 'Start Free Trial' : 'Get Started'}
- Launch Evo Studio →

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\MobileSingularityDashboard.jsx
**Interactive Controls**: 
- setArchitecture('expo_router')}
                className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-all ${
                  architecture === 'expo_router' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                React Native (Expo)
- setArchitecture('clean_riverpod')}
                className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-all ${
                  architecture === 'clean_riverpod' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Flutter (Riverpod)

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\ModuleMaturityDashboard.jsx
**Interactive Controls**: 
- Refresh
- Write Receipt
- setSelectedId(module.id)} style={{ textAlign: 'left', width: '100%', background: selected?.id === module.id ? 'rgba(8,145,178,.22)' : '#020617', border: selected?.id === module.id ? '1px solid rgba(34,211,238,.45)' : '1px solid #1e293b', borderRadius: 12, padding: 12, cursor: 'pointer', color: '#e2e8f0' }}>
                
                  {module.name}
                  
                
                {module.missing.length ? `${module.missing.length} missing checks` : 'All checks detected'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\OmniBotRemote.jsx
**Interactive Controls**: 
- Run in Terminal
- {applied ?  : }
                      {applied ? 'Applied!' : 'Apply to File'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\OmniMarketplaceNexus.jsx
**Interactive Controls**: 
- { safeFetchBridge('/api/stripe/health').then(d => console.log('[Commerce] Ledger:', d)).catch(() => {}); }}>
           View Ledger
- { safeFetchBridge('/api/stripe/health').then(d => console.log('[Commerce] Gateway config:', d)).catch(() => {}); }}>
            Configure Gateways

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\OmniscientObservabilityDeck.jsx
**Interactive Controls**: 
- { safeFetchBridge('/api/studio/scan').then(d => console.log('[Observability] Scan:', d)).catch(() => {}); }}>
           Scan Environment

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\OnboardingFlow.jsx
**Interactive Controls**: 
- setSelectedBot(bot.id)}
                  style={{
                    ...s.botCard,
                    borderColor: selectedBot === bot.id ? bot.palette.primary : 'rgba(255,255,255,0.06)',
                    background: selectedBot === bot.id ? `${bot.palette.primary}15` : 'rgba(255,255,255,0.02)',
                    boxShadow: selectedBot === bot.id ? `0 0 20px ${bot.palette.primary}25` : 'none',
                  }}
                >
                  {bot.icon}
                  {bot.name}
                  {bot.species}
- setApiMode(mode.id)}
                  style={{
                    ...s.modeBtn,
                    borderColor: apiMode === mode.id ? '#00f0ff' : 'rgba(255,255,255,0.08)',
                    background: apiMode === mode.id ? 'rgba(0,240,255,0.08)' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  {mode.icon}
                  
                    {mode.label}
                    {mode.desc}
- setSelectedTheme(theme.id)}
                  style={{
                    ...s.themeCard,
                    borderColor: selectedTheme === theme.id ? theme.color : 'rgba(255,255,255,0.06)',
                    background: selectedTheme === theme.id ? `${theme.color}12` : 'rgba(255,255,255,0.02)',
                    boxShadow: selectedTheme === theme.id ? `0 0 24px ${theme.color}20` : 'none',
                  }}
                >
                  {theme.icon}
                  {theme.name}
                  {theme.desc}
                  {selectedTheme === theme.id && (
                    ✓
                  )}
- ← Back
- {step === 0 ? 'Get Started →' : 'Continue →'}
- {completing ? 'Launching...' : '🚀 Launch Studio'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\PricingCheckout.jsx
**Interactive Controls**: 
- {checkoutLoading ? 'Processing...' : 'Proceed to Stripe Checkout'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\PromptBridgeSurfacesView.jsx
**Interactive Controls**: 
- Refresh
- planSurface(surface)}
                disabled={routeLoading === surface.id}
                className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border-indigo-400/40 bg-indigo-500/10 px-3 text-xs font-black uppercase text-indigo-100 hover:bg-indigo-500/20 disabled:cursor-wait disabled:opacity-60"
              >
                
                {routeLoading === surface.id ? 'Planning' : 'Plan Route'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\SelfEvolutionDashboard.jsx
**Interactive Controls**: 
- {refreshing ? 'Syncing...' : 'Refresh'}
- {status?.killSwitchEngaged ?  : }
              {status?.killSwitchEngaged ? 'Kill Switch: ENGAGED' : 'Kill Switch: OFF'}
- handleQueueAction(item.id, 'approve')}
                      className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Approve
- handleQueueAction(item.id, 'reject')}
                      className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Reject

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\ShadowTelemetryDashboard.jsx
**Interactive Controls**: 
- alert('Intent execution queued via Sovereign Bridge.')}
              className="bg-[#ff0000]/20 text-[#ff0000] border border-[#ff0000]/50 px-4 py-2 hover:bg-[#ff0000]/40 transition-colors uppercase tracking-widest text-xs font-bold rounded">
              Approve & Execute
- setSelectedEvent(null)}
              className="bg-transparent text-[#ff0000]/50 border border-[#ff0000]/20 px-4 py-2 hover:bg-[#ff0000]/10 transition-colors uppercase tracking-widest text-xs font-bold rounded">
              Dismiss Intent
- setIsPolling(!isPolling)}
              className="bg-[#110000] hover:bg-[#330000] text-[#ff0000] border border-[#ff0000]/50 px-4 py-2 rounded-lg transition-all shadow-[0_0_10px_rgba(255,0,0,0.1)] hover:shadow-[0_0_15px_rgba(255,0,0,0.3)] text-xs uppercase font-bold tracking-wider"
            >
              {isPolling ? 'Pause Stream' : 'Resume Stream'}
- { setStreamType(t); setSelectedEvent(null); setEvents([]); }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-t border-x border-[#ff0000]/30 rounded-t-lg transition-colors ${
                streamType === t 
                  ? 'bg-[#0a0000] border-[#ff0000] text-[#ff3333]' 
                  : 'bg-[#110000] text-[#ff0000]/50 hover:bg-[#220000] border-transparent'
              }`}
            >
              {t.replace('_', ' ')}

**API Calls Triggered**:
- `/api/witness/telemetry?type=*` -> ❌ DEAD LINK / UNREGISTERED
- `/api/agi/health` -> ✅ ALIVE

---

### src\features\SingularityCommandCenter.jsx
**Interactive Controls**: (No static buttons found)

**API Calls Triggered**:
- `/api/singularity/status` -> ❌ DEAD LINK / UNREGISTERED

---

### src\features\SingularityEvolutionNexus.jsx
**Interactive Controls**: 
- { safeFetchBridge('/api/singularity/status').then(d => console.log('[Singularity] Neural Net Sync:', d)).catch(() => {}); }}>
           Synchronize Neural Nets
- { safeFetchBridge('/api/evolution/cycle', { method: 'POST' }).then(d => console.log('[Evo] Compaction cycle:', d)).catch(() => {}); }}>
            Trigger Compaction Cycle
- setIsAutoEvolving(!isAutoEvolving)}
              className={`glass-extreme hover:border-[#ff0055] transition-all rounded-xl px-6 py-3 text-sm font-black inline-flex items-center gap-3 ${isAutoEvolving ? 'border-[#ff0055] text-[#ff0055] animate-pulse shadow-[0_0_20px_rgba(255,0,85,0.4)]' : 'text-gray-400'}`}
            >
              
              {isAutoEvolving ? 'HYPER-DRIVE ACTIVE (15s)' : 'ENABLE 15s HYPER-DRIVE'}
- {isEvolving ?  : }
              {isEvolving ? 'Consulting Omni-Brain...' : 'Trigger Autonomous Evolution'}
- {
                  const dims = {};
                  ['layout','ui','bots','wiring','feature','app'].forEach(d => dims[d] = t);
                  setGlobalTheme(dims);
                }}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
              >
                {t}
- setActivePangram(prev => (prev > 0 ? prev - 1 : pangrams.length - 1))}
                className="p-2 glass-extreme rounded-lg hover:border-[#00f0ff] transition-colors"
              >
- setActivePangram(prev => (prev
- { console.log(`[Evolution] Launching module: ${tool.name}`); }}>
        Launch {tool.name}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\SovereignIntelligenceDashboard.jsx
**Interactive Controls**: 
- {label}
        {sub}
- {refreshing ? 'Syncing...' : 'Refresh'}
- useSovereignStore.getState().runTruthProbe()}
              className="text-[10px] text-neon-cyan font-black uppercase tracking-widest hover:text-indigo-300 transition-colors"
            >
              Run Truth Probe
- setActivePage('chat')}
                className="mt-2 glass-extreme px-4 py-3 rounded-xl border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:border-indigo-400 transition-all hover:bg-indigo-500/10"
              >
                Open Full Chat

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\TheMasterForge.jsx
**Interactive Controls**: 
- Deploy to Singularity

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\WitnessConsole.jsx
**Interactive Controls**: 
- WITNESS_HUD
- ×
- setMode(m)}
            >
              {m.replace(/_/g, ' ')}
- triggerEvoDoctor()}
                    disabled={is_healing}
                  >
                    {is_healing ?  : }
                    {is_healing ? 'HEALING_IN_PROGRESS...' : 'INITIATE_EVO_DOCTOR'}
- triggerEvoEngineer()}>
                    🐒 EVOLVE_ARCHITECTURE
- triggerEvoUIEngineer()}>
                    🐙 REFINE_UI_ORGANS
- runDoctorScan()}>
                RUN_FULL_DIAGNOSTIC_SCAN
- runStudyProtocol(p)}
                    disabled={studyRunning}
                  >
                    {p.replace(/_/g, ' ')}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\forge-rail-view.jsx
**Interactive Controls**: 
- ⚡ Trigger Rail
- setActiveRail(r.id)}
            >
              {r.label}
              {r.desc}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\forge-term-view.jsx
**Interactive Controls**: 
- setActiveCategory(cat)}
                style={{
                  padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                  background: activeCategory === cat ? 'var(--accent-cyan)' : 'var(--bg-elevated)',
                  color: activeCategory === cat ? '#000' : 'var(--text-muted)',
                  border: 'none',
                }}
              >{cat}
- { setInput(t.cmd); inputRef.current?.focus(); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 10px', borderRadius: 8, fontSize: 11, cursor: 'pointer',
                  background: 'var(--bg-void)', border: '1px solid var(--border-dim)',
                  color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
                  marginBottom: 4, transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-dim)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {t.label}
- { sendToBridge(pendingApproval); setPendingApproval(null); }}
                style={{ background: '#fb923c', color: '#000', fontWeight: 800 }}
              >Approve & Execute
- { log('warn', 'Command cancelled by user.'); setPendingApproval(null); }}
              >Cancel
- { runCommand(input); setInput(''); }}
              style={{ minWidth: 80 }}
            >Run ↵
- setHistory([{ type: 'system', text: 'Cleared.' }])}
            >Clear

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\forge-views.jsx
**Interactive Controls**: 
- setTab('agents')}>Agents
- setTab('bridges')}>Bridges
- setTab('handshakes')}>Handshakes
- 🧬 Spawn Intelligence
- {
            if (!bridgeName) return;
            const code = `// Bridge DNA Generated for ${bridgeName || 'Unlabeled'}\nexport async function ${bridgeName.replace(/\s+/g, '')}Bridge(payload) {\n  const response = await fetch(BRIDGE_URL + '${endpoint}', {\n    method: 'POST',\n    body: JSON.stringify(payload)\n  });\n  return response.json();\n}`;
            fetch(BRIDGE_URL + '/api/files/write', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                path: `src/generated/bridges/${bridgeName.replace(/\s+/g, '')}Bridge.js`,
                content: code
              })
            }).then(res => {
              if (res.ok) {
                addNotification({ msg: `🚀 Bridge Forged: ${bridgeName} saved to src/generated/bridges/`, type: 'success' });
              } else {
                addNotification({ msg: `❌ Failed to forge bridge.`, type: 'error' });
              }
            }).catch(err => {
              addNotification({ msg: `❌ Error connecting to bridge.`, type: 'error' });
            });
          }}>🚀 Forge Bridge
- setSignedAt(new Date().toISOString())}
                  className="btn btn-primary btn-sm"
                  style={{ width: 'fit-content' }}
                >
                  Sign New Handshake

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\new-features-views.jsx
**Interactive Controls**: 
- alert('Anomaly resolution engine engaged. Commencing automated patching...')}
                className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)] active:scale-95 flex items-center gap-2">
                 Resolve Anomalies
- handleOverride(conflict.id, 'arbiter')}
                      disabled={overriding}
                      className="px-6 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
                    >
                      Accept Arbiter
- handleOverride(conflict.id, 'founder')}
                      disabled={overriding}
                      className="px-6 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
                    >
                      Founder Override

**API Calls Triggered**:
- `/api/intelligence/execute` -> ✅ ALIVE
- `/api/intelligence/execute` -> ✅ ALIVE
- `/api/intelligence/execute` -> ✅ ALIVE
- `/api/intelligence/execute` -> ✅ ALIVE
- `/api/intelligence/execute` -> ✅ ALIVE
- `/api/audit/nuclear-truth` -> ❌ DEAD LINK / UNREGISTERED
- `/api/intelligence/execute` -> ✅ ALIVE
- `/api/intelligence/execute` -> ✅ ALIVE
- `/api/intelligence/execute` -> ✅ ALIVE
- `/api/intelligence/execute` -> ✅ ALIVE
- `/api/intelligence/execute` -> ✅ ALIVE
- `/api/intelligence/execute` -> ✅ ALIVE

---

### src\nightforge-view.jsx
**Interactive Controls**: 
- {savingForceMode
                ? 'Saving...'
                : forceThreeProviderTeam
                  ? 'Strict 3-Team Mode: ON'
                  : 'Strict 3-Team Mode: OFF'}
- {active ? 'Stop Daemon' : 'Start Daemon'}
- {running ? 'Running...' : 'Run Manual Cycle'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\past-mvp-console.jsx
**Interactive Controls**: 
- + Create Mission
- setSelectedMission(m)}
            style={{ ...btn(selectedMission?.id === m.id ? '#f5c842' : '#818cf8'), maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {m.title || m.id.slice(0,12)}
- 🛡️ Friction Check
- ⚡ Run Fission
- 📦 VectorPack
- ⏳ Temporal Stack
- 🚀 DeployRail (live)
- 💳 Commerce (gated)
- 🌙 NightForge
- {loading ? '⏳ Running...' : '🤖 FULL AUDIT (All 7 Gates)'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\pattern-miner-view.jsx
**Interactive Controls**: 
- {scanning ? '📡 Scanning...' : '🔍 Scan for Patterns'}
- createRecipe(p)}>🪄 Gen Recipe

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\promptlink-views.jsx
**Interactive Controls**: 
- {handshaking ? '⏳ Syncing...' : '🤝 Re-Handshake'}
- setActiveTab(t.id)}>
            {t.label}
- { e.stopPropagation(); toggleProvider(provider); }}
                    style={{
                      background: provider.enabled ? 'rgba(74,222,128,0.2)' : 'var(--bg-elevated)',
                      border: `1px solid ${provider.enabled ? '#4ade80' : 'var(--border-dim)'}`,
                      color: provider.enabled ? '#4ade80' : 'var(--text-muted)',
                      fontWeight: 800,
                    }}
                  >
                    {provider.enabled ? '🟢 Enabled' : '⚫ Disabled'}
- { e.stopPropagation(); testProvider(provider); }}>
                    🔑 Test Gate

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\proof-os-views.jsx
**Interactive Controls**: 
- toggleLock(i)}>
                {law.locked ? 'Unlock' : 'Lock Law'}
- {resolving ? 'Enforcing...' : 'Enforce Resolution'}
- {scanning ? 'Scanning...' : 'Run Deep Scan'}
- {recalculating ? 'Auditing Canon...' : 'Run Maturity Audit'}
- {status === 'scanning' ? 'Running Compliance Audit...' : 'Run Compliance Checks'}
- {status === 'gated' ? 'Signing Certificates...' : 'Execute Release Gates'}
- setActiveStep(0)}>Reset Pipeline
- {updating ? 'Recalculating Drift...' : 'Update Mirror Profile'}

**API Calls Triggered**:
- `/api/proof/count` -> ✅ ALIVE
- `/api/proof/receipts?limit=60` -> ✅ ALIVE
- `/api/logs?limit=1` -> ✅ ALIVE
- `/api/grading/maturity` -> ❌ DEAD LINK / UNREGISTERED
- `/api/audit/nuclear-truth` -> ❌ DEAD LINK / UNREGISTERED
- `/api/grading/maturity` -> ❌ DEAD LINK / UNREGISTERED

---

### src\prototypes\HybridStudio.jsx
**Interactive Controls**: 
- DECONSTRUCT

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\prototypes\PrototypeLauncher.jsx
**Interactive Controls**: 
- Exit Autonomous Explorer

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\prototypes\StudioBeta.jsx
**Interactive Controls**: 
- console.log('Launching beta...')}>Launch Component Beta
- console.log('Sending message...')} className="absolute right-3 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl flex items-center justify-center transition-colors shadow-md shadow-indigo-600">

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\prototypes\ThemeSynthesizer.jsx
**Interactive Controls**: 
- Back to Explorer
- setActivePersona(p)}
                   className={`p-4 rounded-3xl flex items-center gap-3 transition-all border-2 ${isActive ? 'bg-blue-900/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-gray-900/50 border-transparent hover:bg-gray-800 text-gray-400'}`}
                 >
                   
                   {p.name}
- setSelections(s => ({...s, [dim.id]: p.id}))}
                    className={`p-2 rounded-2xl text-left transition-all flex items-center justify-between border ${selections[dim.id] === p.id ? `${p.bg} ${p.border} ${p.color}` : 'border-transparent bg-gray-900/50 hover:bg-gray-800 text-gray-500'}`}
                  >
                    {p.name.split(' ')[0]}
                    {selections[dim.id] === p.id && }
- MANUAL SYNTHESIS
- START AUTONOMOUS EVOLUTION

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\rare-capabilities-view.jsx
**Interactive Controls**: 
- setSelectedId(capability.id)}
                >
                  {capability.icon}
                  
                    {capability.short}
                    {capability.promise}
- copyArtifact(artifact.primary, artifact.primaryLabel, setCopied)}
                >
                  {copied === artifact.primaryLabel ? 'Copied' : 'Copy'}
- setSelectedId(item.id)}
            >
              
                {capability.icon}
                {item.score}
              
              {capability.title}
              {item.summary}

**API Calls Triggered**:
- `/api/intelligence/execute` -> ✅ ALIVE

---

### src\real-execution-views.jsx
**Interactive Controls**: (No static buttons found)

**API Calls Triggered**:
- `/api/queue/master` -> ✅ ALIVE

---

### src\release-spine-panels.jsx
**Interactive Controls**: 
- setReloadKey((value) => value + 1)}>Refresh

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\self-build-forge-view.jsx
**Interactive Controls**: 
- {status === 'BUILDING' ? 'EVOLVING...' : 'FORGE APPLICATION'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\studio-grading-release-views.jsx
**Interactive Controls**: 
- {grading ? 'Grading...' : 'Grade Prompt'}
- {loading ? 'Verifying...' : 'Auto-Verify'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\tool-autogen-view.jsx
**Interactive Controls**: 
- setActiveTab(t.id)}>{t.label}
- setSelectedType(t.id)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 8, marginBottom: 4,
                    background: selectedType === t.id ? 'rgba(245,200,66,0.15)' : 'var(--bg-void)',
                    border: `1px solid ${selectedType === t.id ? '#f5c842' : 'var(--border-dim)'}`,
                    color: selectedType === t.id ? '#f5c842' : 'var(--text-secondary)', cursor: 'pointer' }}>
                  {t.label}
                  {t.desc}
- {generating ? '⏳ Generating...' : `🪄 Generate ${TOOL_TYPES.find(t => t.id === selectedType)?.label || 'Tool'}`}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\v3-views.jsx
**Interactive Controls**: (No static buttons found)

**API Calls Triggered**:
- `/src/prompthouse_50_master_build_prompts.json` -> ✅ ALIVE

---

### src\views.jsx
**Interactive Controls**: 
- setPhase(i)} 
              className={`flex-col items-center gap-3 p-6 rounded-3xl transition-all duration-300 ${
                i === phase 
                  ? 'bg-fuchsia-500 text-white shadow-xl shadow-fuchsia-500/20' 
                  : i 
              {p.icon}
              {p.label}
- addStep(t.id)} style={{ borderColor: t.color + '44', color: t.color, backgroundColor: t.color + '10' }}>{t.icon} {t.label}
- moveUp(i)}>↑
- removeStep(step.id)}>✕
- setFormat(f)}>
                      {f.toUpperCase()}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\worktwin-view.jsx
**Interactive Controls**: 
- 📡 Run Pattern Miner
- ↻ Refresh
- setActiveTab(t.id)}>{t.label}
- 📥 Capture Signal with Consent
- Run Miner
- genRecipe(p)}>🪄 Generate Recipe

**API Calls Triggered**: (No direct fetch calls detected)

---

