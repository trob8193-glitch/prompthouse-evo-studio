import { describe, it, expect } from 'vitest';
import { ExportCenter } from '../src/core/extension/export_center.js';
import { FiringOrdersPanel } from '../src/core/extension/firing_orders_panel.js';
import { LiveCommandGraph } from '../src/core/extension/live_command_graph.js';
import { PromptLibrary } from '../src/core/extension/prompt_library.js';
import { RealityTwinWidget } from '../src/core/extension/reality_twin.js';
import { RevenueAutopilotWithProofGates } from '../src/core/extension/revenue_autopilot_with_proof_gates.js';
import { SelfHealingWorkflowRepair } from '../src/core/extension/self-healing_workflow_repair.js';
import { SidePanelCockpit } from '../src/core/extension/side-panel_cockpit.js';
import { TrainingGoldMinerWidget } from '../src/core/extension/training_gold_miner.js';

describe('ExportCenter', () => {
  it('exports data', () => {
    const ex = new ExportCenter();
    ex.exportData('json', { test: 1 });
    expect(ex.getExports().length).toBe(1);
    expect(ex.getStatus().grade).toBe('A');
  });
});

describe('FiringOrdersPanel', () => {
  it('issues and executes orders', () => {
    const fop = new FiringOrdersPanel();
    fop.issueOrder('o1', { cmd: 'test' });
    expect(fop.executeOrder('o1')).toBe(true);
    expect(fop.executeOrder('o1')).toBe(false);
    expect(fop.getStatus().grade).toBe('A');
  });
});

describe('LiveCommandGraph', () => {
  it('adds nodes', () => {
    const lcg = new LiveCommandGraph();
    lcg.addNode('run x');
    expect(lcg.getGraph().length).toBe(1);
    expect(lcg.getStatus().grade).toBe('A');
  });
});

describe('PromptLibrary', () => {
  it('saves and gets prompts', () => {
    const pl = new PromptLibrary();
    pl.savePrompt('p1', 'Hello');
    expect(pl.getPrompt('p1').text).toBe('Hello');
    expect(pl.getStatus().grade).toBe('A');
  });
});

describe('RealityTwinWidget', () => {
  it('toggles view state', () => {
    const rtw = new RealityTwinWidget();
    expect(rtw.render(true)).toBe('rendering');
    expect(rtw.getStatus().grade).toBe('A');
  });
});

describe('RevenueAutopilotWithProofGates', () => {
  it('toggles visibility', () => {
    const raw = new RevenueAutopilotWithProofGates();
    expect(raw.toggle()).toBe(true);
    expect(raw.getStatus().grade).toBe('A');
  });
});

describe('SelfHealingWorkflowRepair', () => {
  it('tracks incidents', () => {
    const shw = new SelfHealingWorkflowRepair();
    shw.track('err1');
    expect(shw.getStatus().grade).toBe('A');
  });
});

describe('SidePanelCockpit', () => {
  it('switches tabs', () => {
    const spc = new SidePanelCockpit();
    expect(spc.switchTab('Foundry')).toBe(true);
    expect(spc.switchTab('FakeTab')).toBe(false);
    expect(spc.getStatus().grade).toBe('A');
  });
});

describe('TrainingGoldMinerWidget', () => {
  it('toggles mining', () => {
    const tgmw = new TrainingGoldMinerWidget();
    expect(tgmw.startMining()).toBe(true);
    expect(tgmw.getStatus().grade).toBe('A');
  });
});
