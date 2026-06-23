import React, { useEffect, useRef } from 'react';
import { useSovereignStore } from '../store.js';

export default function OmniDaemons() {
  const globalTheme = useSovereignStore((s) => s.globalTheme);
  const addTerminalLog = useSovereignStore((s) => s.addTerminalLog);
  const activeThemeId = globalTheme?.theme || 'evoCore';

  // Refs to hold daemon intervals
  const daemonRefs = useRef({});

  useEffect(() => {
    // Clear all existing daemons when theme changes
    Object.values(daemonRefs.current).forEach(clearInterval);
    daemonRefs.current = {};

    addTerminalLog(`[OMNI-EVOLUTION] Daemon Engine shifting state to match theme: ${activeThemeId}`, 'info', 'main');

    // Spin up specific daemons based on theme
    if (activeThemeId === 'layoutTerminalFullscreen') {
        daemonRefs.current.terminal = setInterval(() => {
            const memoryAddr = '0x' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase();
            addTerminalLog(`[ROOT DAEMON] Injecting payload at address ${memoryAddr}. Overriding root protocols...`, 'system', 'main');
        }, 3000);
    } 
    else if (activeThemeId === 'extremeWindows95') {
        daemonRefs.current.win95 = setInterval(() => {
            addTerminalLog(`[SYSTEM_DAEMON_95] Out of Memory Exception. IRQ conflict on port 220.`, 'error', 'main');
        }, 5000);
    }
    else if (activeThemeId === 'layoutCmdCenter') {
        daemonRefs.current.cmdCenter = setInterval(() => {
            const nodes = Math.floor(Math.random() * 500) + 1000;
            addTerminalLog(`[DATA_DAEMON] Processing ${nodes} parallel data nodes. Temporal shift active.`, 'info', 'main');
        }, 2000);
    }
    else if (activeThemeId === 'cyberpunk') {
        daemonRefs.current.cyber = setInterval(() => {
            addTerminalLog(`[ICE_BREAKER_DAEMON] Ping sent to shadow node... No response. Retrying attack vector.`, 'warning', 'security');
        }, 4000);
    }
    else if (activeThemeId === 'extremeGoldenRatio') {
        daemonRefs.current.fibonacci = setInterval(() => {
            addTerminalLog(`[FIBONACCI_DAEMON] Calculating sequence depth... 1, 1, 2, 3, 5, 8, 13, 21, 34, 55.`, 'info', 'main');
        }, 3500);
    }

    return () => {
        Object.values(daemonRefs.current).forEach(clearInterval);
    };
  }, [activeThemeId, addTerminalLog]);

  return null; // This is a headless logic component
}
