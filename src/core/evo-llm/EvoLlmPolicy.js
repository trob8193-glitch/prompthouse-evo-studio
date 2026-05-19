export const EVO_LLM_REQUIRED_FIELDS = ['system', 'instruction', 'response'];

export const EVO_LLM_BANNED_CLAIMS = [
  'sentient',
  'conscious',
  'guaranteed profit',
  'unlimited autonomous',
  'break into',
  'bypass security'
];

export const EVO_LLM_POLICY = {
  id: 'evo-llm-training-policy',
  name: 'Evo LLM Truth-Bound Training Policy',
  truthState: 'PIPELINE_POLICY_ONLY_NOT_TRAINED_MODEL',
  requiredFields: EVO_LLM_REQUIRED_FIELDS,
  bannedClaims: EVO_LLM_BANNED_CLAIMS,
  allowedUses: [
    'PromptHouse Evo Studio architecture assistance',
    'module maturity auditing',
    'cost firewall reasoning',
    'proof-gated build planning',
    'truth-bound repair recommendations'
  ],
  disallowedUses: [
    'claims of sentience or consciousness',
    'security bypass guidance',
    'medical diagnosis',
    'legal advice',
    'financial guarantees',
    'fake completion claims without receipts'
  ]
};

export function normalizeEvoText(value) {
  return String(value || '').replace(/\r\n/g, '\n').trim();
}

export function detectUnsupportedClaims(text) {
  const lower = normalizeEvoText(text).toLowerCase();
  return EVO_LLM_BANNED_CLAIMS.filter((claim) => lower.includes(claim));
}
