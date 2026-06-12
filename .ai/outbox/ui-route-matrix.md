# Full UI Button-to-Route Matrix

**Generated**: 2026-06-12T05:35:19.330Z
**Components Scanned**: 133
**Known Backend Routes**: 271
**Potential Dead Links Detected**: 1

## Matrix

### src\agent-bridge-views.jsx
**Interactive Controls**: 
- RESCAN_VAULT
- CLEAR_RECEIPTS

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
- {scanning ? 'Scanning...' : 'Start Global Audit'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\App.jsx
**Interactive Controls**: 
- setSingularityActive(true)} 
            className="absolute top-16 right-4 z-50 bg-[#00f0ff]/10 text-[#00f0ff] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-[#00f0ff]/30 hover:bg-[#00f0ff]/20 shadow-[0_0_20px_rgba(0,240,255,0.15)] flex items-center gap-2 group transition-all duration-300"
          >
            
            Open Evo Singularity Engine

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
- Capture Page
- Use Selection
- Open Side Panel
- Copy Packet
- Save
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

### src\components\AgentChatPanel.jsx
**Interactive Controls**: 
- Reset
- setSelectedBot(bot.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-black tracking-wider transition border ${
                selectedBot === bot.id
                  ? 'text-white border-transparent shadow-lg'
                  : 'text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200 bg-slate-800/50'
              }`}
              style={selectedBot === bot.id ? { backgroundColor: bot.palette.primary } : {}}
              title={bot.role}
            >
              {bot.icon} {bot.name}
- {loading ?  : }
            {loading ? '...' : 'Send'}

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
                                            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2.5 px-4 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                                        >
                                            {launching === project.id ? (
                                                
                                            ) : (
                                                <>
                                                    
                                                    Launch
                                                
                                            )}
- launchApp(project.id)}
                                            disabled={launching === project.id}
                                            aria-label={`Open ${project.name}`}
                                            className="bg-gray-800 hover:bg-gray-700 text-white p-2.5 rounded-xl transition-colors flex items-center justify-center disabled:opacity-50"
                                        >
- handleBuyApp(project.id)}
                                        className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center transition-colors border border-blue-500/30"
                                    >
                                        
                                        Buy App ($9.00)

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\BotAutomationDeck.jsx
**Interactive Controls**: 
- handleSync('trello')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${syncing.trello ? 'bg-slate-800 text-slate-500' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
              >
                {syncing.trello ? 'SYNCING...' : 'SYNC NOW'}
- handleSync('slack')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${syncing.slack ? 'bg-slate-800 text-slate-500' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
              >
                {syncing.slack ? 'SYNCING...' : 'SYNC NOW'}
- setPermissionsVisible((value) => !value)}
          aria-expanded={permissionsVisible}
          className="flex items-center gap-2 text-indigo-400 text-xs font-bold hover:text-indigo-300 transition-colors"
        >
          MANAGE PERMISSIONS

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

### src\components\EvoEyes.jsx
**Interactive Controls**: 
- setSingularityLayer(layer.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                singularityLayer === layer.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              
              {layer.label}
- setEvoEyesActive(false)} className="text-slate-500 hover:text-white transition-colors">
- setSelectedNode(null)} className="text-slate-500 hover:text-white">

**API Calls Triggered**:
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
          borderColor: isOpen ? activeTier.color : 'rgba(255,255,255,0.1)',
        }}
      >
        {activeTier.icon}
        
          {activeModel ? activeModel.displayName : 'Select Model'}
        
        
          {activeTier.label}
        
        {isOpen ? '▲' : '▼'}
- selectModel(model.id)}
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
- setActivePage(item.id)}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: collapsed ? '10px 0' : '9px 14px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    border: '1px solid transparent',
                    borderRadius: 14,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? '#ffffff' : '#737385',
                    background: isActive 
                      ? 'linear-gradient(90deg, rgba(0,240,255,0.1), transparent)' 
                      : 'transparent',
                    borderColor: isActive ? 'rgba(0,240,255,0.2)' : 'transparent',
                    boxShadow: isActive ? 'inset 3px 0 0 #00f0ff' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.2,0.8,0.2,1)',
                    marginBottom: 3,
                    textAlign: 'left',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#737385';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}
                >
                  {isActive && (
                    
                  )}
                  
                  {!collapsed && {item.label}}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\NightForgePanel.jsx
**Interactive Controls**: 
- {loading ? 'RUNNING CYCLE...' : 'RUN CYCLE NOW'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\OwnerApprovalPanel.jsx
**Interactive Controls**: 
- Approve
- Grant Explicit Approval

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
            className={`relative px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'text-white' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {activeTab === tab.id && (
              
            )}
            {tab.label}

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
      className="fixed bottom-0 left-[260px] right-0 h-9 bg-black border-t border-indigo-500/30 flex items-center px-6 hover:bg-slate-900 transition-all z-30 group"
    >
      
      Open Master EvoShell Terminal
- setActiveTerminalSession(session)}
                className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded transition-all ${
                  activeTerminalSession === session 
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {session}
- setTerminalTheme('evo')} className={`w-3 h-3 rounded-full bg-indigo-500 ${terminalTheme === 'evo' ? 'ring-2 ring-white' : 'opacity-40'}`} />
             setTerminalTheme('matrix')} className={`w-3 h-3 rounded-full bg-emerald-500 ${terminalTheme === 'matrix' ? 'ring-2 ring-white' : 'opacity-40'}`} />
             setTerminalTheme('classic')} className={`w-3 h-3 rounded-full bg-slate-500 ${terminalTheme === 'classic' ? 'ring-2 ring-white' : 'opacity-40'}`} />
- clearTerminal(activeTerminalSession)} title="Clear Session" className="text-slate-500 hover:text-rose-400 transition-colors">
- setIsFullscreen(!isFullscreen)} title="Fullscreen" className="text-slate-500 hover:text-white transition-colors">
            {isFullscreen ?  : }
- setTerminalOpen(false)} title="Minimize" className="text-slate-500 hover:text-white transition-colors">
- setCatalogOpen((value) => !value)}
            className="shrink-0 flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded border border-indigo-500/30 text-indigo-300 hover:text-white hover:border-indigo-400 transition-colors"
            title="Toggle command catalog"
          >
            
            Command Deck {filteredCommands.length}/{COMMAND_CATALOG.length}
- runCatalogCommand(item)}
                disabled={executing}
                className="text-left p-2 rounded border border-slate-800 bg-black/35 hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={`Run: ${item.command}`}
              >
                
                  {item.label}
                  {item.session}
                
                {item.description}
                {item.command}

**API Calls Triggered**:
- `/api/intelligence/execute` -> ✅ ALIVE

---

### src\components\TimeSlipLedger.jsx
**Interactive Controls**: 
- setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
          &times;
- Revert to {commit.id}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\components\TopBar.jsx
**Interactive Controls**: 
- e.currentTarget.style.color = '#00f0ff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#737385'}
        >
          {sidebarCollapsed ?  : }
- setActivePage('proof-console')}
          style={{ background: 'none', border: 'none', color: '#737385', cursor: 'pointer', padding: 6, display: 'flex', position: 'relative', transition: 'color 0.2s' }}
          aria-label="Notifications"
          onMouseEnter={(e) => e.currentTarget.style.color = '#00f0ff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#737385'}
        >
          
          {notifications.length > 0 && (
            
          )}
- setActivePage('settings')}
          style={{ background: 'none', border: 'none', color: '#737385', cursor: 'pointer', padding: 6, display: 'flex', transition: 'color 0.2s' }}
          aria-label="Settings"
          onMouseEnter={(e) => e.currentTarget.style.color = '#00f0ff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#737385'}
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

### src\evo-copilot-sidebar.jsx
**Interactive Controls**: 
- setIsOpen(false)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:20 }}>✕
- handleQuickAction('debt')} style={{ whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 16, fontSize: 11, cursor: 'pointer' }}>🛠️ Scan Debt
- handleQuickAction('tool')} style={{ whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 16, fontSize: 11, cursor: 'pointer' }}>🪄 Auto-Tool
- handleQuickAction('test')} style={{ whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 16, fontSize: 11, cursor: 'pointer' }}>⚡ Run Fission
- ↑

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
- alert('Publishing to public exchange requires Enterprise Sovereignty.')}>
          🌐 Go Public
- setActiveCategory(c.id)}
          >
            {c.label}
- 🔒 Blocked

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\AuthSentry.jsx
**Interactive Controls**: 
- setAuthenticated(true)}>
            ENTER DEMO MODE

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\AutonomousSelfView.jsx
**Interactive Controls**: 
- setEvolving(false) : startEvolution}
              disabled={bridgeStatus !== 'connected'}
              className={`w-full py-4 rounded-xl font-bold text-[13px] tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 ${
                evolving 
                  ? 'bg-black/50 text-[#00f0ff] border border-[#00f0ff]/30 shadow-[inset_0_0_20px_rgba(0,240,255,0.1)]' 
                  : 'bg-gradient-to-r from-[#8a2be2] to-[#4338ca] text-white hover:shadow-[0_0_30px_rgba(138,43,226,0.4)] disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {evolving ?  : }
              {evolving ? 'Evolution Active' : 'Initialize Evolution Loop'}
- Execute Maintenance Protocol

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\CommerceDashboard.jsx
**Interactive Controls**: 
- window.open('https://dashboard.stripe.com', '_blank')} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            Go To Stripe Dashboard

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\ConnectionManager.jsx
**Interactive Controls**: 
- {scanning ?  : }
              Auto-Discover
- BLE Pair
- {bonding ?  : }
              Bond Node
- { setTargetIp(node.ip); handleBond(); }}
                  className="px-3 py-1.5 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded text-xs font-bold transition-colors"
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

### src\features\EvoEyesView.jsx
**Interactive Controls**: 
- setSelectedId((v) => v)}
            title="Refresh on next poll tick"
          >
             Refresh
- setSelectedId(m.id)}
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                    background: selectedId === m.id ? 'rgba(99,102,241,0.12)' : 'rgba(2,6,23,0.35)',
                    border: selectedId === m.id ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.08)',
                    padding: '10px 10px'
                  }}
                >
                  
                    {m.label || m.id}
                    {m.path}
                  
                  
                    {m.health}

**API Calls Triggered**:
- `/api/studio/diagnostics?limit=70` -> ✅ ALIVE

---

### src\features\EvoLayoutDashboard.jsx
**Interactive Controls**: 
- setPreviewExpanded((value) => !value)}
                      aria-pressed={previewExpanded}
                      className="text-[#737385] hover:text-[#00f0ff] transition-colors"
                    >

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\EvoLlmTrainingDashboard.jsx
**Interactive Controls**: 
- Refresh
- createPlan('local-dataset')} disabled={busy}>Plan Local Dataset
- createPlan('openai')} disabled={busy}>Plan Provider Gate Test
- Approve Latest
- Run Latest
- Promote Dataset Version
- Rollback Active
- Package Contribution

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\EvoPixelatorDashboard.jsx
**Interactive Controls**: 
- setBitDepth(b)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${bitDepth === b ? 'bg-[#00ff88]/20 border-[#00ff88] text-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.2)]' : 'bg-[#0a0a10] border-white/10 text-[#737385] hover:border-white/20'}`}
                    >
                      {b}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\EvoSpineCoreDashboard.jsx
**Interactive Controls**: 
- Refresh
- Run Evo

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\ExtensionCockpitView.jsx
**Interactive Controls**: 
- setActivePanel(panel.id)}
        className={`flex items-center gap-4 w-full p-4 rounded-xl transition-all border ${
          isActive 
            ? 'bg-slate-800 border-indigo-500/50 shadow-lg shadow-indigo-500/10' 
            : 'bg-transparent border-transparent hover:bg-slate-800/30'
        }`}
      >
        
          
        
        {panel.label}
        {isActive && }

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\FeatureFoundryView.jsx
**Interactive Controls**: 
- {loading ?  : }
          {loading ? 'Harvesting Codebase...' : 'Scan for Opportunities'}
- initiateBuild(mission)}
              style={{ 
                width: '100%', padding: '14px', borderRadius: 12, border: '1px solid #6366f1', background: activeMission?.id === mission.id ? '#6366f1' : 'transparent',
                color: activeMission?.id === mission.id ? 'white' : '#818cf8', fontWeight: 800, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s'
              }}
            >
              
              {activeMission?.id === mission.id ? 'Build Cycle Active' : 'Initiate Autonomous Build'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\GlobalAPISettingsView.jsx
**Interactive Controls**: 
- {apiConfigSaving ?  : saved ?  : }
            {apiConfigSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Keys'}
- {testing ?  : }
            {testing ? 'Testing...' : 'Test Connection'}
- {generatingKey ?  : }
            Generate Key
- {
                  navigator.clipboard.writeText(newKeyPayload);
                  addNotification('Copied API Key to clipboard.', 'success');
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #ec4899',
                  background: 'transparent',
                  color: '#ec4899',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 700
                }}
              >
                Copy
- handleRevokeKey(key.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid #ef4444',
                      background: 'rgba(239, 68, 68, 0.05)',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: 10,
                      fontWeight: 700,
                      transition: 'all 0.2s'
                    }}
                  >
                    Revoke
- {nfLoading || nfSaving ?  : null}
          {nfForce3 ? 'Strict 3-Team Mode ON' : 'Strict 3-Team Mode OFF'}
- {
            try {
              const res = await fetch('http://localhost:11434/api/tags');
              if (res.ok) {
                const data = await res.json();
                const models = data.models.map(m => m.name).join(', ');
                alert(`✅ Ollama is Online!\n\nInstalled Models:\n${models || 'None yet. Run "ollama run llama3" in your terminal!'}`);
              } else {
                alert('⚠️ Ollama responded with an error.');
              }
            } catch (err) {
              alert('❌ Ollama is Offline or not installed.\n\nTo install, download from ollama.com or run:\ncurl -fsSL https://ollama.com/install.sh | sh');
            }
          }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            Test Ollama Connection

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\LaunchProofView.jsx
**Interactive Controls**: 
- {isVerifying ? 'VERIFYING...' : 'RUN FULL PROOF'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\MetricsView.jsx
**Interactive Controls**: 
- { setLoading(true); fetchAll(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
           Refresh

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\MobileSingularityDashboard.jsx
**Interactive Controls**: 
- setArchitecture('expo_router')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
                  architecture === 'expo_router' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                React Native (Expo)
- setArchitecture('clean_riverpod')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
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

### src\features\PlatformSentinelDashboard.jsx
**Interactive Controls**: 
- {loading ? 'Auditing…' : 'Refresh Audit'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\PricingCheckout.jsx
**Interactive Controls**: 
- Downgrade/Reset License
- setShowSimulator(null)}
                className="text-slate-400 hover:text-white text-sm"
                disabled={simulationStep === 1}
              >
                ✕

**API Calls Triggered**:
- `/api/commerce/checkout` -> ✅ ALIVE

---

### src\features\PromptBridgeSurfacesView.jsx
**Interactive Controls**: 
- Refresh
- planSurface(surface)}
                disabled={routeLoading === surface.id}
                className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-indigo-400/40 bg-indigo-500/10 px-3 text-xs font-black uppercase text-indigo-100 hover:bg-indigo-500/20 disabled:cursor-wait disabled:opacity-60"
              >
                
                {routeLoading === surface.id ? 'Planning' : 'Plan Route'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\RuntimeHealthDashboard.jsx
**Interactive Controls**: 
- Refresh

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\SaasBuilderView.jsx
**Interactive Controls**: 
- {building ?  : }
              {building ? 'Orchestrating Reality...' : 'Initiate SaaS Build'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\SelfEvolutionDashboard.jsx
**Interactive Controls**: 
- { if (!disabled) { e.currentTarget.style.boxShadow = `0 0 25px ${danger ? 'rgba(255,0,85,0.3)' : 'rgba(0,240,255,0.3)'}`; } }}
    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 15px ${danger ? 'rgba(255,0,85,0.15)' : 'rgba(0,240,255,0.15)'}`; }}
  >
    {children}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\SovereignChat.jsx
**Interactive Controls**: 
- Run in Terminal
- {applied ?  : }
                      {applied ? 'Applied!' : 'Apply to File'}
- setActiveSurface(id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  activeSurface === id ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {label}
- setActivePage('settings')}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
          >

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\SovereignIntelligenceDashboard.jsx
**Interactive Controls**: 
- { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}15`; e.currentTarget.style.transform = 'translateX(6px)'; e.currentTarget.style.boxShadow = `0 0 30px ${color}20`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${color}30`; e.currentTarget.style.background = 'rgba(5,5,8,0.8)'; e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = `0 0 20px ${color}05`; }}
    >
      
        
      
      
        {label}
        {sub}
- { e.currentTarget.style.background = 'rgba(0,240,255,0.2)'; e.currentTarget.style.boxShadow = '0 0 25px rgba(0,240,255,0.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,240,255,0.1)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0,240,255,0.15)'; }}
        >
          
          {refreshing ? 'Syncing...' : 'Refresh'}
- useSovereignStore.getState().runTruthProbe()}
              className="text-[9px] text-indigo-400 font-black uppercase tracking-widest hover:text-indigo-300"
            >
              Run Truth Probe
- setActivePage('chat')}
              style={{
                background: 'none', border: '1px solid #1e293b', borderRadius: 8, padding: '8px 12px',
                color: '#6366f1', fontSize: 11, fontWeight: 600, cursor: 'pointer', marginTop: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              Open Full Chat

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\features\StudioMarketplaceDashboard.jsx
**Interactive Controls**: 
- setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === tab 
                ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab} Formats
- Tether

**API Calls Triggered**:
- `/api/marketplace/catalog` -> ❌ DEAD LINK / UNREGISTERED

---

### src\features\ThemeEvolutionDashboard.jsx
**Interactive Controls**: 
- e.currentTarget.style.background = 'rgba(0,240,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,240,255,0.1)'}> Refresh Vector
- Suggest
- Preview
- Approve
- Execute
- Rollback

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

**API Calls Triggered**:
- `/api/intelligence/execute` -> ✅ ALIVE

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

### src\forge-render-views.jsx
**Interactive Controls**: 
- setViewport(v)}
                style={{
                  fontSize: '10px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px',
                  background: viewport === v ? '#1e293b' : 'transparent',
                  color: viewport === v ? '#e2e8f0' : '#64748b',
                  border: 'none', cursor: 'pointer', textTransform: 'capitalize'
                }}
              >
                {v}

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
            const code = `// Bridge DNA Generated for ${bridgeName || 'Unlabeled'}\nexport async function ${bridgeName.replace(/\s+/g, '')}Bridge(payload) {\n  const response = await fetch((globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001'))))))) + '${endpoint}', {\n    method: 'POST',\n    body: JSON.stringify(payload)\n  });\n  return response.json();\n}`;
            fetch((globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001'))))))) + '/api/files/write', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                path: `src/generated/bridges/${bridgeName.replace(/\s+/g, '')}Bridge.js`,
                content: code
              })
            }).then(res => {
              if (res.ok) {
                alert(`🚀 Bridge Forged: ${bridgeName} saved to src/generated/bridges/`);
              } else {
                alert(`❌ Failed to forge bridge.`);
              }
            }).catch(err => {
              alert(`❌ Error connecting to bridge.`);
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
**Interactive Controls**: (No static buttons found)

**API Calls Triggered**:
- `/api/intelligence/execute` -> ✅ ALIVE
- `/api/intelligence/execute` -> ✅ ALIVE
- `/api/intelligence/execute` -> ✅ ALIVE
- `/api/intelligence/execute` -> ✅ ALIVE
- `/api/intelligence/execute` -> ✅ ALIVE
- `/api/intelligence/execute` -> ✅ ALIVE
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
- `/api/metrics` -> ✅ ALIVE

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
- {isCompiling ?  : }
          {isCompiling ? `Compiling ${progress}%` : 'Forge Now'}

**API Calls Triggered**: (No direct fetch calls detected)

---

### src\studio-grading-release-views.jsx
**Interactive Controls**: 
- Grade Prompt

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
            className={`flex flex-col items-center gap-3 p-6 rounded-3xl transition-all duration-300 ${
              i === phase 
                ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' 
                : i 
            {p.icon}
            {p.label}
- { copyText(chain); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? '✅ Copied!' : '📋 Copy Chain'}
- exportAsMarkdown('PH_EVO_PROMPT_CHAIN', chain)}>⬇️ Export
- addStep(t.id)} style={{ borderColor: t.color + '44', color: t.color }}>{t.icon} {t.label}
- moveUp(i)}>↑
- removeStep(step.id)}>✕
- setFormat(f)}>{f.toUpperCase()}
- ⬇️ Export {selected.length > 0 ? `${selected.length} Items` : 'Selected'}
- { const c = history.map(h => `${h.time} | ${h.domain} | ${h.score}% | ${h.task}`).join('\n'); exportAsText('PH_Evo_Session_History', c); }}>📜 Export Session History
- exportAsJson('PH_Evo_Full_Vault', vault)}>🗄️ Export Full Vault (JSON)
- { const agent = { name: 'PromptHouse Evo Studio', model: 'gpt-4o', instructions: 'You are PH Evo Studio Operator. See attached knowledge files for full instructions.' }; exportAsJson('PH_Evo_Agent_Config', agent); }}>🤖 Export Agent Config

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

