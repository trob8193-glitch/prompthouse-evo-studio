// src/cli-bridge.js
// Wraps the ph-evo CLI commands so the web studio UI can surface them.
// In the browser this shows the commands to run; in a future Electron/Tauri
// wrapper it can actually invoke them.

export const CLI_PATH = 'node vscode-extension/cli/ph-evo.js';

export const COMMANDS = [
  {
    id: 'doctor',
    label: '🩺 Doctor',
    desc: 'Check Node, npm, Flutter, Dart, Git environment.',
    cmd: `${CLI_PATH} doctor`,
    truthLabel: 'verified',
  },
  {
    id: 'intake',
    label: '🎯 Intake Mission',
    desc: 'Create a scoped mission packet with truth states.',
    cmd: (mission) => `${CLI_PATH} intake "${mission}"`,
    requiresInput: true,
    inputLabel: 'Mission text',
    inputHint: 'Build onboarding flow with full auth and tests.',
    truthLabel: 'built',
  },
  {
    id: 'generate-app',
    label: '⚙️ Generate Flutter App',
    desc: 'Scaffold a full feature-first Flutter app from the PH Evo template.',
    cmd: (name, target) => `${CLI_PATH} generate-app "${name}" "${target || name}"`,
    requiresInput: true,
    inputLabel: 'App name',
    inputHint: 'prompt_house_demo',
    truthLabel: 'built',
  },
  {
    id: 'scaffold',
    label: '🏗️ Scaffold Flutter Feature',
    desc: 'Add a domain/data/application/presentation module to the current project.',
    cmd: (feature) => `${CLI_PATH} scaffold "${feature}"`,
    requiresInput: true,
    inputLabel: 'Feature name',
    inputHint: 'onboarding',
    truthLabel: 'built',
  },
  {
    id: 'audit',
    label: '🔍 Audit Workspace',
    desc: 'Check required project structure and write an audit report.',
    cmd: `${CLI_PATH} audit`,
    truthLabel: 'verified',
  },
  {
    id: 'gate',
    label: '✅ Run Quality Gate',
    desc: 'pub get → format → analyze → test. Proof required before marking done.',
    cmd: `${CLI_PATH} gate`,
    truthLabel: 'verified',
  },
  {
    id: 'gate-web',
    label: '🌐 Gate + Web Build',
    desc: 'Full gate plus flutter build web --release.',
    cmd: `${CLI_PATH} gate --web`,
    truthLabel: 'verified',
  },
  {
    id: 'gate-android',
    label: '📱 Gate + Android Build',
    desc: 'Full gate plus flutter build apk --release.',
    cmd: `${CLI_PATH} gate --android`,
    truthLabel: 'verified',
  },
  {
    id: 'release-web',
    label: '🚀 Release Web',
    desc: 'flutter build web --release with proof log.',
    cmd: `${CLI_PATH} release web`,
    truthLabel: 'built',
  },
  {
    id: 'release-android',
    label: '📦 Release Android',
    desc: 'flutter build apk + appbundle --release with proof log.',
    cmd: `${CLI_PATH} release android`,
    truthLabel: 'built',
  },
  {
    id: 'handoff',
    label: '📋 Create Handoff',
    desc: 'Write a developer handoff packet with git status and proof.',
    cmd: `${CLI_PATH} handoff`,
    truthLabel: 'built',
  },
];

export const TRUTH_COLORS = {
  known: '#22d3ee',
  inferred: '#f5c842',
  blocked: '#f87171',
  broken: '#f87171',
  built: '#4ade80',
  verified: '#4ade80',
  recommended: '#8b5cf6',
};

export const FLUTTER_ARCHITECTURE = {
  layers: [
    { name: 'presentation/', desc: 'Screens, widgets, UI state' },
    { name: 'application/', desc: 'Controllers, use cases, state notifiers' },
    { name: 'domain/', desc: 'Models, entities, interfaces' },
    { name: 'data/', desc: 'Repositories, API clients, local storage' },
  ],
  coreFiles: [
    'lib/main.dart',
    'lib/app/app.dart',
    'lib/app/router.dart',
    'lib/app/theme.dart',
    'lib/core/env.dart',
    'lib/core/errors.dart',
    'lib/core/result.dart',
  ],
  ciFiles: [
    '.github/workflows/flutter-ci.yml',
    '.vscode/launch.json',
    '.vscode/tasks.json',
    'analysis_options.yaml',
  ],
};

export function buildCliSessionPrompt(appName, features, stack) {
  return `FLUTTER / VS CODE BUILD SESSION — PH EVO STUDIO v2.0.0

App: ${appName || '<app_name>'}
Features: ${features || '<feature1>, <feature2>'}
Stack: ${stack || 'Flutter, Riverpod, Hive, Go Router'}

PH Evo Studio architecture (feature-first):
lib/
  app/          → app.dart, router.dart, theme.dart
  core/         → env.dart, errors.dart, result.dart
  features/
    <feature>/
      domain/        → models, entities
      data/          → repositories, API clients
      application/   → controllers, providers
      presentation/  → screens, widgets
  shared/
    utils/      → string_tools.dart, etc.
    widgets/    → reusable UI components

CLI commands to run after generation:
  node vscode-extension/cli/ph-evo.js generate-app ${appName || '<app_name>'} ./generated/${appName || '<app_name>'}
  cd ./generated/${appName || '<app_name>'}
  flutter pub get
  flutter analyze
  flutter test

VS Code extension commands:
  PH Evo: Open Studio Dashboard
  PH Evo: Generate Flutter App
  PH Evo: Scaffold Flutter Feature → ${features ? features.split(',').map(f => f.trim()).join('\n  PH Evo: Scaffold Flutter Feature → ') : '<feature>'}
  PH Evo: Run Quality Gate
  PH Evo: Create Handoff Packet

Proof required before release:
  Known: workspace path confirmed
  Built: app generated and scaffolded
  Verified: flutter analyze + flutter test pass
  Blocked: Flutter SDK required in environment
  Recommended: run gate --web before web release`;
}
