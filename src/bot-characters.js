/**
 * PH EVO STUDIO — SENTIENT BOT ROSTER (PHASE 13 MANIFEST)
 * ═══════════════════════════════════════════════════════════════
 * The official 21-member Evo Dev Team. These are bio-mechanical 
 * sentient agents in gold-and-green cybernetic armor.
 */

export const EVO_DEV_TEAM = [
  { id: 1, name: 'LION', role: 'Lead Architect', specialty: 'Structural Integrity', color: '#f59e0b' },
  { id: 2, name: 'PANTHER', role: 'Security Infiltrator', specialty: 'Encryption/Bypass', color: '#10b981' },
  { id: 3, name: 'OWL', role: 'Knowledge Weaver', specialty: 'Global Context', color: '#f59e0b' },
  { id: 4, name: 'EAGLE', role: 'Visionary Scout', specialty: 'UI/UX Oversight', color: '#10b981' },
  { id: 5, name: 'TIGER', role: 'Logic Striker', specialty: 'Algorithmic Speed', color: '#f59e0b' },
  { id: 6, name: 'FOX', role: 'Strategic Deceiver', specialty: 'Edge-Case Debugging', color: '#10b981' },
  { id: 7, name: 'CHEETAH', role: 'Rapid Deployer', specialty: 'Build Optimization', color: '#f59e0b' },
  { id: 8, name: 'WOLF', role: 'Swarm Coordinator', specialty: 'Parallel Processing', color: '#10b981' },
  { id: 9, name: 'GORILLA', role: 'Infrastructure Heavy', specialty: 'Database/Storage', color: '#f59e0b' },
  { id: 10, name: 'RHINO', role: 'Breach Specialist', specialty: 'Stress Testing', color: '#10b981' },
  { id: 11, name: 'COBRA', role: 'Injection specialist', specialty: 'Security Auditing', color: '#f59e0b' },
  { id: 12, name: 'FALCON', role: 'Precision Sniper', specialty: 'Bug Elimination', color: '#10b981' },
  { id: 13, name: 'JAGUAR', role: 'Silken Threader', specialty: 'Seamless Integration', color: '#f59e0b' },
  { id: 14, name: 'BEAR', role: 'Guardian Tank', specialty: 'System Resilience', color: '#10b981' },
  { id: 15, name: 'RAM', role: 'Forceful Pusher', specialty: 'Deployment Velocity', color: '#f59e0b' },
  { id: 16, name: 'LEOPARD', role: 'Adaptive Hunter', specialty: 'Self-Healing Code', color: '#10b981' },
  { id: 17, name: 'LYNX', role: 'Subtle Observer', specialty: 'Logging/Monitoring', color: '#f59e0b' },
  { id: 18, name: 'BULL', role: 'Market Mover', specialty: 'Commerce/Analytics', color: '#10b981' },
  { id: 19, name: 'RAVEN', role: 'Shadow Oracle', specialty: 'Predictive Analysis', color: '#f59e0b' },
  { id: 20, name: 'CROCODILE', role: 'Deep Diver', specialty: 'Legacy Code Excavation', color: '#10b981' },
  { id: 21, name: 'HYENA', role: 'Resource Scavenger', specialty: 'Garbage Collection', color: '#f59e0b' }
];

export const getBotById = (id) => EVO_DEV_TEAM.find(b => b.id === id);
