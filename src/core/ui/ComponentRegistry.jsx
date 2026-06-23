import React from 'react';
import { ProofLedgerView, CanonMemoryView, WitnessConsoleView, MaturityScoreView } from '../../proof-os-views.jsx';
import ModuleMaturityDashboard from '../../features/ModuleMaturityDashboard.jsx';
import CostFirewallDashboard from '../../features/CostFirewallDashboard.jsx';
import { TruthAuditorView, ProofVaultView } from '../../new-features-views.jsx';
import { ProofToValueView } from '../../proof-to-value-view.jsx';

const autonomousModules = import.meta.glob('../../features/autonomous/*.jsx', { eager: true });
const autonomousRegistry = {};

for (const path in autonomousModules) {
  const mod = autonomousModules[path];
  const name = path.split('/').pop().replace('.jsx', '');
  const Comp = mod.default;
  if (Comp) {
    autonomousRegistry[name] = <Comp />;
  }
}

export const COMPONENT_REGISTRY = {
  ProofLedgerView: <ProofLedgerView />,
  CanonMemoryView: <CanonMemoryView />,
  WitnessConsoleView: <WitnessConsoleView />,
  MaturityScoreView: <MaturityScoreView />,
  ModuleMaturityDashboard: <ModuleMaturityDashboard />,
  CostFirewallDashboard: <CostFirewallDashboard />,
  TruthAuditorView: <TruthAuditorView />,
  ProofVaultView: <ProofVaultView />,
  ProofToValueView: <ProofToValueView />,
  ...autonomousRegistry
};
