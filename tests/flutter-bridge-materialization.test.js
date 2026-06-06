import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FlutterBridge as FoundryFlutterBridge } from '../src/core/foundry/FlutterBridge.js';
import { FlutterBridge as ExtensionFlutterBridge } from '../src/core/extension/VSCodeBridge.js';

const tempRoots = [];

function makeBridge(BridgeClass = FoundryFlutterBridge) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ph-flutter-'));
  tempRoots.push(root);
  const bridge = new BridgeClass(root);
  bridge.bridge = {
    dispatch: vi.fn(async () => ({ success: true, truthState: 'SIGNED_PHYSICAL' }))
  };
  return { bridge, root };
}

afterEach(() => {
  while (tempRoots.length) {
    fs.rmSync(tempRoots.pop(), { recursive: true, force: true });
  }
});

describe('Flutter bridge materialization', () => {
  it('writes valid Dart to the Flutter project lib directory', async () => {
    const { bridge } = makeBridge();

    const result = await bridge.syncSeed({ id: 'Launch-Proof 7', name: "Owner's Launch" });
    const normalizedPath = result.artifactPath.replace(/\\/g, '/');
    const dart = fs.readFileSync(result.artifactPath, 'utf8');

    expect(normalizedPath).toMatch(/lib\/launch_proof_7\.dart$/);
    expect(normalizedPath).not.toContain('src/LiveSeed.dart');
    expect(dart).toContain("import 'package:flutter/material.dart';");
    expect(dart).toContain('class LaunchProof7 extends StatelessWidget');
    expect(dart).toContain("Owner\\'s Launch - Synthesized by PromptHouse");
    expect(result.status).toBe('HOT_RELOAD_TRIGGERED');
    expect(bridge.bridge.dispatch).toHaveBeenCalledWith('flutter', 'hot-reload');
  });

  it('routes extension deploys through the materialized Flutter bridge', async () => {
    const { bridge } = makeBridge(ExtensionFlutterBridge);

    const result = await bridge.deploySeed({ id: 'mobile-live', name: 'Mobile Live' });
    const normalizedPath = result.artifactPath.replace(/\\/g, '/');

    expect(normalizedPath).toMatch(/lib\/mobile_live\.dart$/);
    expect(normalizedPath).not.toContain('src/LiveSeed.dart');
    expect(fs.existsSync(result.artifactPath)).toBe(true);
  });
});
