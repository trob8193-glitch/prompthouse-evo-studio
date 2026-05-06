import '../models.dart';

class FireOrderEngine {
  List<FireOrder> createForIntent(String intent) => const [
    FireOrder(priority: 1, command: 'CANON_CHECK: preserve modules, truth states, and Prompt Auth.', ownerModule: 'Canon Keeper', expectedArtifact: 'Canon status report', riskLevel: 'low'),
    FireOrder(priority: 2, command: 'FORGE_BLUEPRINT: convert intent into app blueprint.', ownerModule: 'Prompt Architect', expectedArtifact: 'Blueprint', riskLevel: 'medium'),
    FireOrder(priority: 3, command: 'BUILD_TASKS: split blueprint into mobile/web/connector tasks.', ownerModule: 'Workflow Smith', expectedArtifact: 'Build task list', riskLevel: 'medium'),
    FireOrder(priority: 4, command: 'PROOF_GATE: require artifacts before ready-to-deploy.', ownerModule: 'Truth Auditor', expectedArtifact: 'Proof Deck', riskLevel: 'high'),
    FireOrder(priority: 5, command: 'BOT_CUSTOMERS: simulate target users and request repairs.', ownerModule: 'Product Framer', expectedArtifact: 'Customer simulation report', riskLevel: 'low'),
  ];
}
