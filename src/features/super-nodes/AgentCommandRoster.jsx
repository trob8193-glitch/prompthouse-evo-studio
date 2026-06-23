import React from 'react';
import { IDEPageLayout } from '../../components/layouts/IDEPageLayout.jsx';
import { SovereignTabs } from '../../components/SovereignTabs.jsx';
import { AgentCtlView, BotRosterView } from '../../v3-views.jsx';
import { AutonomousBuilderView } from '../../autonomous-views.jsx';
import { AgentBridgeView } from '../../agent-bridge-views.jsx';

export function AgentCommandRoster() {
  return (
    <IDEPageLayout title="Agent Command Roster" description="Tactical command center for all autonomous entities." noPadding>
      <SovereignTabs tabs={[
        { id: 'bot-roster', label: 'Bot Roster', component: <BotRosterView /> },
        { id: 'agent-ctl', label: 'Agent Control', component: <AgentCtlView /> },
        { id: 'autonomous-hq', label: 'Autonomous HQ', component: <AutonomousBuilderView /> },
        { id: 'agent-bridge', label: 'Agent Bridge', component: <AgentBridgeView /> }
      ]} />
    </IDEPageLayout>
  );
}
