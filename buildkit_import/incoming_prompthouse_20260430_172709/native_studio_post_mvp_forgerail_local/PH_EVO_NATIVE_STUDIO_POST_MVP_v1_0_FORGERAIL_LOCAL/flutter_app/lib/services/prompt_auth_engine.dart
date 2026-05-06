import '../models.dart';

class PromptAuthEngine {
  PromptAuthEngine({required this.policies});

  factory PromptAuthEngine.seeded() => PromptAuthEngine(policies: {
    'user_owner': {
      PromptAction.readPrompt,
      PromptAction.forgeBlueprint,
      PromptAction.createFireOrder,
      PromptAction.runBotCustomerSimulation,
      PromptAction.exportBlueprint,
    },
    'studio_operator': {
      PromptAction.readPrompt,
      PromptAction.forgeBlueprint,
      PromptAction.createFireOrder,
      PromptAction.runBotCustomerSimulation,
      PromptAction.exportBlueprint,
    },
    'bot_customer': {PromptAction.readPrompt, PromptAction.runBotCustomerSimulation},
    'external_connector': {PromptAction.readPrompt},
  });

  final Map<String, Set<PromptAction>> policies;

  AuthDecision authorize({required String actorId, required PromptAction action, required String resource}) {
    final highRisk = {
      PromptAction.deployApp,
      PromptAction.deleteArtifact,
      PromptAction.connectExternalTool,
    };

    if (highRisk.contains(action)) {
      return AuthDecision(
        allowed: false,
        reason: 'High-risk action requires explicit approval, live configuration, audit log, and rollback path.',
        requiredProof: const ['owner approval', 'scope declaration', 'rollback path', 'proof receipt'],
      );
    }

    final allowed = policies[actorId]?.contains(action) ?? false;
    if (!allowed) {
      return AuthDecision(
        allowed: false,
        reason: 'Actor $actorId is not authorized to perform $action on $resource.',
        requiredProof: const ['owner approval', 'policy update'],
      );
    }

    return const AuthDecision(allowed: true, reason: 'Allowed by internal Prompt Auth policy.', requiredProof: []);
  }
}
