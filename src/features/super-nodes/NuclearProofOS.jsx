import React from 'react';
import { IDEPageLayout } from '../../components/layouts/IDEPageLayout.jsx';
import { SovereignTabs } from '../../components/SovereignTabs.jsx';
import { ProofLedgerView, WitnessConsoleView } from '../../proof-os-views.jsx';
import { TemporalForesightView, ProofVaultView, TruthAuditorView } from '../../new-features-views.jsx';

export function NuclearProofOS() {
  return (
    <IDEPageLayout title="Nuclear Proof OS" description="Cryptographic state verification and truth audits." noPadding>
      <SovereignTabs tabs={[
        { id: 'proof-ledger', label: 'Proof Ledger', component: <ProofLedgerView /> },
        { id: 'witness-console', label: 'Witness Console', component: <WitnessConsoleView /> },
        { id: 'truth-auditor', label: 'Truth Auditor', component: <TruthAuditorView /> },
        { id: 'temporal-trace', label: 'Temporal Trace', component: <TemporalForesightView /> },
        { id: 'proof-vault', label: 'Proof Vault', component: <ProofVaultView /> }
      ]} />
    </IDEPageLayout>
  );
}
