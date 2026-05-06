import 'package:flutter/material.dart';

import '../models.dart';
import '../services/extension_foundry_service.dart';

class ExtensionFoundryScreen extends StatefulWidget {
  const ExtensionFoundryScreen({super.key});

  @override
  State<ExtensionFoundryScreen> createState() => _ExtensionFoundryScreenState();
}

class _ExtensionFoundryScreenState extends State<ExtensionFoundryScreen> {
  final service = ExtensionFoundryService();

  late final Future<List<ExtensionRegistryEntry>> registryFuture;
  late final Future<List<SeniorBotProfile>> seniorBotsFuture;

  @override
  void initState() {
    super.initState();
    registryFuture = service.loadRegistry();
    seniorBotsFuture = service.loadSeniorBots();
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        const _FoundryCard(
          title: '🛤️ Extension Foundry',
          child: Text(
            'FORGERAIL_LOCAL is wired into the studio runtime. Extension Foundry is now a first-class screen/panel for extension discovery, packaging, and proof-first install flow.',
          ),
        ),
        _FoundryCard(
          title: 'Install Status',
          child: Wrap(
            spacing: 10,
            runSpacing: 10,
            children: const [
              Chip(label: Text('installed: FORGERAIL_LOCAL')),
              Chip(label: Text('panel: active')),
              Chip(label: Text('registry: linked')),
              Chip(label: Text('senior team: linked')),
              Chip(label: Text('truth boundary: no fake deployment')),
            ],
          ),
        ),
        _FoundryCard(
          title: 'Supported Extension Types',
          child: Wrap(
            spacing: 8,
            runSpacing: 8,
            children: service.extensionTypes().map((type) => Chip(label: Text(type))).toList(),
          ),
        ),
        _FoundryCard(
          title: 'Extension Build Flow',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              for (int i = 0; i < service.buildFlow().length; i++)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Text('${i + 1}. ${service.buildFlow()[i]}'),
                ),
            ],
          ),
        ),
        FutureBuilder<List<ExtensionRegistryEntry>>(
          future: registryFuture,
          builder: (context, snapshot) {
            final items = snapshot.data ?? const <ExtensionRegistryEntry>[];
            return _FoundryCard(
              title: 'Extension Registry',
              child: Column(
                children: items
                    .map(
                      (entry) => ListTile(
                        dense: true,
                        leading: const Icon(Icons.extension),
                        title: Text(entry.id),
                        subtitle: Text(entry.type),
                        trailing: Chip(label: Text(entry.status)),
                      ),
                    )
                    .toList(),
              ),
            );
          },
        ),
        FutureBuilder<List<SeniorBotProfile>>(
          future: seniorBotsFuture,
          builder: (context, snapshot) {
            final bots = snapshot.data ?? const <SeniorBotProfile>[];
            return _FoundryCard(
              title: 'Senior Prompt Architecture Team',
              child: Column(
                children: bots
                    .map(
                      (bot) => ListTile(
                        dense: true,
                        leading: const Icon(Icons.smart_toy_outlined),
                        title: Text(bot.name),
                        subtitle: Text('${bot.role}\n${bot.specialty}'),
                        isThreeLine: true,
                      ),
                    )
                    .toList(),
              ),
            );
          },
        ),
        const _FoundryCard(
          title: 'Bot Ownership',
          child: Text(
            'Evo: product/mission approval • Dev: code scaffold • Builder: package assembly • Verifier: tests and proof • Boundary: permissions and risk • Ledger: receipts and versioning • Memory: PromptBase and registry • Conductor: route and dependency order • Companion: onboarding • Heartbeat: health/status • Sovereignty: owner approval.',
          ),
        ),
      ],
    );
  }
}

class _FoundryCard extends StatelessWidget {
  const _FoundryCard({required this.title, required this.child});
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
