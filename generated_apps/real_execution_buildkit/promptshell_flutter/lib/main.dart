import 'package:flutter/material.dart';

import 'src/api.dart';

void main() {
  runApp(const PromptShellApp());
}

class PromptShellApp extends StatefulWidget {
  const PromptShellApp({super.key});

  @override
  State<PromptShellApp> createState() => _PromptShellAppState();
}

class _PromptShellAppState extends State<PromptShellApp> {
  int index = 0;
  final api = PromptEndsApi();

  @override
  Widget build(BuildContext context) {
    final screens = [
      CommandDeck(api: api),
      ManifestScreen(api: api),
      ConnectorsScreen(api: api),
      ProofScreen(api: api),
      ArtifactsScreen(api: api),
    ];

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'PromptShell',
      theme: ThemeData(useMaterial3: true, brightness: Brightness.dark, colorSchemeSeed: const Color(0xFF18F27A)),
      home: Scaffold(
        body: Row(
          children: [
            NavigationRail(
              selectedIndex: index,
              onDestinationSelected: (value) => setState(() => index = value),
              destinations: const [
                NavigationRailDestination(icon: Icon(Icons.dashboard), label: Text('Deck')),
                NavigationRailDestination(icon: Icon(Icons.bolt), label: Text('Manifest')),
                NavigationRailDestination(icon: Icon(Icons.hub), label: Text('Connectors')),
                NavigationRailDestination(icon: Icon(Icons.verified), label: Text('Proof')),
                NavigationRailDestination(icon: Icon(Icons.inventory_2), label: Text('Artifacts')),
              ],
            ),
            Expanded(child: screens[index]),
          ],
        ),
      ),
    );
  }
}

class CommandDeck extends StatelessWidget {
  const CommandDeck({required this.api, super.key});
  final PromptEndsApi api;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: api.health(),
      builder: (context, snapshot) {
        return ScreenFrame(
          title: 'PromptShell Command Deck',
          child: SelectableText(snapshot.hasData ? snapshot.data.toString() : snapshot.hasError ? 'Broken: ${snapshot.error}' : 'Checking PromptEnds...'),
        );
      },
    );
  }
}

class ManifestScreen extends StatefulWidget {
  const ManifestScreen({required this.api, super.key});
  final PromptEndsApi api;

  @override
  State<ManifestScreen> createState() => _ManifestScreenState();
}

class _ManifestScreenState extends State<ManifestScreen> {
  final intent = TextEditingController();
  String output = '';
  bool busy = false;

  @override
  void dispose() {
    intent.dispose();
    super.dispose();
  }

  Future<void> run() async {
    setState(() { busy = true; output = ''; });
    try {
      final result = await widget.api.manifest(seedIntent: intent.text);
      setState(() => output = result.toString());
    } catch (error) {
      setState(() => output = 'Broken: $error');
    } finally {
      setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ScreenFrame(
      title: 'Manifest-to-Proof',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextField(controller: intent, minLines: 3, maxLines: 6, decoration: const InputDecoration(labelText: 'Seed Intent')),
          const SizedBox(height: 12),
          FilledButton(onPressed: busy ? null : run, child: Text(busy ? 'Running...' : 'Manifest to Proof')),
          const SizedBox(height: 12),
          SelectableText(output.isEmpty ? 'No run yet.' : output),
        ],
      ),
    );
  }
}

class ConnectorsScreen extends StatelessWidget {
  const ConnectorsScreen({required this.api, super.key});
  final PromptEndsApi api;

  @override
  Widget build(BuildContext context) {
    return ScreenFrame(
      title: 'PromptLink Connectors',
      child: FutureBuilder<List<dynamic>>(
        future: api.connectors(),
        builder: (context, snapshot) {
          if (snapshot.hasError) return SelectableText('Broken: ${snapshot.error}');
          if (!snapshot.hasData) return const Text('Loading connectors...');
          final connectors = snapshot.data!;
          if (connectors.isEmpty) return const Text('No connectors registered.');
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              for (final connector in connectors)
                ListTile(
                  title: Text('${connector["name"]}'),
                  subtitle: Text('${connector["connectorId"]} • risk ${connector["riskLevel"]}'),
                  trailing: FilledButton(
                    onPressed: () async {
                      final result = await api.handshake('${connector["connectorId"]}');
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(result.toString())));
                      }
                    },
                    child: const Text('Handshake'),
                  ),
                )
            ],
          );
        },
      ),
    );
  }
}

class ProofScreen extends StatelessWidget {
  const ProofScreen({required this.api, super.key});
  final PromptEndsApi api;

  @override
  Widget build(BuildContext context) {
    return DataListScreen(title: 'Proof Ledger', loader: api.proofCards);
  }
}

class ArtifactsScreen extends StatelessWidget {
  const ArtifactsScreen({required this.api, super.key});
  final PromptEndsApi api;

  @override
  Widget build(BuildContext context) {
    return DataListScreen(title: 'Artifact Vault', loader: api.artifacts);
  }
}

class DataListScreen extends StatelessWidget {
  const DataListScreen({required this.title, required this.loader, super.key});
  final String title;
  final Future<List<dynamic>> Function() loader;

  @override
  Widget build(BuildContext context) {
    return ScreenFrame(
      title: title,
      child: FutureBuilder<List<dynamic>>(
        future: loader(),
        builder: (context, snapshot) {
          if (snapshot.hasError) return SelectableText('Broken: ${snapshot.error}');
          if (!snapshot.hasData) return const Text('Loading...');
          if (snapshot.data!.isEmpty) return const Text('No records yet. Run a real action first.');
          return SelectableText(snapshot.data.toString());
        },
      ),
    );
  }
}

class ScreenFrame extends StatelessWidget {
  const ScreenFrame({required this.title, required this.child, super.key});
  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(28),
      child: ListView(
        children: [
          Text(title, style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 18),
          Card(child: Padding(padding: const EdgeInsets.all(18), child: child)),
        ],
      ),
    );
  }
}
