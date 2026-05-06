import 'dart:convert';

import 'package:flutter/services.dart';

import '../models.dart';

class ExtensionFoundryService {
  Future<List<ExtensionRegistryEntry>> loadRegistry() async {
    final raw = await rootBundle.loadString('assets/extension_registry.json');
    final map = jsonDecode(raw) as Map<String, dynamic>;
    final list = (map['extensions'] as List<dynamic>? ?? const [])
        .cast<Map<String, dynamic>>()
        .map(
          (entry) => ExtensionRegistryEntry(
            id: entry['id']?.toString() ?? 'unknown_extension',
            type: entry['type']?.toString() ?? 'unknown',
            status: entry['status']?.toString() ?? 'unknown',
          ),
        )
        .toList();
    return list;
  }

  Future<List<SeniorBotProfile>> loadSeniorBots() async {
    final raw = await rootBundle.loadString('assets/senior_prompt_architecture_dev_bots.json');
    final map = jsonDecode(raw) as Map<String, dynamic>;
    final list = (map['team'] as List<dynamic>? ?? const [])
        .cast<Map<String, dynamic>>()
        .map(
          (entry) => SeniorBotProfile(
            name: entry['name']?.toString() ?? 'Unknown Bot',
            role: entry['role']?.toString() ?? 'unknown_role',
            specialty: entry['specialty']?.toString() ?? 'unknown_specialty',
          ),
        )
        .toList();
    return list;
  }

  List<String> extensionTypes() => const [
        'Flutter UI panel',
        'VS Code command/extension',
        'Android Studio/IntelliJ plugin scaffold',
        'Antigravity mission pack',
        'ForgeRail rail',
        'PromptLink provider adapter',
        'PromptBase pack',
        'Proof Deck artifact type',
        'backend module',
        'AI-chat kernel pack',
        'GitHub Action',
        'QA/device test pack',
      ];

  List<String> buildFlow() => const [
        'extension request',
        'Prompt Auth',
        'ExtensionCapsule',
        'owner/risk classification',
        'code scaffold',
        'tests',
        'proof receipt',
        'install instructions',
        'optional install approval',
      ];
}
