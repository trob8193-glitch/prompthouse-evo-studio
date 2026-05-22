# Evo Studio: The Autonomous Omni-Mesh IDE

Evo Studio is an Autonomous Omni-Mesh IDE with deep physical hardware actuation. It transcends standard code editors by merging an autonomous LLM core with a physical "God Node" architecture—capable of interrogating silicon telemetry, spawning Swarm networks, and manipulating local hardware states to reinforce its own intelligence.

## Absolute Singularity Architecture

- **Reinforcement Learning from Environment (RLE):** The Evo LLM monitors live silicon (CPU/RAM) and physical network feedback to optimize its code generation and logic loops.
- **GitOps Reward Function:** Continuous test-build-verify pipelines act as a strict binary reward function for autonomous agentic progression.
- **Federated Swarm Compute:** Subnet ARP radar and global tunnels (`netsh portproxy`) allow the Studio to connect with physical peers.
- **Sensory & IoT Grounding:** Live WMI queries of the physical machine's camera/mic, alongside UDP datagram broadcasts for IoT synchronization.

## 🚀 Installation & Quick Start

Execute the following pipeline to bootstrap the Omni-Mesh and prove 100% build integrity:

```powershell
npm install
npm run build
npm run verify:studio
```

Once verified, launch the Sovereign Stack:

```powershell
# Boot the PromptBridge OS Server
npm run bridge

# Boot the Studio Vite Shell (in a separate terminal)
npm run dev
```

## Verify Local Diagnostics

Once the bridge is live, you can physically verify the node's pulse:
- [Bridge Status](http://localhost:3001/status)
- [Release Spine](http://localhost:3001/api/release-spine/status)
- [Hardware Telemetry Bindings](http://localhost:3001/api/studio-os/inspector)

## Local Data & Sovereign Security

All API keys (Stripe, OpenAI, Gemini, Vercel) remain completely local.

Bridge-backed local state, ledger receipts, and Nightforge data are stored securely under:
```text
.prompthouse-data/
```

*The target state for this build is `proof-gated launch ready`. Live deployment and commerce executions require explicit approval envelopes and provider secrets.*
