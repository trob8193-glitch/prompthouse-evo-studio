import { createCapabilityManifest } from '../src/core/capabilities/EvoCapabilityContract.js';
import { HardenedCommandGateway } from '../src/core/terminal/HardenedCommandGateway.js';

const args = process.argv.slice(2);
const mode = args[0] || 'manifest';
const gateway = new HardenedCommandGateway({ rootDir: process.cwd() });

function print(value) {
  console.log(JSON.stringify(value, null, 2));
}

try {
  if (mode === 'commands') {
    print({ success: true, commands: gateway.listAllowedCommands() });
  } else if (mode === 'run') {
    const command = args.slice(1).join(' ');
    const approvalToken = process.env.EVO_APPROVAL_TOKEN || null;
    const result = await gateway.run(command, { approvalToken });
    print(result);
    if (!result.success) process.exit(1);
  } else {
    print({ success: true, manifest: createCapabilityManifest({ label: 'cli_manifest' }) });
  }
} catch (error) {
  print({ success: false, error: error.message, code: 'EVO_CAPABILITY_CLI_ERROR' });
  process.exit(1);
}
