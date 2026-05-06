import '../models.dart';
import 'promptbase_service.dart';

class BlueprintEngine {
  BlueprintEngine({required this.promptBase});
  final PromptBaseService promptBase;

  Blueprint createBlueprint(StudioMission mission, List<FireOrder> orders) {
    final prompt = promptBase.byId('prompt_blueprint_architect');
    return Blueprint(
      id: 'blueprint_${mission.id}',
      missionId: mission.id,
      productBrief: '${prompt.name}: ${mission.intent} Built as a mobile-first prompt-to-app studio with saved missions, PromptBase, Proof Deck, bot customers, and connector-safe execution.',
      screens: const [
        'Mission Control',
        'Prompt Auth Console',
        'PromptBase',
        'Saved Missions',
        'Blueprint Forge',
        'Prompt Fire Orders',
        'Proof Deck',
        'Bot Customer Lab',
        'Compatibility Hub',
        'Deployment Gate',
      ],
      dataObjects: const [
        'StudioMission',
        'PromptRecord',
        'PromptPolicy',
        'FireOrder',
        'Blueprint',
        'ProofArtifact',
        'BotCustomerFeedback',
        'ConnectorContract',
      ],
      buildTasks: orders.map((order) => order.expectedArtifact).toList(),
      status: 'built',
      boundary: 'Ready for local run; production deployment requires real deployment proof.',
    );
  }
}
