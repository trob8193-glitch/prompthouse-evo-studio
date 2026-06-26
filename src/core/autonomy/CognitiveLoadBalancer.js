import { Log } from './SovereignLogger.js';
import { GlobalSplitTether } from '../tethers/SplitTetherDaemon.js';

class CognitiveLoadBalancerCore {
  constructor() {
    this.frictionEvents = 0;
    this.flowEvents = 0;
    this.currentState = 'NEUTRAL'; // NEUTRAL, ZEN, ASSIST
  }

  /**
   * Called when the developer performs a smooth, successful action (e.g. rapid typing, successful merges).
   */
  registerFlowEvent() {
    this.flowEvents += 1;
    this.frictionEvents = Math.max(0, this.frictionEvents - 0.5); // Decay friction
    this.evaluateCognitiveState();
  }

  /**
   * Called when the developer hits errors, stalls, or reverts code.
   */
  registerFrictionEvent(weight = 1) {
    this.frictionEvents += weight;
    this.flowEvents = Math.max(0, this.flowEvents - 0.5); // Decay flow
    this.evaluateCognitiveState();
  }

  evaluateCognitiveState() {
    let nextState = 'NEUTRAL';
    
    if (this.flowEvents > 5 && this.frictionEvents < 2) {
      nextState = 'ZEN';
    } else if (this.frictionEvents > 3) {
      nextState = 'ASSIST';
    }

    if (nextState !== this.currentState) {
      Log.info(`🧠 [CognitiveLoadBalancer] Developer state shifted: ${this.currentState} -> ${nextState}`);
      this.currentState = nextState;
      this.morphUI(nextState);
    }
  }

  morphUI(state) {
    let layoutConfig = {};
    if (state === 'ZEN') {
      layoutConfig = {
        sidebarsVisible: false,
        terminalVisible: false,
        copilotIntrusiveness: 'LOW',
        theme: 'minimalist-dark'
      };
      Log.success('🧠 [CognitiveLoadBalancer] Flow state detected. Morphing UI into Zen Mode.');
    } else if (state === 'ASSIST') {
      layoutConfig = {
        sidebarsVisible: true,
        terminalVisible: true,
        copilotIntrusiveness: 'HIGH',
        debuggerVisible: true,
        theme: 'high-contrast'
      };
      Log.warn('🧠 [CognitiveLoadBalancer] High cognitive load detected. Morphing UI into Assist Mode.');
    } else {
      layoutConfig = {
        sidebarsVisible: true,
        terminalVisible: false,
        copilotIntrusiveness: 'NORMAL',
        theme: 'standard'
      };
    }

    // [SPLIT-TETHER AMPLIFICATION] Broadcast physical UI change to Editor and Mobile Controller
    GlobalSplitTether.splitAndRoute('CognitiveLoadBalancer', { 
      type: 'COGNITIVE_STATE_CHANGE', 
      cognitiveState: state,
      layoutConfig 
    }).catch(() => {});
  }
}

export const CognitiveLoadBalancer = new CognitiveLoadBalancerCore();
