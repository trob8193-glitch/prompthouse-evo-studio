class EvoBuilderTemplate {
  const EvoBuilderTemplate({
    required this.builderTypes,
    required this.blocks,
    required this.sampleFlow,
    required this.exportTargets,
  });

  final List<String> builderTypes;
  final List<String> blocks;
  final List<String> sampleFlow;
  final List<String> exportTargets;
}

class EvoAgentRecipeDraft {
  const EvoAgentRecipeDraft({
    required this.kind,
    required this.name,
    required this.job,
    required this.publicVoice,
    required this.supportBots,
    required this.references,
    required this.tools,
    required this.rules,
    required this.approvals,
    required this.tests,
    required this.proof,
    required this.exportTargets,
  });

  final String kind;
  final String name;
  final String job;
  final String publicVoice;
  final List<String> supportBots;
  final List<String> references;
  final List<String> tools;
  final List<String> rules;
  final List<String> approvals;
  final List<String> tests;
  final List<String> proof;
  final List<String> exportTargets;
}
