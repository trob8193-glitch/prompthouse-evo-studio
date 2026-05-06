enum MissionStatus { intake, blueprinting, building, proofing, botReview, repaired, blocked, readyToDeploy }

extension MissionStatusLabel on MissionStatus {
  String get label => name;
}

enum PromptAction {
  readPrompt,
  forgeBlueprint,
  createFireOrder,
  runBotCustomerSimulation,
  exportBlueprint,
  connectExternalTool,
  deployApp,
  deleteArtifact,
}

class AuthDecision {
  const AuthDecision({required this.allowed, required this.reason, required this.requiredProof});
  final bool allowed;
  final String reason;
  final List<String> requiredProof;
}

class StudioMission {
  const StudioMission({
    required this.id,
    required this.title,
    required this.intent,
    required this.status,
    required this.modules,
    required this.truthStates,
  });
  final String id;
  final String title;
  final String intent;
  final MissionStatus status;
  final List<String> modules;
  final List<String> truthStates;
}

class PromptRecord {
  const PromptRecord({
    required this.id,
    required this.name,
    required this.category,
    required this.template,
    required this.variables,
    required this.version,
  });
  final String id;
  final String name;
  final String category;
  final String template;
  final List<String> variables;
  final String version;
}

class FireOrder {
  const FireOrder({
    required this.priority,
    required this.command,
    required this.ownerModule,
    required this.expectedArtifact,
    required this.riskLevel,
  });
  final int priority;
  final String command;
  final String ownerModule;
  final String expectedArtifact;
  final String riskLevel;
}

class Blueprint {
  const Blueprint({
    required this.id,
    required this.missionId,
    required this.productBrief,
    required this.screens,
    required this.dataObjects,
    required this.buildTasks,
    required this.status,
    required this.boundary,
  });
  final String id;
  final String missionId;
  final String productBrief;
  final List<String> screens;
  final List<String> dataObjects;
  final List<String> buildTasks;
  final String status;
  final String boundary;

  factory Blueprint.blocked(String missionId, String reason) => Blueprint(
    id: 'blueprint_blocked',
    missionId: missionId,
    productBrief: 'Blueprint blocked.',
    screens: const [],
    dataObjects: const [],
    buildTasks: const [],
    status: 'blocked',
    boundary: reason,
  );
}

class ProofArtifact {
  const ProofArtifact({required this.id, required this.title, required this.status, required this.verificationNote});
  final String id;
  final String title;
  final String status;
  final String verificationNote;
}

class BotCustomerFeedback {
  const BotCustomerFeedback({required this.persona, required this.feedback, required this.score, required this.repairRequest});
  final String persona;
  final String feedback;
  final int score;
  final String repairRequest;
}


class ExtensionRegistryEntry {
  const ExtensionRegistryEntry({required this.id, required this.type, required this.status});
  final String id;
  final String type;
  final String status;
}

class SeniorBotProfile {
  const SeniorBotProfile({required this.name, required this.role, required this.specialty});
  final String name;
  final String role;
  final String specialty;
}
