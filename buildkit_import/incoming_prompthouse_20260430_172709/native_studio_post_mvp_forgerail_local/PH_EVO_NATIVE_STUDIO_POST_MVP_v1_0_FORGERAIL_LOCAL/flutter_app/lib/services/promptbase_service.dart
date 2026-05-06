import '../models.dart';

class PromptBaseService {
  PromptBaseService({required this.records});

  factory PromptBaseService.seeded() => PromptBaseService(records: const [
    PromptRecord(
      id: 'prompt_blueprint_architect',
      name: 'Blueprint Architect',
      category: 'app_generation',
      template: 'Turn {intent} into product brief, screens, data objects, build tasks, risks, and proof gates.',
      variables: ['intent'],
      version: '1.0.0',
    ),
    PromptRecord(
      id: 'prompt_fire_orders',
      name: 'Prompt Fire Orders',
      category: 'execution',
      template: 'Create ordered commands for {intent} with owner module, artifact, risk, and proof requirement.',
      variables: ['intent'],
      version: '1.0.0',
    ),
    PromptRecord(
      id: 'prompt_customer_sim',
      name: 'Bot Customer Simulation',
      category: 'validation',
      template: 'Simulate buyer, builder, and engineer feedback for {blueprint}.',
      variables: ['blueprint'],
      version: '1.0.0',
    ),
  ]);

  final List<PromptRecord> records;

  PromptRecord byId(String id) => records.firstWhere((record) => record.id == id);
  List<PromptRecord> byCategory(String category) => records.where((record) => record.category == category).toList();
}
