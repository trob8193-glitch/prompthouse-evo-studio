import { runEvoLayerStatus, runEvoLayerSnapshot, runEvoLayerX10, createEvoLayerManifest } from '../src/core/evo-layer/index.js';

const args = process.argv.slice(2);
const mode = args[0] || 'status';

function print(value) {
  console.log(JSON.stringify(value, null, 2));
}

try {
  if (mode === 'manifest') {
    print(createEvoLayerManifest({ label: args[1] || 'manual_manifest' }));
  } else if (mode === 'snapshot') {
    print(runEvoLayerSnapshot({ label: args[1] || 'manual_snapshot' }));
  } else if (mode === 'x10') {
    print(runEvoLayerX10());
  } else {
    print(runEvoLayerStatus());
  }
} catch (error) {
  print({ success: false, error: error.message, code: 'EVO_LAYER_CLI_ERROR' });
  process.exit(1);
}
