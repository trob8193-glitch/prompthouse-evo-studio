import 'package:flutter/material.dart';

import '../models/evo_agent_builder_models.dart';
import '../services/evo_studio_builder_service.dart';

class EvoStudioBuilderScreen extends StatefulWidget {
  const EvoStudioBuilderScreen({super.key});

  @override
  State<EvoStudioBuilderScreen> createState() => _EvoStudioBuilderScreenState();
}

class _EvoStudioBuilderScreenState extends State<EvoStudioBuilderScreen> {
  final service = EvoStudioBuilderService();
  late final Future<EvoBuilderTemplate> templateFuture;
  late final EvoAgentRecipeDraft draft;

  @override
  void initState() {
    super.initState();
    templateFuture = service.loadTemplates();
    draft = service.beginnerDraft();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<EvoBuilderTemplate>(
      future: templateFuture,
      builder: (context, snapshot) {
        final template = snapshot.data;
        return ListView(
          padding: const EdgeInsets.all(18),
          children: [
            const _BuilderCard(
              title: '🧱 Evo Studio Builder',
              child: Text('Build custom Evo LMs and agents like LEGO blocks: Brain, References, Tools, Rules, Approval, Tests, Proof, Publish.'),
            ),
            if (template != null) _BuilderCard(
              title: '1. Pick What You Are Building',
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: template.builderTypes.map((type) => Chip(label: Text(type))).toList(),
              ),
            ),
            if (template != null) _BuilderCard(
              title: '2. Block Library',
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: template.blocks.map((block) => Chip(label: Text(block))).toList(),
              ),
            ),
            if (template != null) _BuilderCard(
              title: '3. Easy Flow Preview',
              child: Text(template.sampleFlow.join(' → ')),
            ),
            _BuilderCard(
              title: '4. Recipe Draft',
              child: Text('${draft.name}\n${draft.job}\nVoice: ${draft.publicVoice}\nSupport: ${draft.supportBots.join(', ')}'),
            ),
            _BuilderCard(
              title: '5. References',
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: draft.references.map((item) => Text('• $item')).toList()),
            ),
            _BuilderCard(
              title: '6. Tools',
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: draft.tools.map((item) => Text('• $item')).toList()),
            ),
            _BuilderCard(
              title: '7. Rules + Approval',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Rules:'),
                  ...draft.rules.map((item) => Text('• $item')),
                  const SizedBox(height: 10),
                  const Text('Ask first for:'),
                  ...draft.approvals.map((item) => Text('• $item')),
                ],
              ),
            ),
            _BuilderCard(
              title: '8. Tests + Proof',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Tests:'),
                  ...draft.tests.map((item) => Text('• $item')),
                  const SizedBox(height: 10),
                  const Text('Proof needed:'),
                  ...draft.proof.map((item) => Text('• $item')),
                ],
              ),
            ),
            if (template != null) _BuilderCard(
              title: '9. Export Targets',
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: template.exportTargets.map((target) => Chip(label: Text(target))).toList(),
              ),
            ),
            const _BuilderCard(
              title: 'No-Bullshit Boundary',
              child: Text('This builds recipes and scaffolds. It cannot truthfully claim external provider access, repo writes, deployment, or app-store publishing without credentials, approval, and proof receipts.'),
            ),
          ],
        );
      },
    );
  }
}

class _BuilderCard extends StatelessWidget {
  const _BuilderCard({required this.title, required this.child});
  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 10),
            child,
          ],
        ),
      ),
    );
  }
}
