import { TerminalLogic } from '../src/features/terminal_logic.js';

async function executeOmniBond() {
  console.log('⚡ Initializing Sovereign Omni-Bond Sequence...\n');
  try {
    const logic = new TerminalLogic();
    const result = await logic.handleEvoCommand('bond omni', 'omni_cli');
    console.log(result.output);
  } catch (error) {
    console.error('❌ Omni-Bond Failed:', error.message);
    process.exit(1);
  }
}

executeOmniBond();
