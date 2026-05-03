export const LIVEFORGE_TEMPLATES = [
  {
    id: "mobile_app_builder",
    name: "Mobile App Builder",
    category: "mobile",
    description: "Mobile-first app builder screen.",
    promptHint: "Improve this as a mobile app builder interface with proof gates.",
    html: `<main class="app-shell"><section class="hero"><div class="badge">PromptHouse Evo</div><h1>Build your app from a prompt.</h1><p>Describe the app, choose a stack, and let Evo create a proof-gated blueprint.</p><button>Start Build</button></section><section class="cards"><article><h2>Prompt</h2><p>Turn your idea into a clear mission.</p></article><article><h2>Blueprint</h2><p>Generate screens, data, and tasks.</p></article><article><h2>Proof</h2><p>Block fake shipping until proof exists.</p></article></section></main>`,
    css: `.app-shell{font-family:Inter,system-ui;background:#070a12;color:#f8f0de;min-height:100%;padding:24px}.hero{border:1px solid rgba(255,255,255,.12);background:linear-gradient(135deg,#17223a,#0a0f1d);border-radius:24px;padding:28px}.badge{color:#f5b942;font-weight:900;text-transform:uppercase;letter-spacing:.12em}h1{font-size:40px;line-height:1;margin:12px 0}p{color:#b8c0d4}button{background:#f5b942;color:#070a12;border:0;border-radius:14px;padding:12px 18px;font-weight:900}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:16px}article{background:#111827;border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:16px}@media(max-width:720px){.cards{grid-template-columns:1fr}h1{font-size:30px}}`,
    js: ""
  },
  {
    id: "agent_builder",
    name: "Evo Agent Builder",
    category: "agent",
    description: "Kid-simple block builder for Evo LMs and agents.",
    promptHint: "Improve this as a visual block builder that a 12-year-old can understand.",
    html: `<main class="builder"><aside><h2>Blocks</h2><button>Brain</button><button>References</button><button>Tools</button><button>Rules</button><button>Proof</button></aside><section><div class="badge">Evo Studio Builder</div><h1>Make an agent like LEGO.</h1><div class="flow"><span>Brain</span><span>→</span><span>Tools</span><span>→</span><span>Proof</span><span>→</span><span>Publish</span></div></section></main>`,
    css: `.builder{font-family:Inter,system-ui;background:#090d16;color:#f8f0de;min-height:100%;display:grid;grid-template-columns:180px 1fr;gap:16px;padding:18px}aside,section{background:#111827;border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:18px}.badge{color:#f5b942;font-weight:900}button{display:block;width:100%;margin:8px 0;padding:10px;border-radius:12px;border:1px solid rgba(245,185,66,.35);background:rgba(245,185,66,.14);color:#f8f0de}.flow{display:flex;gap:8px;flex-wrap:wrap;margin-top:24px}.flow span{background:#17223a;border-radius:999px;padding:10px 14px}@media(max-width:720px){.builder{grid-template-columns:1fr}}`,
    js: ""
  },
  {
    id: "proof_deck",
    name: "Proof Deck",
    category: "proof",
    description: "Receipts and verification status for no-fake shipping.",
    promptHint: "Make this Proof Deck clearer with receipt cards and verification labels.",
    html: `<main class="proof"><header><div class="badge">Proof Deck</div><h1>No receipt, no verified claim.</h1></header><section class="grid"><article><strong>Test Output</strong><p>Status: verified</p></article><article><strong>Build Log</strong><p>Status: built</p></article><article><strong>Deployment</strong><p>Status: blocked</p></article></section></main>`,
    css: `.proof{font-family:Inter,system-ui;background:#080b12;color:#f8f0de;min-height:100%;padding:24px}.badge{color:#57d47f;font-weight:900}header{padding:20px;border-radius:22px;background:#111827;border:1px solid rgba(255,255,255,.12)}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:16px}article{border:1px solid rgba(255,255,255,.12);background:#151f33;border-radius:18px;padding:16px}p{color:#b8c0d4}@media(max-width:720px){.grid{grid-template-columns:1fr}}`,
    js: ""
  },
  {
    id: "browser_extension_sidepanel",
    name: "Browser Extension Side Panel",
    category: "extension",
    description: "Chrome/Edge side panel for page capture and PromptHouse bridge.",
    promptHint: "Improve this as a Chrome/Edge extension side panel.",
    html: `<main class="side"><div class="badge">Browser Agent Bridge</div><h1>Capture this page.</h1><textarea placeholder="Task: Turn this page into a PromptLink adapter."></textarea><button>Save to PromptBase</button><button>Create Proof Receipt</button></main>`,
    css: `.side{font-family:Inter,system-ui;background:#070a12;color:#f8f0de;min-height:100%;padding:16px}.badge{color:#f5b942;font-size:12px;font-weight:900;text-transform:uppercase}textarea{width:100%;min-height:120px;background:#111827;color:#f8f0de;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px}button{width:100%;margin-top:10px;background:rgba(245,185,66,.16);border:1px solid rgba(245,185,66,.35);border-radius:12px;color:#f8f0de;padding:12px;font-weight:800}`,
    js: ""
  }
];
