import 'package:flutter_test/flutter_test.dart';
import 'package:prompthouse_evo_native_studio/models.dart';
import 'package:prompthouse_evo_native_studio/services/blueprint_engine.dart';
import 'package:prompthouse_evo_native_studio/services/fire_order_engine.dart';
import 'package:prompthouse_evo_native_studio/services/promptbase_service.dart';

void main() {
  test('blueprint includes core studio screens', () {
    const mission = StudioMission(id: 'mission_test', title: 'Test', intent: 'Build PromptHouse mobile studio', status: MissionStatus.blueprinting, modules: ['Prompt Architect'], truthStates: ['built']);
    final orders = FireOrderEngine().createForIntent(mission.intent);
    final blueprint = BlueprintEngine(promptBase: PromptBaseService.seeded()).createBlueprint(mission, orders);
    expect(blueprint.screens, contains('PromptBase'));
    expect(blueprint.screens, contains('Proof Deck'));
    expect(blueprint.screens, contains('Bot Customer Lab'));
  });
}
