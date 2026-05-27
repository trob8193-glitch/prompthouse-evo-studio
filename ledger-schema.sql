CREATE TABLE IF NOT EXISTS sovereign_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id TEXT NOT NULL,
  action TEXT NOT NULL,
  proof_hash TEXT UNIQUE,
  timestamp TIMESTAMPTZ DEFAULT now()
);