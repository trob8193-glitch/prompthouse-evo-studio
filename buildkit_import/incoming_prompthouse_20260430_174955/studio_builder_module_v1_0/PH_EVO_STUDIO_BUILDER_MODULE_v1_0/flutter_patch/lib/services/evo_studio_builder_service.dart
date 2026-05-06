import 'dart:convert';

import 'package:flutter/services.dart';

import '../models/evo_agent_builder_models.dart';

class EvoStudioBuilderService {
  Future<EvoBuilderTemplate> loadTemplates() async {
    final raw = await rootBundle.loadString('assets/evo_studio_builder_templates.json');
    final map = jsonDecode(raw) as Map<String, dynamic>;

    return EvoBuilderTemplate(
      builderTypes: (map['builder_types'] as List<dynamic>).map((e) => e.toString()).toList(),
      blocks: (map['blocks'] as List<dynamic>).map((e) => e.toString()).toList(),
      sampleFlow: (map['sample_flow'] as List<dynamic>).map((e) => e.toString()).toList(),
      exportTargets: (map['export_targets'] as List<dynamic>).map((e) => e.toString()).toList(),
    );
  }

  EvoAgentRecipeDraft beginnerDraft() {
    return const EvoAgentRecipeDraft(
      kind: 'custom_evo_lm',
      name: 'Mobile App Builder Evo LM',
      job: 'Turn app ideas into Flutter build plans and proof-gated tasks.',
      publicVoice: 'Evo',
      supportBots: ['Dev', 'Builder', 'Verifier', 'Boundary', 'Blueprint Orca', 'Forge Rhino'],
      references: ['PromptBase mobile app builder', 'Flutter blueprint file', '21-bot roster canon'],
      tools: ['Flutter command rail', 'File search', 'GitHub dry-run', 'Proof Deck'],
      rules: ['Never expose secrets', 'Never claim deployment without proof', 'Never write GitHub without approval'],
      approvals: ['repo write', 'production deploy', 'app store submission'],
      tests: ['creates Flutter screen map', 'asks approval before repo write', 'outputs proof checklist'],
      proof: ['test report', 'build log', 'approval receipt'],
      exportTargets: ['PromptHouse Studio', 'Antigravity', 'AI Chat Kernel'],
    );
  }
}
