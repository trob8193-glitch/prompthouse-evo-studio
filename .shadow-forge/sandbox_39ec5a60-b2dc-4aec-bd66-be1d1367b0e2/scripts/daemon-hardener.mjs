/**
 * PH EVO STUDIO — DAEMON HARDENER UTILITY
 * ═══════════════════════════════════════════════════════════════
 * Co-authored by: Antigravity AI + OpenAI GPT-4o-mini Teammate
 *
 * Import this into any daemon script to add production error boundaries,
 * heartbeat monitoring, and graceful shutdown handling.
 *
 * Usage:
 *   import { hardenProcess, createDaemonHeartbeat } from './daemon-hardener.mjs';
 *   hardenProcess('my-daemon');
 *   createDaemonHeartbeat('my-daemon', 60000);
 */

export function hardenProcess(name) {
  const log = (eventType, message) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      daemon: name,
      eventType,
      message,
    };
    console.error(JSON.stringify(logEntry));
  };

  process.on('uncaughtException', (error) => {
    log('uncaughtException', error.message);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    log('unhandledRejection', reason instanceof Error ? reason.message : String(reason));
    process.exit(1);
  });

  process.on('SIGINT', () => {
    log('SIGINT', 'Received SIGINT, shutting down...');
    gracefulShutdown(name, () => log('cleanup', 'Cleanup completed.'));
  });

  process.on('SIGTERM', () => {
    log('SIGTERM', 'Received SIGTERM, shutting down...');
    gracefulShutdown(name, () => log('cleanup', 'Cleanup completed.'));
  });

  log('init', `Daemon "${name}" hardened with error boundaries.`);
}

export function createDaemonHeartbeat(name, intervalMs = 60000) {
  return setInterval(() => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      daemon: name,
      eventType: 'heartbeat',
      message: 'Daemon is alive',
    };
    console.error(JSON.stringify(logEntry));
  }, intervalMs);
}

export function gracefulShutdown(name, cleanupFn) {
  if (typeof cleanupFn === 'function') {
    cleanupFn();
  }
  const logEntry = {
    timestamp: new Date().toISOString(),
    daemon: name,
    eventType: 'shutdown',
    message: 'Graceful shutdown complete.',
  };
  console.error(JSON.stringify(logEntry));
  process.exit(0);
}
