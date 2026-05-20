import React, { useState, useEffect, useRef } from 'react';
import { LIVEFORGE_TEMPLATES } from '../../lib/liveforge/liveForgeTemplates';

export function EvoMobileSimulator({ promptBridgeBaseUrl = "http://127.0.0.1:3001" }) {
  const [activeTab, setActiveTab] = useState('web-sim');

  // Tab A: Web Simulator State
  const [deviceModel, setDeviceModel] = useState('iphone15'); // iphone15, ipad, pixel8
  const [isLandscape, setIsLandscape] = useState(false);
  const [networkSpeed, setNetworkSpeed] = useState('wifi'); // wifi, 4g, 3g, 2g, offline
  const [batteryLevel, setBatteryLevel] = useState(88);
  const [currentTime, setCurrentTime] = useState('09:41');
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [iframeKey, setIframeKey] = useState(0);

  const firstTemplate = LIVEFORGE_TEMPLATES[0];
  const [selectedTemplateId, setSelectedTemplateId] = useState(firstTemplate.id);
  const selectedTemplate = LIVEFORGE_TEMPLATES.find(t => t.id === selectedTemplateId) || firstTemplate;

  // Tab B: Local CLI Controller State
  const [localDevices, setLocalDevices] = useState([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [deviceError, setDeviceError] = useState('');
  const [selectedLocalDevice, setSelectedLocalDevice] = useState(null);
  const [installPath, setInstallPath] = useState('build/app/outputs/flutter-apk/app-debug.apk');
  const [localDeviceLogs, setLocalDeviceLogs] = useState('');
  const [cliActionStatus, setCliActionStatus] = useState('');

  // Tab C: Cloud Appetize State
  const [appetizeKey, setAppetizeKey] = useState('demo');
  const [appetizeToken, setAppetizeToken] = useState('');
  const [appetizeStatus, setAppetizeStatus] = useState('Idle');

  // Update clock every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Listen to iframe console redirect messages
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && (event.data.type === 'CONSOLE_LOG' || event.data.type === 'CONSOLE_ERROR')) {
        setConsoleLogs(prev => [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString(),
            type: event.data.type === 'CONSOLE_ERROR' ? 'error' : 'log',
            text: event.data.text
          }
        ].slice(-50)); // keep last 50
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Load local devices
  const refreshLocalDevices = async () => {
    setIsLoadingDevices(true);
    setDeviceError('');
    try {
      const res = await fetch(`${promptBridgeBaseUrl}/api/emulator/list`);
      if (!res.ok) throw new Error('Failed to query local emulator endpoints.');
      const data = await res.json();
      setLocalDevices(data.devices || []);
      if (data.devices && data.devices.length > 0) {
        setSelectedLocalDevice(data.devices[0].id);
      }
    } catch (err) {
      setDeviceError(err.message);
    } finally {
      setIsLoadingDevices(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'local-cli') {
      refreshLocalDevices();
    }
  }, [activeTab]);

  // Boot local device
  const handleBootLocalDevice = async (device) => {
    if (!device) return;
    setCliActionStatus(`Booting ${device.name}...`);
    try {
      const res = await fetch(`${promptBridgeBaseUrl}/api/emulator/boot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: device.platform, id: device.id })
      });
      const data = await res.json();
      setCliActionStatus(data.message || 'Boot command dispatched.');
      setTimeout(refreshLocalDevices, 5000); // refresh device list status
    } catch (err) {
      setCliActionStatus(`Error: ${err.message}`);
    }
  };

  // Install build
  const handleInstallBuild = async () => {
    if (!selectedLocalDevice) {
      setCliActionStatus('No local device selected.');
      return;
    }
    const device = localDevices.find(d => d.id === selectedLocalDevice);
    if (!device) return;

    setCliActionStatus(`Installing build on ${device.name}...`);
    try {
      const res = await fetch(`${promptBridgeBaseUrl}/api/emulator/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: device.platform, deviceId: device.id, appPath: installPath })
      });
      const data = await res.json();
      setCliActionStatus(data.message || 'Install completed.');
    } catch (err) {
      setCliActionStatus(`Install failed: ${err.message}`);
    }
  };

  // Fetch logcat
  const handleFetchLocalLogs = async () => {
    if (!selectedLocalDevice) return;
    const device = localDevices.find(d => d.id === selectedLocalDevice);
    if (!device) return;

    setCliActionStatus('Fetching device logs...');
    try {
      const res = await fetch(`${promptBridgeBaseUrl}/api/emulator/logs?platform=${device.platform}&deviceId=${device.id}`);
      const data = await res.json();
      setLocalDeviceLogs(data.logs || 'No logs.');
      setCliActionStatus('Logs retrieved.');
    } catch (err) {
      setCliActionStatus(`Logs failed: ${err.message}`);
    }
  };

  // Cloud Appetize upload
  const handleAppetizeUpload = async () => {
    setAppetizeStatus('Uploading build to cloud device farm...');
    try {
      const res = await fetch(`${promptBridgeBaseUrl}/api/emulator/appetize-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appPath: installPath, token: appetizeToken })
      });
      const data = await res.json();
      if (data.publicKey) {
        setAppetizeKey(data.publicKey);
        setAppetizeStatus('Upload successful. Stream loaded.');
      } else {
        setAppetizeStatus('Upload failed.');
      }
    } catch (err) {
      setAppetizeStatus(`Upload failed: ${err.message}`);
    }
  };

  // Compile full iframe srcdoc with console redirect
  const compiledSrcDoc = useMemo(() => {
    if (networkSpeed === 'offline') {
      return `<!DOCTYPE html><html><head><style>body{background:#111;color:#ff6b6b;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;}h1{margin:0;font-size:24px;}p{opacity:0.7;margin:8px 0;}</style></head><body><h1>No Connection</h1><p>You simulated network speed: OFFLINE</p></body></html>`;
    }

    const consoleScript = `
      <script>
        (function() {
          const _log = console.log;
          const _warn = console.warn;
          const _error = console.error;
          
          console.log = function(...args) {
            _log.apply(console, args);
            window.parent.postMessage({ type: 'CONSOLE_LOG', text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
          };
          console.warn = function(...args) {
            _warn.apply(console, args);
            window.parent.postMessage({ type: 'CONSOLE_LOG', text: '[Warn] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
          };
          console.error = function(...args) {
            _error.apply(console, args);
            window.parent.postMessage({ type: 'CONSOLE_ERROR', text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
          };
          
          window.onerror = function(msg, url, line) {
            window.parent.postMessage({ type: 'CONSOLE_ERROR', text: 'Uncaught Error: ' + msg + ' (line ' + line + ')' }, '*');
            return false;
          };
        })();
      </script>
    `;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  ${consoleScript}
  <style>
    html, body { margin:0; padding:0; min-height:100%; height:100%; background:#090d16; color:#f8f0de; }
    ${selectedTemplate.css}
  </style>
</head>
<body>
  ${selectedTemplate.html}
  <script>
    try {
      ${selectedTemplate.js || "console.log('App sandbox started.');"}
    } catch(err) {
      console.error(err);
    }
  </script>
</body>
</html>`;
  }, [selectedTemplate, networkSpeed, iframeKey]);

  // Dimension helpers for device mockup
  const getDeviceDimensions = () => {
    let baseWidth = 390;
    let baseHeight = 760;

    if (deviceModel === 'ipad') {
      baseWidth = 768;
      baseHeight = 1024;
    } else if (deviceModel === 'pixel8') {
      baseWidth = 375;
      baseHeight = 780;
    }

    if (isLandscape) {
      return { width: baseHeight, height: baseWidth };
    }
    return { width: baseWidth, height: baseHeight };
  };

  const { width: devWidth, height: devHeight } = getDeviceDimensions();

  return (
    <div style={styles.shell}>
      {/* Navigation Headers */}
      <div style={styles.navBar}>
        <button style={activeTab === 'web-sim' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('web-sim')}>A. Interactive Web Simulator</button>
        <button style={activeTab === 'local-cli' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('local-cli')}>B. Local CLI Emulator Controller</button>
        <button style={activeTab === 'cloud-appetize' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('cloud-appetize')}>C. Cloud Appetize.io Streamer</button>
      </div>

      {/* Content Panels */}
      {activeTab === 'web-sim' && (
        <div style={styles.tabContent}>
          <div style={styles.controlsBar}>
            <label style={styles.controlLabel}>Device Model
              <select style={styles.select} value={deviceModel} onChange={e => setDeviceModel(e.target.value)}>
                <option value="iphone15">iPhone 15 Pro</option>
                <option value="pixel8">Google Pixel 8</option>
                <option value="ipad">iPad Pro (11-inch)</option>
              </select>
            </label>

            <button style={styles.button} onClick={() => setIsLandscape(!isLandscape)}>
              Rotate {isLandscape ? 'Portrait' : 'Landscape'}
            </button>

            <label style={styles.controlLabel}>Network
              <select style={styles.select} value={networkSpeed} onChange={e => setNetworkSpeed(e.target.value)}>
                <option value="wifi">Wi-Fi (Fast)</option>
                <option value="4g">4G LTE (Good)</option>
                <option value="3g">3G Mock (Slow)</option>
                <option value="2g">2G GPRS (Very Slow)</option>
                <option value="offline">Offline Mode</option>
              </select>
            </label>

            <label style={styles.controlLabel}>Battery ({batteryLevel}%)
              <input type="range" min="1" max="100" value={batteryLevel} onChange={e => setBatteryLevel(e.target.value)} style={{ width: 80 }} />
            </label>

            <button style={styles.dangerButton} onClick={() => { setConsoleLogs([]); setIframeKey(k => k + 1); }}>
              Soft Reboot
            </button>
          </div>

          <div style={styles.workspace}>
            {/* Device Viewport Frame */}
            <div style={styles.deviceColumn}>
              <div style={{
                ...styles.phoneMock,
                width: devWidth,
                height: devHeight,
                borderRadius: deviceModel === 'ipad' ? '28px' : '48px',
                border: '14px solid #1e293b',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}>
                {/* Physical Notch/Dynamic Island */}
                {deviceModel === 'iphone15' && !isLandscape && <div style={styles.dynamicIsland} />}
                
                {/* Simulated Screen Status Bar */}
                <div style={styles.simulatedStatusBar}>
                  <span style={styles.statusBarText}>{currentTime}</span>
                  <div style={styles.statusBarIcons}>
                    <span style={styles.statusBarText}>📶</span>
                    <span style={styles.statusBarText}>{networkSpeed === 'wifi' ? '📶' : 'LTE'}</span>
                    <span style={styles.statusBarText}>🔋 {batteryLevel}%</span>
                  </div>
                </div>

                {/* Simulated Web View Frame */}
                <div style={styles.screenInner}>
                  <iframe
                    key={iframeKey}
                    title="Simulated Application Screen"
                    sandbox="allow-scripts allow-popups"
                    srcDoc={compiledSrcDoc}
                    style={styles.simulatorIframe}
                  />
                </div>

                {/* Bottom Home Indicator Bar */}
                {!isLandscape && <div style={styles.homeIndicator} />}
              </div>
            </div>

            {/* Sidebar console logs */}
            <div style={styles.consoleColumn}>
              <div style={styles.panelTitle}>Simulated Console Stream</div>
              <div style={styles.consoleBox}>
                {consoleLogs.length === 0 ? (
                  <div style={styles.emptyLogs}>No console outputs. Run application commands or test errors.</div>
                ) : (
                  consoleLogs.map((log, index) => (
                    <div key={index} style={log.type === 'error' ? styles.logError : styles.logText}>
                      <span style={styles.logTime}>[{log.timestamp}]</span> {log.text}
                    </div>
                  ))
                )}
              </div>
              <div style={styles.quickTemplateBox}>
                <div style={styles.panelSubTitle}>Choose LiveForge Draft to Mount</div>
                <select style={styles.selectBlock} value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)}>
                  {LIVEFORGE_TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                  ))}
                </select>
                <div style={styles.hintText}>{selectedTemplate.description}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'local-cli' && (
        <div style={styles.tabContent}>
          <div style={styles.helpTextHeader}>
            <strong>Option B: Control Local Virtual Devices</strong>
            <p>Discovers and launches virtual machines configured in your local Android Studio or macOS Xcode development environments.</p>
          </div>

          <div style={styles.gridColumns}>
            <div style={styles.leftGridPanel}>
              <div style={styles.rowBetween}>
                <div style={styles.panelTitle}>Detected Local Emulators</div>
                <button style={styles.refreshBtn} onClick={refreshLocalDevices} disabled={isLoadingDevices}>
                  {isLoadingDevices ? 'Searching...' : '🔄 Refresh List'}
                </button>
              </div>

              {deviceError && <div style={styles.errorBanner}>{deviceError}</div>}

              <div style={styles.deviceList}>
                {localDevices.length === 0 ? (
                  <div style={styles.emptyDevices}>
                    No local Android AVDs or iOS Simulators discovered.
                    <p style={{ fontSize: 12, marginTop: 6, opacity: 0.6 }}>Make sure 'emulator' or 'xcrun simctl' are in your system PATH.</p>
                  </div>
                ) : (
                  localDevices.map(d => (
                    <div
                      key={d.id}
                      onClick={() => setSelectedLocalDevice(d.id)}
                      style={{
                        ...styles.deviceItem,
                        borderColor: selectedLocalDevice === d.id ? '#f5b942' : 'rgba(255,255,255,0.1)'
                      }}
                    >
                      <div style={styles.deviceHeaderRow}>
                        <strong>{d.name}</strong>
                        <span style={{
                          ...styles.statusTag,
                          background: d.status === 'BOOTED' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                          color: d.status === 'BOOTED' ? '#4ade80' : '#f87171'
                        }}>{d.status}</span>
                      </div>
                      <div style={styles.deviceDetails}>{d.type} ({d.platform})</div>
                      {d.status === 'SHUTDOWN' && (
                        <button style={styles.smallActionBtn} onClick={(e) => { e.stopPropagation(); handleBootLocalDevice(d); }}>
                          🚀 Boot Virtual Machine
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={styles.rightGridPanel}>
              <div style={styles.panelTitle}>Build Installer & Telemetry</div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Build Artifact Local Path</label>
                <input
                  type="text"
                  style={styles.textInput}
                  value={installPath}
                  onChange={e => setInstallPath(e.target.value)}
                />
                <span style={styles.fieldHelp}>Absolute path or path relative to studio root pointing to compiled APK/App.</span>
              </div>

              <div style={styles.actionButtonGroup}>
                <button
                  style={styles.primaryActionBtn}
                  onClick={handleInstallBuild}
                  disabled={!selectedLocalDevice}
                >
                  📥 Install to Booted Simulator
                </button>
                <button
                  style={styles.secondaryActionBtn}
                  onClick={handleFetchLocalLogs}
                  disabled={!selectedLocalDevice}
                >
                  📜 Read Native Logs
                </button>
              </div>

              {cliActionStatus && (
                <div style={styles.statusConsole}>
                  <strong>Action Log:</strong>
                  <pre style={{ margin: '6px 0 0 0', fontFamily: 'monospace', fontSize: 12 }}>{cliActionStatus}</pre>
                </div>
              )}

              {localDeviceLogs && (
                <div style={styles.logStreamConsole}>
                  <strong>Native Stream:</strong>
                  <pre style={styles.logsConsoleContent}>{localDeviceLogs}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cloud-appetize' && (
        <div style={styles.tabContent}>
          <div style={styles.helpTextHeader}>
            <strong>Option C: Cloud Virtualization streaming (Appetize.io)</strong>
            <p>Packages and streams your application bundle inside an interactive HTML5 cloud virtualization player. Perfect for sharing mobile previews with clients.</p>
          </div>

          <div style={styles.gridColumns}>
            <div style={styles.leftGridPanel}>
              <div style={styles.panelTitle}>Cloud Upload Config</div>
              
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Appetize.io API Key (Optional)</label>
                <input
                  type="password"
                  placeholder="Enter Appetize API token (leave blank for demo/mock)"
                  style={styles.textInput}
                  value={appetizeToken}
                  onChange={e => setAppetizeToken(e.target.value)}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Build Binary Path</label>
                <input
                  type="text"
                  style={styles.textInput}
                  value={installPath}
                  onChange={e => setInstallPath(e.target.value)}
                />
              </div>

              <button style={styles.primaryActionBtn} onClick={handleAppetizeUpload}>
                📤 Package & Stream to Appetize
              </button>

              <div style={{ marginTop: 16, fontSize: 13, color: '#f5b942' }}>
                Status: {appetizeStatus}
              </div>
            </div>

            <div style={styles.rightGridPanel}>
              <div style={styles.panelTitle}>Interactive Cloud Canvas</div>
              {appetizeKey === 'demo' ? (
                <div style={styles.placeholderAppetize}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📲</div>
                  <strong>Appetize Stream Deck</strong>
                  <p style={{ maxWidth: 300, textAlign: 'center', opacity: 0.6, fontSize: 12, marginTop: 8 }}>
                    Upload your build bundle using the configuration on the left to stream it here.
                  </p>
                </div>
              ) : (
                <div style={styles.appetizeWrapper}>
                  <iframe
                    src={`https://appetize.io/embed/${appetizeKey}?device=iphone15pro&scale=100&autoplay=true&orientation=portrait&deviceColor=black`}
                    width="378px"
                    height="800px"
                    frameBorder="0"
                    scrolling="no"
                    style={{ borderRadius: 16, border: 'none', background: '#000' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  shell: {
    padding: 16,
    background: '#0a0f1d',
    color: '#f8f0de',
    fontFamily: 'Inter, sans-serif',
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.08)'
  },
  navBar: {
    display: 'flex',
    gap: 8,
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: 12,
    marginBottom: 16
  },
  tab: {
    background: 'transparent',
    color: '#94a3b8',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.3s ease'
  },
  tabActive: {
    background: 'rgba(245,185,66,0.15)',
    color: '#f5b942',
    border: '1px solid rgba(245,185,66,0.3)',
    padding: '8px 16px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 700
  },
  tabContent: {
    animation: 'fadeIn 0.4s ease'
  },
  controlsBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
    alignItems: 'center',
    background: '#111827',
    padding: 14,
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.06)',
    marginBottom: 16
  },
  controlLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: 600
  },
  select: {
    background: '#070a12',
    color: '#f8f0de',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: '6px 10px',
    fontSize: 13
  },
  button: {
    background: '#1e293b',
    color: '#f8f0de',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600
  },
  dangerButton: {
    background: 'rgba(239,68,68,0.15)',
    color: '#f87171',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8,
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600
  },
  workspace: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
    alignItems: 'start'
  },
  deviceColumn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    background: '#020617',
    borderRadius: 20
  },
  consoleColumn: {
    background: '#111827',
    padding: 16,
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    height: '100%',
    minHeight: 500
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: '#f8f0de',
    letterSpacing: '-0.02em'
  },
  panelSubTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#94a3b8',
    marginBottom: 8
  },
  consoleBox: {
    background: '#020617',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    flex: 1,
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  emptyLogs: {
    color: '#64748b',
    textAlign: 'center',
    padding: 40,
    fontSize: 13
  },
  logText: {
    color: '#38bdf8'
  },
  logError: {
    color: '#f87171'
  },
  logTime: {
    color: '#64748b',
    marginRight: 6
  },
  quickTemplateBox: {
    background: '#070a12',
    padding: 12,
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.06)'
  },
  selectBlock: {
    width: '100%',
    background: '#111827',
    color: '#f8f0de',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 13,
    marginBottom: 6
  },
  hintText: {
    fontSize: 11,
    color: '#94a3b8'
  },
  phoneMock: {
    position: 'relative',
    background: '#000',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease'
  },
  dynamicIsland: {
    position: 'absolute',
    top: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 110,
    height: 30,
    borderRadius: 15,
    background: '#000',
    zIndex: 10
  },
  simulatedStatusBar: {
    height: 40,
    background: '#000',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    userSelect: 'none'
  },
  statusBarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'sans-serif'
  },
  statusBarIcons: {
    display: 'flex',
    gap: 4
  },
  screenInner: {
    flex: 1,
    position: 'relative',
    background: '#070a12'
  },
  simulatorIframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    background: '#fff'
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 134,
    height: 5,
    borderRadius: 3,
    background: '#fff',
    zIndex: 10
  },
  helpTextHeader: {
    background: 'rgba(245,185,66,0.06)',
    borderLeft: '4px solid #f5b942',
    padding: 12,
    borderRadius: '0 12px 12px 0',
    marginBottom: 16
  },
  gridColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr',
    gap: 20
  },
  leftGridPanel: {
    background: '#111827',
    padding: 16,
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },
  rightGridPanel: {
    background: '#111827',
    padding: 16,
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  rowBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  refreshBtn: {
    background: 'transparent',
    color: '#f5b942',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13
  },
  deviceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    maxHeight: 400,
    overflowY: 'auto'
  },
  emptyDevices: {
    color: '#64748b',
    textAlign: 'center',
    padding: 30,
    border: '1px dashed rgba(255,255,255,0.1)',
    borderRadius: 12
  },
  deviceItem: {
    background: '#070a12',
    border: '1px solid',
    borderRadius: 12,
    padding: 12,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  deviceHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  deviceDetails: {
    fontSize: 12,
    color: '#94a3b8'
  },
  statusTag: {
    fontSize: 10,
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: 6
  },
  smallActionBtn: {
    alignSelf: 'flex-start',
    background: '#f5b942',
    color: '#070a12',
    border: 'none',
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 11,
    fontWeight: 800,
    cursor: 'pointer',
    marginTop: 4
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: '#94a3b8'
  },
  textInput: {
    background: '#070a12',
    color: '#f8f0de',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 13
  },
  fieldHelp: {
    fontSize: 11,
    color: '#64748b'
  },
  actionButtonGroup: {
    display: 'flex',
    gap: 10
  },
  primaryActionBtn: {
    flex: 1,
    background: '#f5b942',
    color: '#070a12',
    border: 'none',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'opacity 0.2s ease'
  },
  secondaryActionBtn: {
    flex: 1,
    background: 'rgba(255,255,255,0.06)',
    color: '#f8f0de',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer'
  },
  statusConsole: {
    background: '#020617',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 10,
    color: '#4ade80'
  },
  logStreamConsole: {
    background: '#020617',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },
  logsConsoleContent: {
    margin: 0,
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#cbd5e1',
    maxHeight: 180,
    overflowY: 'auto',
    whiteSpace: 'pre-wrap'
  },
  errorBanner: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    color: '#f87171',
    padding: 10,
    borderRadius: 8,
    fontSize: 12
  },
  placeholderAppetize: {
    flex: 1,
    minHeight: 400,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed rgba(255,255,255,0.08)',
    borderRadius: 16
  },
  appetizeWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#020617',
    padding: 20,
    borderRadius: 16
  }
};
