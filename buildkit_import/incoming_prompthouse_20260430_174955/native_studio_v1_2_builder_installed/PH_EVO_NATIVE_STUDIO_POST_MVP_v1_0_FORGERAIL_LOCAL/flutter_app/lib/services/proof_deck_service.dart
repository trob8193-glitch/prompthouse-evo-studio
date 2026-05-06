import '../models.dart';

class ProofDeckService {
  List<ProofArtifact> createInitialProofs(StudioMission mission, Blueprint blueprint, List<FireOrder> orders) => [
    ProofArtifact(id: 'proof_mission_${mission.id}', title: 'Mission captured', status: 'verified', verificationNote: 'Mission exists in runtime state with module route and truth labels.'),
    ProofArtifact(id: 'proof_blueprint_${blueprint.id}', title: 'Blueprint generated', status: blueprint.status == 'built' ? 'verified' : 'blocked', verificationNote: blueprint.boundary),
    ProofArtifact(id: 'proof_orders_${mission.id}', title: 'Fire orders generated', status: orders.isNotEmpty ? 'verified' : 'blocked', verificationNote: '${orders.length} fire orders created.'),
    const ProofArtifact(id: 'proof_deployment_pending', title: 'Production deployment', status: 'blocked', verificationNote: 'Not deployed until build, tests, signing, hosting, and release receipts exist.'),
  ];
}
