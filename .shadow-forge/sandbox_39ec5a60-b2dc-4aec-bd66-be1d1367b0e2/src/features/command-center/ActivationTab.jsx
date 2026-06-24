import React from 'react';

export function ActivationTab({ buildOrder, cardStyle }) {
  return (
    <div style={{ ...cardStyle, background: '#020617' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: 24, fontWeight: 900 }}>Production Build Script</h2>
      <textarea 
        readOnly
        style={{ width: '100%', minHeight: 450, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, color: '#e2e8f0', fontFamily: 'monospace', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }}
        value={`PROMPTHOUSE EVO AUTONOMOUS SELF-BUILD ACTIVATION

MISSION:
Build and wire PromptHouse Evo Studio past-MVP execution layer using all current studio inventions: PromptBase, Saved Missions, Proof Deck, Browser Agent Bridge, PromptLink, PromptBridge, LiveForge, ForgeRender, Swarm Fission Arena, ForgeFriction Gate, Temporal Stackchain, VectorPack Compression, Evo Studio DeployRail, Commerce Rail, NightForge Daemon, Evo WorkTwin Vault, Pattern Miner, Tool Autogenerator, Proof-to-Value Deck, and Evo Exchange.

PUBLIC SPEECH:
Only the 11 public PromptHouse bots respond by default. Senior bots support internally.

SELF-BUILD LOOP:
scan repo → canon check → module gap analysis → create safe patches → wire UI/API/models → run tests → create receipts → score all gates → repair weakest gate → repeat until blocked by missing runtime, credentials, approval, or destructive action.

NO-BULLSHIT RULE:
Do not claim 100%, 10/10, production deploy, revenue, users, extension publish, render output, or live Stripe until real proof exists.

APPROVAL REQUIRED:
production deploy, live Stripe, external messages, paid provider calls, secrets changes, destructive terminal commands, app-store submission, user data deletion.

OUTPUT EACH CYCLE:
Mission, Owner, Support, Built, Verified, Blocked, Broken, Recommended, Files changed, Tests run, Proof receipts, Scores, Weakest gate, Next repair.

BUILD ORDER:
${buildOrder.map((item, index) => `${index + 1}. ${item}`).join("\n")}`}
      />
    </div>
  );
}
