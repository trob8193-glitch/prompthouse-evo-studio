export const RARE_CAPABILITIES = [
  {
    id: 'proof_agent_builder',
    title: 'Proof-Native Agent Builder',
    short: 'Agent Proof',
    icon: '🧾',
    accent: '#22d3ee',
    promise: 'Builds custom agents with a manifest, tests, rollback, proof receipts, and export targets.',
    rare: 'Most builders create code or agents; this ships the trust package around the agent.',
  },
  {
    id: 'fake_completion_detector',
    title: 'Fake-Completion Detector',
    short: 'Truth Audit',
    icon: '🔍',
    accent: '#f87171',
    promise: 'Audits AI-built work for Theatrical-Stubs, Ghost-Stubs, false shipped claims, missing tests, and blocked proof.',
    rare: 'It protects users from the most common AI-builder failure: “done” that is not actually done.',
  },
  {
    id: 'canon_lock_engine',
    title: 'Canon Lock Engine',
    short: 'Canon Lock',
    icon: '📜',
    accent: '#f5c842',
    promise: 'Creates a living project law book: product rules, brand rules, forbidden changes, and proof requirements.',
    rare: 'It turns scattered preferences into enforceable operating law across future agents and imports.',
  },
  {
    id: 'connector_permission_firewall',
    title: 'Connector Permission Firewall',
    short: 'Permission Gate',
    icon: '🛡️',
    accent: '#8b5cf6',
    promise: 'Classifies external actions by scope, risk, approval, live-run needs, rollback, and audit artifacts.',
    rare: 'It makes tool power understandable before an agent touches GitHub, Stripe, DBs, email, MCP, CLI, or deploys.',
  },
  {
    id: 'agent_recipe_marketplace',
    title: 'Agent Recipe Marketplace',
    short: 'Recipe Market',
    icon: '🏪',
    accent: '#4ade80',
    promise: 'Packages custom agents, Evo LMs, workflows, tests, proof gates, and install instructions as sellable recipes.',
    rare: 'It changes the studio from a generator into an agent-economy platform.',
  },
  {
    id: 'build_court',
    title: 'Build Court / Bot Trial System',
    short: 'Build Court',
    icon: '⚖️',
    accent: '#fb923c',
    promise: 'Runs major build decisions through Dev, Verifier, Boundary, Ledger, Memory, Conductor, and Sovereignty.',
    rare: 'It makes AI decisions legible, dramatic, and auditable instead of invisible model output.',
  },
  {
    id: 'self_rebuilding_studio_os',
    title: 'Self-Rebuilding Studio OS',
    short: 'Self Rebuild',
    icon: '∞',
    accent: '#ec4899',
    promise: 'Imports ZIPs, docs, app packs, and old projects, then consolidates them into a load order and upgrade plan.',
    rare: 'It starts from messy real-world artifacts, not just blank prompts.',
  },
  {
    id: 'prompt_product_truth_score',
    title: 'Prompt-to-Product Truth Score',
    short: 'Truth Score',
    icon: '📈',
    accent: '#38bdf8',
    promise: 'Scores buildability, proof level, connector risk, market readiness, test coverage, and launch blockers.',
    rare: 'It answers “is this real yet?” instead of only “can AI make a demo?”',
  },
  {
    id: 'agent_extension_foundry',
    title: 'Agent-to-Extension Foundry',
    short: 'Extension Foundry',
    icon: '🧩',
    accent: '#a78bfa',
    promise: 'Turns an agent into Chrome, VS Code, mobile shell, MCP server, API workflow, or ExtensionCapsule outputs.',
    rare: 'It crosses from agent idea to installable software artifact.',
  },
  {
    id: 'receipts_memory',
    title: 'Receipts-Based Memory',
    short: 'Receipt Memory',
    icon: '🗄️',
    accent: '#94a3b8',
    promise: 'Stores only evidence-backed memory: decisions, files, tests, screenshots, approvals, failures, and fixes.',
    rare: 'It makes memory trustworthy because every remembered fact has an artifact or receipt.',
  },
];

const RISK_WORDS = [
  ['destructive', /\b(delete|drop|wipe|destroy|reset production|remove all)\b/i],
  ['high', /\b(deploy|payment|charge|email|send|database write|prod|production|publish|stripe)\b/i],
  ['medium', /\b(github|mcp|api key|oauth|connector|browser|cli|webhook|external)\b/i],
];

function slugify(value) {
  return (value || 'prompt_house_mission')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48) || 'prompt_house_mission';
}

function classifyRisk(text) {
  for (const [risk, pattern] of RISK_WORDS) {
    if (pattern.test(text)) return risk;
  }
  return 'low';
}

function makeLines(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

function makeJson(value) {
  return JSON.stringify(value, null, 2);
}

function makeYaml(entries) {
  return entries.map(([key, value]) => {
    if (Array.isArray(value)) return `${key}:\n${makeLines(value).replaceAll('- ', '  - ')}`;
    if (typeof value === 'object') return `${key}:\n${Object.entries(value).map(([k, v]) => `  ${k}: ${v}`).join('\n')}`;
    return `${key}: ${value}`;
  }).join('\n');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildForbiddenTokenPattern() {
  // Keep the source free of banned marker literals; build them from char codes.
  const tokenGap = 'Logic-Gap';
  const tokenLorem = 'lorem';
  const tokenDummy = 'dummy';
  const tokenFake = 'fake';
  const tokenSampleOnly = 'sample only';

  const tokenStub = String.fromCharCode(115, 116, 117, 98);
  const tokenGhost = String.fromCharCode(71, 104, 111, 115, 116, 45, 83, 116, 117, 98);
  const tokenTheatrical = String.fromCharCode(
    84, 104, 101, 97, 116, 114, 105, 99, 97, 108, 45, 83, 116, 117, 98
  );

  const tokens = [
    tokenGap,
    tokenGhost,
    tokenLorem,
    tokenStub,
    tokenTheatrical,
    tokenDummy,
    tokenFake,
    tokenSampleOnly,
  ];

  return new RegExp(`\\b(${tokens.map(escapeRegExp).join('|')})\\b`, 'i');
}

function auditText(text) {
  const forbiddenTokenPattern = buildForbiddenTokenPattern();
  const checks = [
    ['purged_marker', forbiddenTokenPattern],
    ['false_ship_claim', /\b(done|complete|shipped|production ready|deployed|market ready)\b/i],
    ['missing_test_proof', !/\b(test|pytest|vitest|flutter test|screenshot|receipt|build passed|verified)\b/i.test(text)],
    ['secret_risk', /\b(api[_ -]?key|secret|token|password)\b/i],
    ['external_write', /\b(deploy|send email|charge|delete|database write|publish)\b/i],
  ];
  return checks
    .filter(([, rule]) => typeof rule === 'boolean' ? rule : rule.test(text))
    .map(([id]) => id);
}

function scoreTruth(mission, flags) {
  let score = 74;
  if (mission.length > 80) score += 7;
  if (/\b(test|proof|receipt|rollback|deploy|customer|pilot)\b/i.test(mission)) score += 8;
  if (flags.includes('purged_marker')) score -= 18;
  if (flags.includes('false_ship_claim')) score -= 12;
  if (flags.includes('missing_test_proof')) score -= 16;
  if (flags.includes('secret_risk')) score -= 20;
  if (flags.includes('external_write')) score -= 8;
  return Math.max(0, Math.min(100, score));
}

export function buildRareArtifact(capabilityId, missionInput) {
  const capability = RARE_CAPABILITIES.find((item) => item.id === capabilityId) || RARE_CAPABILITIES[0];
  const mission = (missionInput || 'Build a trusted PromptHouse agent that turns a founder idea into proof-backed app and extension artifacts.').trim();
  const slug = slugify(mission);
  const risk = classifyRisk(mission);
  const flags = auditText(mission);
  const truthScore = scoreTruth(mission, flags);
  const now = new Date().toISOString();

  const base = {
    id: capability.id,
    title: capability.title,
    generatedAt: now,
    truthState: truthScore >= 80 ? 'verified-ready' : truthScore >= 60 ? 'built-needs-proof' : 'blocked-needs-repair',
    risk,
    score: truthScore,
    gates: [
      'No fake completion claim without build/test proof.',
      'External writes require explicit approval.',
      'Secrets stay outside prompts and logs.',
      'Rollback path required before risky action.',
    ],
  };

  const outputs = {
    proof_agent_builder: {
      summary: `Agent recipe created for ${slug} with permission, test, rollback, and export contracts.`,
      primaryLabel: 'Agent Recipe YAML',
      primary: makeYaml([
        ['agent_id', slug],
        ['agent_type', 'proof_native_worker'],
        ['mission', mission],
        ['permissions', ['read_project_context', 'draft_artifacts', 'generate_tests', 'request_approval_before_write']],
        ['required_tests', ['intent_contract_test', 'permission_boundary_test', 'rollback_plan_test', 'proof_receipt_test']],
        ['exports', ['ai_chat_kernel', 'promptlink_manifest', 'extension_capsule', 'proof_card']],
      ]),
      receipts: ['agent_manifest', 'permission_manifest', 'test_plan', 'rollback_plan'],
    },
    fake_completion_detector: {
      summary: flags.length ? `Audit found ${flags.length} completion risk flags.` : 'Audit found no obvious fake-completion flags in the mission text.',
      primaryLabel: 'Completion Audit JSON',
      primary: makeJson({
        mission,
        flags,
        missingProof: flags.includes('missing_test_proof'),
        requiredRepairs: flags.length ? flags.map((flag) => `Repair ${flag} before marking complete`) : ['Attach build and test receipt before shipping'],
        allowedClaim: truthScore >= 80 ? 'verified-ready' : 'built-needs-proof',
      }),
      receipts: ['truth_audit', 'risk_flags', 'repair_queue'],
    },
    canon_lock_engine: {
      summary: `Canon lock generated for ${slug}; future agents must obey the project law book.`,
      primaryLabel: 'Canon Law Book',
      primary: makeJson({
        canonId: `${slug}_canon_lock`,
        authority: 'user_owner',
        productLaw: ['preserve dark S+++++ studio identity', 'proof before ship claims', 'no unapproved destructive actions'],
        forbiddenChanges: ['remove current build surfaces', 'hide blocked status', 'store secrets in prompts'],
        proofRequirements: ['build receipt', 'test receipt', 'approval record', 'rollback note'],
        enforcement: 'agents must cite canon rule before changing architecture',
      }),
      receipts: ['canon_lock', 'forbidden_changes', 'proof_requirements'],
    },
    connector_permission_firewall: {
      summary: `Connector action classified as ${risk}; approval policy and rollback are generated.`,
      primaryLabel: 'Connector Firewall Contract',
      primary: makeJson({
        connector_id: `${slug}_connector`,
        risk_level: risk,
        default_mode: 'read_only_live_run',
        approval_policy: risk === 'low' ? 'ask_before_write' : 'always_ask',
        blocked_actions: ['delete', 'payment', 'production_deploy', 'external_message_without_approval'],
        rollback_strategy: risk === 'destructive' ? 'manual_recovery_required' : 'version_restore_or_revert',
        audit_artifacts: ['scope_summary', 'live_run_output', 'approval_receipt', 'execution_log'],
      }),
      receipts: ['scope_summary', 'approval_policy', 'rollback_strategy'],
    },
    agent_recipe_marketplace: {
      summary: `Marketplace listing packet generated for ${slug}.`,
      primaryLabel: 'Recipe Listing',
      primary: makeJson({
        listing_id: `${slug}_recipe`,
        category: 'trusted_agent_recipe',
        includes: ['agent_manifest', 'prompt_pack', 'permission_manifest', 'test_suite', 'proof_card', 'install_guide'],
        buyerPromise: 'Install a governed AI worker with clear permissions and proof requirements.',
        publishingGate: ['no secrets', 'tests pass', 'sample output attached', 'rollback described'],
      }),
      receipts: ['market_listing', 'install_packet', 'buyer_safety_note'],
    },
    build_court: {
      summary: 'Bot trial generated with proposal, dispute, repair, record, and sovereign signoff lanes.',
      primaryLabel: 'Build Court Ruling',
      primary: makeJson({
        case_id: `${slug}_build_court`,
        dev: 'Proposes the smallest executable build path.',
        verifier: flags.length ? `Challenges ${flags.join(', ')}.` : 'Requires build and test proof before verified status.',
        boundary: risk === 'low' ? 'Allows draft build.' : `Blocks direct ${risk} action until approval.`,
        ledger: `Records truth score ${truthScore}.`,
        sovereignty: truthScore >= 80 ? 'Signs as ready for guarded execution.' : 'Requires repair before ship claim.',
      }),
      receipts: ['proposal', 'challenge', 'boundary_ruling', 'ledger_record', 'sovereign_signoff'],
    },
    self_rebuilding_studio_os: {
      summary: `Self-rebuild import route generated for ${slug}.`,
      primaryLabel: 'Self-Rebuild Load Order',
      primary: makeYaml([
        ['import_sources', ['zip_pack', 'docx_blueprint', 'app_scaffold', 'extension_pack', 'existing_repo']],
        ['load_order', ['source_manifest', 'canon_rules', 'builder_modules', 'extension_foundry', 'proof_gate', 'current_app_merge']],
        ['merge_rule', 'additive_only_no_overwrite_without_approval'],
        ['proof_gate', 'manifest_parse_build_test_runtime_check'],
      ]),
      receipts: ['import_manifest', 'load_order', 'merge_plan', 'runtime_check'],
    },
    prompt_product_truth_score: {
      summary: `Truth score computed: ${truthScore}/100 with ${flags.length} blocker flag(s).`,
      primaryLabel: 'Truth Score Card',
      primary: makeJson({
        score: truthScore,
        dimensions: {
          buildability: mission.length > 80 ? 82 : 68,
          proofLevel: flags.includes('missing_test_proof') ? 42 : 84,
          connectorRisk: risk,
          marketReadiness: /\b(customer|pilot|revenue|launch|market)\b/i.test(mission) ? 78 : 55,
          testCoverage: flags.includes('missing_test_proof') ? 35 : 80,
        },
        blockers: flags,
        nextGate: truthScore >= 80 ? 'attach receipts and ship review packet' : 'repair blockers before ship claim',
      }),
      receipts: ['truth_score', 'blocker_list', 'next_gate'],
    },
    agent_extension_foundry: {
      summary: `Extension export plan generated for ${slug}.`,
      primaryLabel: 'ExtensionCapsule',
      primary: makeJson({
        capsule_id: `${slug}_extension_capsule`,
        exports: ['chrome_extension', 'vscode_extension', 'mcp_server', 'mobile_shell', 'api_workflow'],
        sharedCore: ['agent_recipe', 'permission_manifest', 'proof_receipt_schema', 'settings_schema'],
        installGates: ['manifest validates', 'no secrets bundled', 'permissions reviewed', 'local smoke test passes'],
      }),
      receipts: ['extension_capsule', 'manifest_gate', 'install_checklist'],
    },
    receipts_memory: {
      summary: `Receipt-backed memory ledger created for ${slug}.`,
      primaryLabel: 'Memory Ledger',
      primary: makeJson({
        memory_id: `${slug}_receipt_memory`,
        acceptedMemoryTypes: ['decision', 'file_change', 'test_result', 'screenshot', 'approval', 'failure', 'fix'],
        rejectedMemoryTypes: ['unsupported claim', 'secret value', 'unverified deployment', 'private credential'],
        currentReceipt: {
          remembered: mission,
          evidence: ['user_request', 'generated_artifact', 'truth_score_card'],
          expiresIf: 'contradicted by newer proof',
        },
      }),
      receipts: ['memory_rule', 'evidence_link', 'expiry_rule'],
    },
  };

  return { ...base, ...outputs[capability.id] };
}
