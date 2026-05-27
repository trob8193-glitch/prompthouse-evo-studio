import React, { useState, useEffect } from 'react';

export function EvoMobileController({ promptBridgeBaseUrl = "http://127.0.0.1:3001" }) {
  const [activeTab, setActiveTab] = useState('local-cli');

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

  return (
    <div style={styles.shell}>
      {/* Navigation Headers */}
      <div style={styles.navBar}>
        <button style={activeTab === 'local-cli' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('local-cli')}>Local CLI Emulator Controller</button>
        <button style={activeTab === 'cloud-appetize' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('cloud-appetize')}>Cloud Appetize.io Streamer</button>
      </div>

      {activeTab === 'local-cli' && (
        <div style={styles.tabContent}>
          <div style={styles.helpTextHeader}>
            <strong>Control Local Virtual Devices</strong>
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
            <strong>Cloud Virtualization streaming (Appetize.io)</strong>
            <p>Packages and streams your application bundle inside an interactive HTML5 cloud virtualization player. Perfect for sharing mobile previews with clients.</p>
          </div>

          <div style={styles.gridColumns}>
            <div style={styles.leftGridPanel}>
              <div style={styles.panelTitle}>Cloud Upload Config</div>
              
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Appetize.io API Key (Required)</label>
                <input
                  type="password"
                  placeholder="Enter Appetize API token (Simulations disabled)"
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
  panelTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: '#f8f0de',
    letterSpacing: '-0.02em'
  },
  refreshBtn: {
    background: '#1e293b',
    color: '#f8f0de',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600
  },
  errorBanner: {
    background: 'rgba(239,68,68,0.15)',
    color: '#f87171',
    border: '1px solid rgba(239,68,68,0.3)',
    padding: 12,
    borderRadius: 8,
    fontSize: 13
  },
  deviceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxHeight: 400,
    overflowY: 'auto'
  },
  emptyDevices: {
    background: '#070a12',
    padding: 24,
    borderRadius: 12,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 13,
    border: '1px dashed rgba(255,255,255,0.1)'
  },
  deviceItem: {
    background: '#070a12',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  deviceHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  statusTag: {
    fontSize: 10,
    padding: '2px 8px',
    borderRadius: 12,
    fontWeight: 700
  },
  deviceDetails: {
    fontSize: 12,
    color: '#94a3b8'
  },
  smallActionBtn: {
    marginTop: 10,
    width: '100%',
    background: 'rgba(245,185,66,0.1)',
    color: '#f5b942',
    border: '1px solid rgba(245,185,66,0.3)',
    borderRadius: 6,
    padding: '6px',
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 600
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#94a3b8'
  },
  textInput: {
    background: '#070a12',
    color: '#f8f0de',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 13,
    width: '100%',
    boxSizing: 'border-box'
  },
  fieldHelp: {
    fontSize: 11,
    color: '#64748b'
  },
  actionButtonGroup: {
    display: 'flex',
    gap: 12,
    marginTop: 8
  },
  primaryActionBtn: {
    flex: 1,
    background: '#22d3ee',
    color: '#000',
    border: 'none',
    borderRadius: 8,
    padding: '10px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer'
  },
  secondaryActionBtn: {
    flex: 1,
    background: '#1e293b',
    color: '#f8f0de',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: '10px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer'
  },
  statusConsole: {
    background: '#070a12',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#f5b942',
    fontSize: 13,
    marginTop: 12
  },
  logStreamConsole: {
    background: '#020617',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 300
  },
  logsConsoleContent: {
    margin: '8px 0 0 0',
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#38bdf8',
    overflowY: 'auto',
    flex: 1,
    whiteSpace: 'pre-wrap'
  },
  placeholderAppetize: {
    flex: 1,
    background: '#070a12',
    border: '1px dashed rgba(255,255,255,0.15)',
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 500
  },
  appetizeWrapper: {
    display: 'flex',
    justifyContent: 'center',
    background: '#070a12',
    borderRadius: 16,
    padding: 16
  }
};
