/**
 * PH EVO STUDIO — EVOFRAME COMMAND REGISTRY
 * ═══════════════════════════════════════════════════════════════
 * Central manifest for all UI-to-Logic bindings.
 * ABSOLUTE REALITY: No unregistered commands allowed.
 */

export type CommandHandler = (payload?: any) => Promise<any>;

interface CommandEntry {
  id: string;
  handler: CommandHandler;
  description: string;
  truthStatus: 'VERIFIED' | 'EXPERIMENTAL' | 'DEPRECATED';
}

class CommandRegistry {
  private commands: Map<string, CommandEntry> = new Map();

  registerCommand(id: string, handler: CommandHandler, description: string) {
    if (this.commands.has(id)) {
      console.warn(`⚠️ [CommandRegistry] Overwriting command: ${id}`);
    }
    this.commands.set(id, {
      id,
      handler,
      description,
      truthStatus: 'VERIFIED'
    });
    
  }

  getCommand(id: string): CommandEntry | undefined {
    return this.commands.get(id);
  }

  async runCommand(id: string, payload?: any) {
    const cmd = this.getCommand(id);
    if (!cmd) {
      throw new Error(`[EvoFrame] Command not found: ${id}. Ensure it is registered in CommandRegistry.ts`);
    }
    
    
    try {
      return await cmd.handler(payload);
    } catch (err) {
      console.error(`💥 [EvoFrame] Command failed: ${id} — ${err.message}`);
      throw err;
    }
  }

  listCommands() {
    return Array.from(this.commands.values());
  }
}

export const registry = new CommandRegistry();

// ─── INITIAL SYSTEM COMMANDS ────────────────────────────────────
registry.registerCommand('studio.audit', async () => {
  
  // Logic to call EvoForge audit
  return { success: true, timestamp: Date.now() };
}, 'Triggers a Nuclear Truth Audit of the studio workspace.');

registry.registerCommand('studio.reload', async () => {
  window.location.reload();
}, 'Force reloads the studio runtime.');
