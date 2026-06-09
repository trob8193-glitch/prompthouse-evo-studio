import 'package:flutter/material.dart';

import 'src/api.dart';

const _voidColor = Color(0xFF050712);
const _panelColor = Color(0xFF0B1220);
const _lineColor = Color(0xFF1F2A3D);
const _pulseColor = Color(0xFF18F27A);
const _forgeColor = Color(0xFF38BDF8);
const _proofColor = Color(0xFFF8D66D);

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
      title: 'PromptShell Evo',
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: _voidColor,
        colorScheme: ColorScheme.fromSeed(
                seedColor: _pulseColor, brightness: Brightness.dark)
            .copyWith(
          surface: _panelColor,
          primary: _pulseColor,
          secondary: _forgeColor,
          tertiary: _proofColor,
        ),
        cardTheme: CardThemeData(
          color: _panelColor,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: const BorderSide(color: _lineColor),
          ),
        ),
      ),
      home: LayoutBuilder(
        builder: (context, constraints) {
          final compact = constraints.maxWidth < 760;
          if (compact) {
            return Scaffold(
              body: screens[index],
              bottomNavigationBar: NavigationBar(
                selectedIndex: index,
                onDestinationSelected: (value) => setState(() => index = value),
                destinations: const [
                  NavigationDestination(
                      icon: Icon(Icons.dashboard), label: 'Deck'),
                  NavigationDestination(
                      icon: Icon(Icons.bolt), label: 'Manifest'),
                  NavigationDestination(
                      icon: Icon(Icons.hub), label: 'Connectors'),
                  NavigationDestination(
                      icon: Icon(Icons.verified), label: 'Proof'),
                  NavigationDestination(
                      icon: Icon(Icons.inventory_2), label: 'Artifacts'),
                ],
              ),
            );
          }
          return Scaffold(
            body: Row(
              children: [
                NavigationRail(
                  backgroundColor: _panelColor,
                  selectedIndex: index,
                  onDestinationSelected: (value) =>
                      setState(() => index = value),
                  labelType: NavigationRailLabelType.all,
                  destinations: const [
                    NavigationRailDestination(
                        icon: Icon(Icons.dashboard), label: Text('Deck')),
                    NavigationRailDestination(
                        icon: Icon(Icons.bolt), label: Text('Manifest')),
                    NavigationRailDestination(
                        icon: Icon(Icons.hub), label: Text('Connectors')),
                    NavigationRailDestination(
                        icon: Icon(Icons.verified), label: Text('Proof')),
                    NavigationRailDestination(
                        icon: Icon(Icons.inventory_2),
                        label: Text('Artifacts')),
                  ],
                ),
                Expanded(child: screens[index]),
              ],
            ),
          );
        },
      ),
    );
  }
}

class CommandDeck extends StatelessWidget {
  const CommandDeck({required this.api, super.key});
  final PromptEndsApi api;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Map<String, dynamic>>>(
      future: Future.wait(
          [api.health(), api.evoCapabilities(), api.liveReadiness()]),
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return ScreenFrame(
            title: 'PromptShell Command Deck',
            child: BrokenState(error: snapshot.error),
          );
        }
        if (!snapshot.hasData) {
          return const ScreenFrame(
            title: 'PromptShell Command Deck',
            child: LoadingState(message: 'Checking PromptEnds...'),
          );
        }

        final health = snapshot.data![0];
        final envelope = snapshot.data![1];
        final liveEnvelope = snapshot.data![2];
        final capabilities = _asMap(envelope['capabilities']);
        final liveReadiness = _asMap(liveEnvelope['readiness']).isNotEmpty
            ? _asMap(liveEnvelope['readiness'])
            : _asMap(capabilities['liveReadiness']);
        final brand = _asMap(capabilities['brand']).isNotEmpty
            ? _asMap(capabilities['brand'])
            : _asMap(health['brand']);

        return ScreenFrame(
          title: 'PromptShell Command Deck',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              EvoHeader(
                  brand: brand, health: health, capabilities: capabilities),
              const SizedBox(height: 18),
              CapabilityMatrix(capabilities: capabilities),
              const SizedBox(height: 18),
              LiveReadinessPanel(readiness: liveReadiness),
              const SizedBox(height: 18),
              ProofRail(steps: _asList(capabilities['proofRail'])),
            ],
          ),
        );
      },
    );
  }
}

class EvoHeader extends StatelessWidget {
  const EvoHeader(
      {required this.brand,
      required this.health,
      required this.capabilities,
      super.key});

  final Map<String, dynamic> brand;
  final Map<String, dynamic> health;
  final Map<String, dynamic> capabilities;

  @override
  Widget build(BuildContext context) {
    final badges = _asList(brand['badges']);
    final runtime = _asMap(capabilities['runtime']);
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _lineColor),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [_panelColor, Color(0xFF081D22)],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _text(brand['name'], 'PromptHouse Evo Studio'),
            style: Theme.of(context)
                .textTheme
                .headlineSmall
                ?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 6),
          Text(_text(brand['runtime'], 'PromptShell Evo Runtime')),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              StatusChip(
                  label: 'Bridge',
                  value: _text(health['bridge'], 'PromptBridge'),
                  color: _forgeColor),
              StatusChip(
                  label: 'Database',
                  value: _text(health['database'], 'unknown'),
                  color: _pulseColor),
              StatusChip(
                  label: 'Agent',
                  value: _text(health['agent'], 'unknown'),
                  color: _proofColor),
              StatusChip(
                  label: 'Mode',
                  value: _text(runtime['providerMode'], 'local_contracts_only'),
                  color: _forgeColor),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final badge in badges) EvoBadge(label: _text(badge)),
            ],
          ),
        ],
      ),
    );
  }
}

class CapabilityMatrix extends StatelessWidget {
  const CapabilityMatrix({required this.capabilities, super.key});
  final Map<String, dynamic> capabilities;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = constraints.maxWidth > 920 ? 2 : 1;
        final width = (constraints.maxWidth - (columns - 1) * 12) / columns;
        return Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            SizedBox(
              width: width,
              child: CapabilityCard(
                icon: Icons.phone_iphone,
                title: 'Flutter Surface',
                surface: _asMap(capabilities['flutter']),
                accent: _pulseColor,
              ),
            ),
            SizedBox(
              width: width,
              child: CapabilityCard(
                icon: Icons.terminal,
                title: 'Python Surface',
                surface: _asMap(capabilities['python']),
                accent: _forgeColor,
              ),
            ),
          ],
        );
      },
    );
  }
}

class CapabilityCard extends StatelessWidget {
  const CapabilityCard(
      {required this.icon,
      required this.title,
      required this.surface,
      required this.accent,
      super.key});
  final IconData icon;
  final String title;
  final Map<String, dynamic> surface;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    final capabilities = _asList(surface['capabilities']);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: accent),
                const SizedBox(width: 10),
                Expanded(
                    child: Text(title,
                        style: Theme.of(context).textTheme.titleMedium)),
              ],
            ),
            const SizedBox(height: 10),
            EvoBadge(label: _text(surface['truthState'], 'UNKNOWN')),
            const SizedBox(height: 12),
            for (final capability in capabilities)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.check_circle, color: accent, size: 18),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_text(capability))),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class LiveReadinessPanel extends StatelessWidget {
  const LiveReadinessPanel({required this.readiness, super.key});
  final Map<String, dynamic> readiness;

  @override
  Widget build(BuildContext context) {
    if (readiness.isEmpty) return const SizedBox.shrink();
    final bridge = _asMap(readiness['bridge']);
    final blockers = _asList(readiness['blockers']);
    final warnings = _asList(readiness['warnings']);
    final device = _asMap(readiness['device']);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.public, color: _forgeColor),
                const SizedBox(width: 10),
                Expanded(
                    child: Text('Live Bridge / Device / Provider Readiness',
                        style: Theme.of(context).textTheme.titleMedium)),
                EvoBadge(label: _text(readiness['truthState'], 'UNKNOWN')),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                StatusChip(
                    label: 'Bridge',
                    value: _text(bridge['truthState'], 'unknown'),
                    color: _forgeColor),
                StatusChip(
                    label: 'Device',
                    value: _text(device['truthState'], 'unknown'),
                    color: _proofColor),
              ],
            ),
            const SizedBox(height: 12),
            SelectableText(_text(bridge['baseUrl'], 'No bridge URL declared')),
            const SizedBox(height: 12),
            if (blockers.isNotEmpty) ...[
              Text('Blockers', style: Theme.of(context).textTheme.labelLarge),
              const SizedBox(height: 8),
              for (final blocker in blockers) BlockerRow(text: _text(blocker)),
            ],
            if (warnings.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text('Warnings', style: Theme.of(context).textTheme.labelLarge),
              const SizedBox(height: 8),
              for (final warning in warnings)
                BlockerRow(text: _text(warning), color: _proofColor),
            ],
          ],
        ),
      ),
    );
  }
}

class BlockerRow extends StatelessWidget {
  const BlockerRow(
      {required this.text, this.color = Colors.redAccent, super.key});
  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.error_outline, color: color, size: 18),
          const SizedBox(width: 8),
          Expanded(child: Text(text)),
        ],
      ),
    );
  }
}

class ProofRail extends StatelessWidget {
  const ProofRail({required this.steps, super.key});
  final List<dynamic> steps;

  @override
  Widget build(BuildContext context) {
    if (steps.isEmpty) return const SizedBox.shrink();
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Evo Proof Rail',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                for (final step in steps)
                  Builder(
                    builder: (context) {
                      final map = _asMap(step);
                      return StatusChip(
                        label: _text(map['step'], 'step'),
                        value: _text(map['truthState'], 'unknown'),
                        color: _proofColor,
                      );
                    },
                  ),
              ],
            ),
          ],
        ),
      ),
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
    setState(() {
      busy = true;
      output = '';
    });
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
          TextField(
            controller: intent,
            minLines: 3,
            maxLines: 6,
            decoration: const InputDecoration(labelText: 'Seed Intent'),
          ),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: busy ? null : run,
            icon: const Icon(Icons.bolt),
            label: Text(busy ? 'Running...' : 'Manifest to Proof'),
          ),
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
          if (snapshot.hasError)
            return SelectableText('Broken: ${snapshot.error}');
          if (!snapshot.hasData)
            return const LoadingState(message: 'Loading connectors...');
          final connectors = snapshot.data!;
          if (connectors.isEmpty)
            return const Text('No connectors registered.');
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              for (final connector in connectors)
                Card(
                  child: ListTile(
                    leading: const Icon(Icons.hub),
                    title: Text('${connector["name"]}'),
                    subtitle: Text(
                        '${connector["connectorId"]} - risk ${connector["riskLevel"]}'),
                    trailing: FilledButton.icon(
                      onPressed: () async {
                        final result =
                            await api.handshake('${connector["connectorId"]}');
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text(result.toString())));
                        }
                      },
                      icon: const Icon(Icons.link),
                      label: const Text('Handshake'),
                    ),
                  ),
                ),
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
          if (snapshot.hasError)
            return SelectableText('Broken: ${snapshot.error}');
          if (!snapshot.hasData)
            return const LoadingState(message: 'Loading...');
          if (snapshot.data!.isEmpty)
            return const Text('No records yet. Run a real action first.');
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
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: ListView(
          children: [
            Text(title,
                style: Theme.of(context)
                    .textTheme
                    .headlineMedium
                    ?.copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(height: 18),
            child,
          ],
        ),
      ),
    );
  }
}

class StatusChip extends StatelessWidget {
  const StatusChip(
      {required this.label,
      required this.value,
      required this.color,
      super.key});
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.55)),
      ),
      child: Text('$label: $value',
          style: TextStyle(color: color, fontWeight: FontWeight.w700)),
    );
  }
}

class EvoBadge extends StatelessWidget {
  const EvoBadge({required this.label, super.key});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
      ),
      child: Text(label, style: const TextStyle(fontWeight: FontWeight.w700)),
    );
  }
}

class LoadingState extends StatelessWidget {
  const LoadingState({required this.message, super.key});
  final String message;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(strokeWidth: 2)),
        const SizedBox(width: 12),
        Expanded(child: Text(message)),
      ],
    );
  }
}

class BrokenState extends StatelessWidget {
  const BrokenState({required this.error, super.key});
  final Object? error;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: SelectableText('Broken: $error'),
      ),
    );
  }
}

Map<String, dynamic> _asMap(dynamic value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) return Map<String, dynamic>.from(value);
  return const {};
}

List<dynamic> _asList(dynamic value) {
  if (value is List) return value;
  return const [];
}

String _text(dynamic value, [String fallback = '']) {
  final text = value?.toString() ?? '';
  return text.isEmpty ? fallback : text;
}
