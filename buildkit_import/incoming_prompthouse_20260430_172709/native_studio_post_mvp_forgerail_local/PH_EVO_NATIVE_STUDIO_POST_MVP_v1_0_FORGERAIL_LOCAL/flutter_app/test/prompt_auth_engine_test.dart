import 'package:flutter_test/flutter_test.dart';
import 'package:prompthouse_evo_native_studio/models.dart';
import 'package:prompthouse_evo_native_studio/services/prompt_auth_engine.dart';

void main() {
  test('owner can forge blueprint', () {
    final auth = PromptAuthEngine.seeded();
    final decision = auth.authorize(actorId: 'user_owner', action: PromptAction.forgeBlueprint, resource: 'mission:new');
    expect(decision.allowed, isTrue);
  });

  test('external connector cannot deploy app by default', () {
    final auth = PromptAuthEngine.seeded();
    final decision = auth.authorize(actorId: 'external_connector', action: PromptAction.deployApp, resource: 'deployment:prod');
    expect(decision.allowed, isFalse);
    expect(decision.requiredProof, contains('owner approval'));
  });
}
