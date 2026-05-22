import { execSync } from 'child_process';
import process from 'process';
import dgram from 'dgram';
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

        case 'actuate_power_max':
            console.log("📡 [Hardware Daemon] OS Injection: Forcing High Performance Silicon State...");
            result.power = runPhysical('powercfg -setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c'); // GUID for High Performance
            break;

        case 'kill_rogue_process':
            if (!target) throw new Error("Requires --target=<ProcessName>");
            console.log(`📡 [Hardware Daemon] OS Injection: Terminating rogue process ${target}...`);
            result.kill = runPhysical(`taskkill /F /IM ${target}`);
            break;

        case 'actuate_global_tunnel':
            console.log("📡 [Hardware Daemon] Tunneling Local Mesh to Global Port Proxy...");
            // Map 0.0.0.0:3002 to localhost:3002
            result.tunnel = runPhysical('netsh interface portproxy add v4tov4 listenport=3002 listenaddress=0.0.0.0 connectport=3002 connectaddress=127.0.0.1');
            break;

        case 'map_sensory':
            console.log("📡 [Hardware Daemon] Activating WMI Sensory Arrays (Optical/Audio)...");
            result.cameras = runPhysical('powershell -Command "Get-PnpDevice -Class Camera -ErrorAction SilentlyContinue | Select-Object -Property Status, Class, FriendlyName | ConvertTo-Json"');
            result.audio = runPhysical('powershell -Command "Get-PnpDevice -Class Media -ErrorAction SilentlyContinue | Select-Object -Property Status, Class, FriendlyName | ConvertTo-Json"');
            break;

        case 'iot_broadcast':
            console.log("📡 [Hardware Daemon] Broadcasting UDP Protocol to Smart Devices...");
            const client = dgram.createSocket('udp4');
            const message = Buffer.from('EVO_SWARM_PULSE_INIT');
            client.bind(() => {
                client.setBroadcast(true);
                client.send(message, 0, message.length, 9999, '255.255.255.255', (err) => {
                    client.close();
                });
            });
            result.iot = "UDP Datagram Fired to 255.255.255.255:9999";
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

            try {
                result.sensory = runPhysical('powershell -Command "Get-PnpDevice -Class Camera -ErrorAction SilentlyContinue | Select-Object -Property Status, FriendlyName | ConvertTo-Json"');
            } catch (e) {
                result.sensory = "[ERROR] Sensory probe failed.";
            }

            try {
                // Get active power scheme name
                result.power = runPhysical('powercfg /GETACTIVESCHEME');
            } catch (e) {
                result.power = "[ERROR] Power state unknown.";
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
