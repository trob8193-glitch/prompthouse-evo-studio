import os from 'os';
import fs from 'fs';
import path from 'path';

function boolEnv(env, key) {
  return env[key] === 'true';
}

function activeNetworkInterfaces() {
  return Object.entries(os.networkInterfaces())
    .flatMap(([name, interfaces = []]) => interfaces.map((item) => ({ name, ...item })))
    .filter((item) => !item.internal && item.address);
}

function capability(id, label, status, evidence = {}, blockers = []) {
  return {
    id,
    label,
    status,
    truthState: blockers.length ? 'PERMISSION_OR_PROVIDER_GATED' : status,
    evidence,
    blockers
  };
}

export function buildEdgeIoAudit({ rootDir = process.cwd(), env = process.env } = {}) {
  const network = activeNetworkInterfaces();
  const hasNavigator = typeof globalThis.navigator === 'object';
  const hasBarcodeDetector = typeof globalThis.BarcodeDetector === 'function';
  const hasAudioContext = typeof globalThis.AudioContext === 'function' || typeof globalThis.webkitAudioContext === 'function';
  const hubReady = Boolean(env.GLOBAL_EVO_HUB_URL && env.GLOBAL_EVO_HUB_TOKEN && env.GLOBAL_EVO_NODE_SIGNING_SECRET);
  const reportPath = path.join(rootDir, '.prompthouse-data', 'edge_io_audit_report.json');

  const surfaces = [
    capability(
      'network_interfaces',
      'Network interfaces and internet path',
      network.length ? 'NETWORK_INTERFACES_DETECTED' : 'NETWORK_INTERFACES_NOT_DETECTED',
      { interfaceCount: network.length, families: [...new Set(network.map((item) => item.family))] },
      network.length ? [] : ['No active non-internal network interface was detected.']
    ),
    capability(
      'wifi',
      'Wi-Fi adapter and SSID scan',
      boolEnv(env, 'EDGE_IO_ALLOW_WIFI_SCAN') ? 'WIFI_SCAN_ARMED_NOT_PROVEN' : 'WIFI_SCAN_PERMISSION_REQUIRED',
      { canSeeNetworkInterfaces: network.length > 0 },
      ['Wi-Fi SSID scanning requires native OS permission/provider code and is not available from ordinary browser JavaScript.']
    ),
    capability(
      'bluetooth',
      'Bluetooth device access',
      hasNavigator && globalThis.navigator.bluetooth ? 'WEB_BLUETOOTH_AVAILABLE_PERMISSION_REQUIRED' : 'BLUETOOTH_RUNTIME_REQUIRED',
      { webBluetooth: Boolean(hasNavigator && globalThis.navigator.bluetooth), allowFlag: boolEnv(env, 'EDGE_IO_ALLOW_BLUETOOTH') },
      ['Bluetooth requires Web Bluetooth or a native Bluetooth adapter with explicit device permission.']
    ),
    capability(
      'barcode_qr',
      'Barcode and QR scanning',
      hasBarcodeDetector ? 'BARCODE_DETECTOR_AVAILABLE_PERMISSION_REQUIRED' : 'BARCODE_DETECTOR_OR_CAMERA_PROVIDER_REQUIRED',
      { barcodeDetector: hasBarcodeDetector, allowCamera: boolEnv(env, 'EDGE_IO_ALLOW_CAMERA') },
      ['Barcode/QR scanning requires camera permission and BarcodeDetector or an installed scanner provider.']
    ),
    capability(
      'invisible_signals_waves',
      'Invisible signals, ultrasonic waves, and audio beacons',
      hasAudioContext ? 'AUDIO_SIGNAL_RUNTIME_AVAILABLE_PERMISSION_REQUIRED' : 'AUDIO_SIGNAL_RUNTIME_REQUIRED',
      { audioContext: hasAudioContext, allowUltrasonic: boolEnv(env, 'EDGE_IO_ALLOW_ULTRASONIC') },
      ['Ultrasonic or wave channels require microphone/speaker permission, browser audio runtime, and local proof capture.']
    ),
    capability(
      'nfc',
      'NFC and near-field tags',
      hasNavigator && globalThis.navigator.nfc ? 'WEB_NFC_AVAILABLE_PERMISSION_REQUIRED' : 'NFC_RUNTIME_REQUIRED',
      { webNfc: Boolean(hasNavigator && globalThis.navigator.nfc), allowNfc: boolEnv(env, 'EDGE_IO_ALLOW_NFC') },
      ['NFC requires a compatible device/browser or native provider with explicit permission.']
    ),
    capability(
      'serial_usb_hid',
      'Serial, USB, and HID devices',
      hasNavigator && (globalThis.navigator.serial || globalThis.navigator.usb || globalThis.navigator.hid)
        ? 'DEVICE_IO_AVAILABLE_PERMISSION_REQUIRED'
        : 'DEVICE_IO_RUNTIME_REQUIRED',
      {
        serial: Boolean(hasNavigator && globalThis.navigator.serial),
        usb: Boolean(hasNavigator && globalThis.navigator.usb),
        hid: Boolean(hasNavigator && globalThis.navigator.hid),
        allowSerial: boolEnv(env, 'EDGE_IO_ALLOW_SERIAL'),
        allowUsb: boolEnv(env, 'EDGE_IO_ALLOW_USB'),
        allowHid: boolEnv(env, 'EDGE_IO_ALLOW_HID')
      },
      ['Serial/USB/HID access requires browser or native provider support and explicit device selection.']
    ),
    capability(
      'input_output',
      'Input/output channels',
      'LOCAL_PROCESS_IO_AVAILABLE',
      { stdin: Boolean(process.stdin), stdout: Boolean(process.stdout), fileSystem: true },
      ['Camera, microphone, clipboard, and hardware outputs still require runtime permission before use.']
    ),
    capability(
      'evo_api',
      'Evo API and global node hub',
      hubReady ? 'GLOBAL_EVO_HUB_READY_TO_SUBMIT' : 'GLOBAL_EVO_HUB_PROVIDER_GATED',
      {
        bridgePort: env.BRIDGE_PORT || '3001',
        hubUrlConfigured: Boolean(env.GLOBAL_EVO_HUB_URL),
        hubTokenConfigured: Boolean(env.GLOBAL_EVO_HUB_TOKEN),
        nodeSigningConfigured: Boolean(env.GLOBAL_EVO_NODE_SIGNING_SECRET)
      },
      hubReady ? [] : ['GLOBAL_EVO_HUB_URL, GLOBAL_EVO_HUB_TOKEN, and GLOBAL_EVO_NODE_SIGNING_SECRET are required for global node submission.']
    )
  ];

  const blockers = surfaces.flatMap((surface) => surface.blockers.map((reason) => ({ surface: surface.id, reason })));
  const report = {
    success: true,
    generatedAt: new Date().toISOString(),
    truthState: blockers.length ? 'EDGE_IO_PERMISSION_OR_PROVIDER_GATED' : 'EDGE_IO_READY',
    runtime: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    },
    surfaces,
    blockers,
    reportPath
  };

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  return report;
}
