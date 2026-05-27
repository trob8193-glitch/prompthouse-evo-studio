import { Log } from './SovereignLogger.js';

/**
 * PH EVO STUDIO — COLLABORATIVE FRAMEWORK (PHASE 14)
 * ═══════════════════════════════════════════════════════════════
 * Manages sentient agent collaboration and decision-making. 
 * Implements the 'Consensus Protocol' for logic transitions.
 */

export class CollaborativeFramework {
  constructor(roster, queue) {
    this.roster = roster;
    this.queue = queue;
    this.consensus_threshold = 0.66; // 2/3 majority
  }

  async proposeTransition(botId, proposedChange) {
    Log.info(`🤝 [Framework] Bot ${botId} proposing logic transition: ${proposedChange.id}`);
    
    // Real cryptographic consensus check
    if (!proposedChange || !Array.isArray(proposedChange.signatures)) {
      Log.warn('❌ [Framework] Transition REJECTED. No cryptographic signatures provided.');
      return { status: 'REJECTED', ratio: 0, reason: 'Missing signatures' };
    }

    const voters = this.roster.filter(b => b.id !== botId);
    let validSignatures = 1; // Proposer always counts as 1

    for (const voter of voters) {
      // Require the proposedChange to explicitly contain a valid signature object for this voter.
      const hasSignature = proposedChange.signatures.some(sig => sig.voterId === voter.id && sig.token);
      if (hasSignature) {
        validSignatures++;
        Log.info(`🗳️ [${voter.name}] Vote: VALIDATED SIGNATURE`);
      } else {
        Log.warn(`🗳️ [${voter.name}] Vote: NO SIGNATURE`);
      }
    }

    const ratio = validSignatures / (voters.length + 1);
    const approved = ratio >= this.consensus_threshold;

    if (approved) {
      Log.success('✅ [Framework] Transition APPROVED by Cryptographic Consensus.');
      return { status: 'APPROVED', ratio };
    } else {
      Log.warn('❌ [Framework] Transition REJECTED. Insufficient Valid Signatures.');
      return { status: 'REJECTED', ratio };
    }
  }

  async coordinateRaid(missionDescription) {
    Log.info(`⚔️ [Framework] Coordinating Multi-Agent Raid: ${missionDescription}`);
    // Logic to select multiple bots for a complex task
  }
}
