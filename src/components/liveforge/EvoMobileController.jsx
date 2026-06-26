import React, { useState, useEffect } from 'react';
import { BRIDGE_URL } from '../../config/bridge-config.js';
import { Smartphone, Cloud, RefreshCw, Play, Download, Terminal, UploadCloud, MonitorSmartphone } from 'lucide-react';

export function EvoMobileController({ promptBridgeBaseUrl = BRIDGE_URL }) {
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
      setTimeout(refreshLocalDevices, 5000);
    } catch (err) {
      setCliActionStatus(`Error: ${err.message}`);
    }
  };

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
    <div className="flex flex-col gap-6 animate-in">
      
      {/* Navigation Headers */}
      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button 
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'local-cli' 
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
              : 'bg-transparent text-slate-400 border border-transparent hover:text-slate-200 hover:bg-white/5'
          }`}
          onClick={() => setActiveTab('local-cli')}
        >
          <Smartphone size={18} />
          Local CLI Emulator Controller
        </button>
        <button 
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'cloud-appetize' 
              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
              : 'bg-transparent text-slate-400 border border-transparent hover:text-slate-200 hover:bg-white/5'
          }`}
          onClick={() => setActiveTab('cloud-appetize')}
        >
          <Cloud size={18} />
          Cloud Appetize.io Streamer
        </button>
      </div>

      {activeTab === 'local-cli' && (
        <div className="flex flex-col gap-6 animate-in">
          <div className="glass-extreme rounded-2xl border-l-4 border-l-cyan-500 bg-cyan-950/20 p-4">
            <div className="text-cyan-100 font-bold mb-1">Control Local Virtual Devices</div>
            <p className="text-cyan-500/70 text-sm">Discovers and launches virtual machines configured in your local Android Studio or macOS Xcode development environments.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
            
            {/* Left Panel */}
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="text-lg font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter">Detected Local Emulators</div>
                <button 
                  className="glass-extreme px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-cyan-200 border-white/10 hover:border-white/30 hover:bg-white/5 transition-all flex items-center gap-2"
                  onClick={refreshLocalDevices} 
                  disabled={isLoadingDevices}
                >
                  <RefreshCw size={14} className={isLoadingDevices ? 'animate-spin' : ''} />
                  {isLoadingDevices ? 'Searching...' : 'Refresh List'}
                </button>
              </div>

              {deviceError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm">
                  {deviceError}
                </div>
              )}

              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {localDevices.length === 0 ? (
                  <div className="bg-black/50 border border-dashed border-white/10 p-8 rounded-2xl text-center text-slate-400 text-sm flex flex-col items-center gap-3">
                    <MonitorSmartphone size={32} className="opacity-50" />
                    <div>
                      No local Android AVDs or iOS Simulators discovered.
                      <p className="text-xs mt-2 opacity-60">Make sure 'emulator' or 'xcrun simctl' are in your system PATH.</p>
                    </div>
                  </div>
                ) : (
                  localDevices.map(d => (
                    <div
                      key={d.id}
                      onClick={() => setSelectedLocalDevice(d.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedLocalDevice === d.id 
                          ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                          : 'bg-black/40 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <strong className="text-slate-200">{d.name}</strong>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          d.status === 'BOOTED' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {d.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mb-3">{d.type} ({d.platform})</div>
                      
                      {d.status === 'SHUTDOWN' && (
                        <button 
                          className="w-full py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleBootLocalDevice(d); }}
                        >
                          <Play size={14} />
                          Boot Virtual Machine
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Panel */}
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl flex flex-col gap-5">
              <div className="text-lg font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter">Build Installer & Telemetry</div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Build Artifact Local Path</label>
                <input
                  type="text"
                  className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors w-full"
                  value={installPath}
                  onChange={e => setInstallPath(e.target.value)}
                />
                <span className="text-[11px] text-slate-500">Absolute path or path relative to studio root pointing to compiled APK/App.</span>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black border-none rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleInstallBuild}
                  disabled={!selectedLocalDevice}
                >
                  <Download size={16} />
                  Install to Booted Simulator
                </button>
                <button
                  className="flex-1 glass-extreme text-slate-200 border-white/10 hover:border-white/30 hover:bg-white/5 rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleFetchLocalLogs}
                  disabled={!selectedLocalDevice}
                >
                  <Terminal size={16} />
                  Read Native Logs
                </button>
              </div>

              {cliActionStatus && (
                <div className="bg-black/50 border border-cyan-500/20 rounded-xl p-4 mt-2">
                  <div className="text-xs font-bold text-cyan-500 mb-2 uppercase tracking-wider">Action Log</div>
                  <pre className="font-mono text-xs text-cyan-300 whitespace-pre-wrap">{cliActionStatus}</pre>
                </div>
              )}

              {localDeviceLogs && (
                <div className="bg-slate-950 border border-white/10 rounded-xl p-4 flex flex-col flex-1 max-h-[300px]">
                  <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Terminal size={14} /> Native Stream
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <pre className="font-mono text-[11px] text-cyan-400 whitespace-pre-wrap">{localDeviceLogs}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cloud-appetize' && (
        <div className="flex flex-col gap-6 animate-in">
          <div className="glass-extreme rounded-2xl border-l-4 border-l-purple-500 bg-purple-950/20 p-4">
            <div className="text-purple-100 font-bold mb-1">Cloud Virtualization streaming (Appetize.io)</div>
            <p className="text-purple-400/70 text-sm">Packages and streams your application bundle inside an interactive HTML5 cloud virtualization player. Perfect for sharing mobile previews with clients.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
            
            {/* Left Panel */}
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(168,85,247,0.05)] bg-black/40 backdrop-blur-xl flex flex-col gap-5">
              <div className="text-lg font-black text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-500 tracking-tighter">Cloud Upload Config</div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Appetize.io API Key (Required)</label>
                <input
                  type="password"
                  placeholder="Enter Appetize API token (Simulations disabled)"
                  className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 transition-colors w-full"
                  value={appetizeToken}
                  onChange={e => setAppetizeToken(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Build Binary Path</label>
                <input
                  type="text"
                  className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 transition-colors w-full"
                  value={installPath}
                  onChange={e => setInstallPath(e.target.value)}
                />
              </div>

              <button 
                className="w-full bg-purple-500 hover:bg-purple-400 text-black border-none rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors mt-2"
                onClick={handleAppetizeUpload}
              >
                <UploadCloud size={16} />
                Package & Stream to Appetize
              </button>

              <div className="mt-2 text-xs font-bold text-purple-400 bg-purple-950/30 p-3 rounded-lg border border-purple-500/20">
                Status: {appetizeStatus}
              </div>
            </div>

            {/* Right Panel */}
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(168,85,247,0.05)] bg-black/40 backdrop-blur-xl flex flex-col items-center justify-center min-h-[600px]">
              <div className="text-lg font-black text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-500 tracking-tighter self-start mb-6 w-full text-center">Interactive Cloud Canvas</div>
              
              {appetizeKey === 'demo' ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/10 rounded-3xl bg-black/20 w-full max-w-sm">
                  <Smartphone size={48} className="text-purple-500/50 mb-4" />
                  <strong className="text-slate-300 text-lg">Appetize Stream Deck</strong>
                  <p className="text-center opacity-60 text-sm mt-3 text-slate-400 leading-relaxed">
                    Upload your build bundle using the configuration on the left to stream it here.
                  </p>
                </div>
              ) : (
                <div className="flex justify-center bg-black/50 rounded-[2.5rem] p-4 shadow-2xl border border-white/5">
                  <iframe
                    src={`https://appetize.io/embed/${appetizeKey}?device=iphone15pro&scale=100&autoplay=true&orientation=portrait&deviceColor=black`}
                    width="378px"
                    height="800px"
                    frameBorder="0"
                    scrolling="no"
                    style={{ borderRadius: '2rem', border: 'none', background: '#000' }}
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
