const fs = require('fs');
const path = 'src/core/interop/UniversalBridge.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Inject the Decision Edge into dispatch
const decisionLogic = `
    // EDGE: Sovereign Decision Logic (Wiring all protocols)
    let finalOptions = { ...params };
    const witnessState = useWitnessStore.getState();
    const credits = witnessState.active_state.credits || 10000;

    if (credits < 500) {
      console.warn('⚠️ [BridgeEdge] Low Credits. Forcing Survival Mode (LOCAL_ONLY).');
      finalOptions.provider = 'none'; // Forces local Evo-LM
      witnessState.snapshotState({ ...witnessState.active_state, protocol: 'SURVIVAL' });
    } else if (credits < 2000) {
      console.log('🧪 [BridgeEdge] Optimizing. Forcing HYBRID Speculative Drafting.');
      finalOptions.hybrid = true;
      witnessState.snapshotState({ ...witnessState.active_state, protocol: 'HYBRID' });
    } else {
      witnessState.snapshotState({ ...witnessState.active_state, protocol: 'RECYCLING' });
    }
`;

content = content.replace('const adaptor = this.adaptors[toolId];', decisionLogic + '\n    const adaptor = this.adaptors[toolId];');

// 2. Pass finalOptions to adaptor.execute
content = content.replace('await adaptor.execute(command, params);', 'await adaptor.execute(command, finalOptions);');

fs.writeFileSync(path, content);
console.log('Successfully edged UniversalBridge with autonomous decision logic.');
