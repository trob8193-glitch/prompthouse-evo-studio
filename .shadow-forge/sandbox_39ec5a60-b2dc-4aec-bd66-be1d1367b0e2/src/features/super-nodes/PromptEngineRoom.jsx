import React from 'react';
import { IDEPageLayout } from '../../components/layouts/IDEPageLayout.jsx';
import { SovereignTabs } from '../../components/SovereignTabs.jsx';
import { MasterPromptVaultView } from '../../v3-views.jsx';
import { PromptLinkView } from '../../promptlink-views.jsx';
import { PatternMinerView } from '../../pattern-miner-view.jsx';
import { ToolAutogenView } from '../../tool-autogen-view.jsx';
import { AIPromptGeneratorView } from '../../ai-prompt-generator-view.jsx';

export function PromptEngineRoom() {
  return (
    <IDEPageLayout title="Prompt Engine Room" description="Unified prompt synthesis, pattern mining, and tool auto-generation." noPadding>
      <SovereignTabs tabs={[
        { id: 'prompt-gen', label: 'Prompt Generator', component: <AIPromptGeneratorView /> },
        { id: 'prompt-vault', label: 'Master Vault', component: <MasterPromptVaultView /> },
        { id: 'prompt-link', label: 'PromptLink', component: <PromptLinkView /> },
        { id: 'pattern-miner', label: 'Pattern Miner', component: <PatternMinerView /> },
        { id: 'tool-autogen', label: 'Tool Auto-Gen', component: <ToolAutogenView /> }
      ]} />
    </IDEPageLayout>
  );
}
