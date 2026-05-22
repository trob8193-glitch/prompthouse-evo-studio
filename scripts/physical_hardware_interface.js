import { execSync } from 'child_process';
import process from 'process';
// Sovereign Network Matrix: Hardware Interface Daemon
// Physically maps and interrogates IP, WiFi, Bluetooth, Local Nodes, and Signals.

console.log("📡 [Hardware Daemon] Initiating Physical Subnet & Signal Sweep...");

const args = process.argv.slice(2);
let action = '';
let target = '';

for (const arg of args) {
    if (arg.startsWith('--action=')) {
        action = arg.split('=')[1];
    } else if (arg.startsWith('--target=')) {
        target = arg.split('=')[1];
    }
}

if (!action) {
    console.error("❌ [Hardware Daemon] Missing --action argument.");
    process.exit(1);
}

function runPhysical(cmd) {
    try {
        return execSync(cmd, { stdio: 'pipe' }).toString().trim();
    } catch (e) {
        return `[ERROR] Command failed: ${cmd}`;
    }
}

try {
    let result = {};

    switch (action) {
        case 'map_ip':
            console.log("📡 [Hardware Daemon] Mapping Physical IP Configuration...");
            result.ipconfig = runPhysical('ipconfig /all');
            break;

        case 'map_wifi':
            console.log("📡 [Hardware Daemon] Interrogating Physical WiFi Antennas...");
            result.wifi = runPhysical('netsh wlan show interfaces');
            result.profiles = runPhysical('netsh wlan show profiles');
            break;

        case 'map_bluetooth':
            console.log("📡 [Hardware Daemon] Polling Bluetooth Radios via PowerShell...");
            // Querying Windows Management Instrumentation for Bluetooth Devices
            result.bluetooth = runPhysical('powershell -Command "Get-PnpDevice -Class Bluetooth | Select-Object -Property Status, Class, FriendlyName | ConvertTo-Json"');
            break;

        case 'map_local_nodes':
            console.log("📡 [Hardware Daemon] Scanning Open Local Ports and Infrastructure Nodes...");
            result.netstat = runPhysical('netstat -ano | findstr LISTENING');
            break;

        case 'arp_sweep':
            console.log("📡 [Hardware Daemon] Sweeping Physical Subnet for Peer Devices...");
            result.arp = runPhysical('arp -a');
            break;

        case 'map_silicon':
            console.log("📡 [Hardware Daemon] Probing Silicon Telemetry via WMI...");
            result.cpu = runPhysical('powershell -Command "Get-CimInstance Win32_Processor | Select-Object -Property LoadPercentage, MaxClockSpeed | ConvertTo-Json"');
            result.os = runPhysical('powershell -Command "Get-CimInstance Win32_OperatingSystem | Select-Object -Property FreePhysicalMemory, TotalVisibleMemorySize | ConvertTo-Json"');
            break;

        case 'actuate_wifi_connect':
            if (!target) throw new Error("Requires --target=<SSID>");
            console.log(`📡 [Hardware Daemon] Forcing Physical WiFi Bind to: ${target}`);
            result.wifi_connect = runPhysical(`netsh wlan connect name="${target}"`);
            break;

        case 'actuate_hotspot':
            console.log("📡 [Hardware Daemon] Actuating Local Swarm Hotspot...");
            result.hotspot_set = runPhysical('netsh wlan set hostednetwork mode=allow ssid=PH-EVO-NEXUS key=SwarmConnect2026');
            result.hotspot_start = runPhysical('netsh wlan start hostednetwork');
            break;

        case 'ping_signals':
            console.log("📡 [Hardware Daemon] Broadcasting ICMP Signal Sweeps...");
            // Ping google DNS as a signal out/in test
            result.signal = runPhysical('ping 8.8.8.8 -n 1');
            break;

        case 'omnibus_sweep':
            console.log("📡 [Hardware Daemon] Executing OMNIBUS SWEEP (All Vectors)...");
            result.ipconfig = runPhysical('ipconfig');
            result.netstat = runPhysical('netstat -ano | findstr LISTENING');
            result.wifi = runPhysical('netsh wlan show interfaces');
            result.arp = runPhysical('arp -a');
            try {
                result.silicon = runPhysical('powershell -Command "Get-CimInstance Win32_Processor | Select-Object -Property LoadPercentage | ConvertTo-Json"');
            } catch (e) {
                result.silicon = "[ERROR] Silicon probe failed.";
            }
            break;

        default:
            console.error(`❌ [Hardware Daemon] Unknown physical action: ${action}`);
            process.exit(1);
    }

    console.log(JSON.stringify({ success: true, action, payload: result }));
    process.exit(0);

} catch (err) {
    console.error(`❌ [Hardware Daemon] Physical scan aborted: ${err.message}`);
    process.exit(1);
}
