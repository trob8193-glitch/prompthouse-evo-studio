/**
 * PH EVO STUDIO — FLUTTER BRIDGE
 * ═══════════════════════════════════════════════════════════════
 * This module handles the live synchronization between the studio
 * and your local Flutter projects. It translates 'UI Seeds' into
 * physical .dart files and triggers hot-reloads.
 */

import { Log } from '../autonomy/SovereignLogger.js';
import { UniversalBridge } from '../interop/UniversalBridge.js';
import fs from 'fs';
import path from 'path';

function normalizeSeedId(id = 'live_seed') {
  const normalized = String(id || 'live_seed')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const safeId = normalized || 'live_seed';
  return /^[a-z_]/.test(safeId) ? safeId : `seed_${safeId}`;
}

function toDartClassName(id) {
  return normalizeSeedId(id)
    .split('_')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') || 'LiveSeed';
}

function dartString(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\$/g, '\\$')
    .replace(/\r?\n/g, '\\n');
}

export class FlutterBridge {
  constructor(projectPath = './.prompt-garden/flutter_app') {
    this.projectPath = projectPath;
    this.bridge = new UniversalBridge();
  }

  /**
   * Sync a UI Seed from the Evo Tree to the Flutter project.
   */
  async syncSeed(seed) {
    const normalizedSeed = {
      ...seed,
      id: normalizeSeedId(seed?.id),
      name: seed?.name || seed?.id || 'Live Seed'
    };
    Log.info(`🐦 [FlutterBridge] Syncing UI Seed: ${normalizedSeed.name}`);
    
    const dartCode = this.translateToDart(normalizedSeed);
    const targetFile = path.join(this.projectPath, 'lib', `${normalizedSeed.id}.dart`);
    
    if (!fs.existsSync(path.dirname(targetFile))) {
      fs.mkdirSync(path.dirname(targetFile), { recursive: true });
    }

    fs.writeFileSync(targetFile, dartCode, 'utf8');
    Log.success(`🐦 [FlutterBridge] Seed materialized in lib/${normalizedSeed.id}.dart`);

    const reload = await this.bridge.dispatch('flutter', 'hot-reload');
    return {
      artifactPath: targetFile,
      relativeArtifactPath: path.relative(process.cwd(), targetFile),
      status: reload?.success === false ? 'HOT_RELOAD_BLOCKED' : 'HOT_RELOAD_TRIGGERED',
      reload
    };
  }

  translateToDart(seed) {
    const className = toDartClassName(seed.id);
    const label = dartString(`${seed.name} - Synthesized by PromptHouse`);
    return `
import 'package:flutter/material.dart';

class ${className} extends StatelessWidget {
  const ${className}({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text('${label}'),
    );
  }
}
`;
  }

  /**
   * Physically sync the Singularity Status to the Dart Engine.
   */
  async syncSingularityStatus(status = 'ACTIVE') {
    Log.info(`🌉 [FlutterBridge] Syncing Singularity Status: ${status}`);
    return await this.bridge.dispatchToDart('SET_SINGULARITY_STATUS', { status });
  }

  /**
   * Dispatch a direct command to the mobile node.
   */
  async dispatch(command, params) {
    Log.info(`📱 [FlutterBridge] Dispatching Command: ${command} to Grid...`);
    return await this.bridge.dispatchToDart(command, params);
  }
}

export const FLUTTER_BRIDGE = new FlutterBridge();
