import 'package:flutter/material.dart';

import 'models.dart';
import 'screens/extension_foundry_screen.dart';
import 'services/blueprint_engine.dart';
import 'services/bot_customer_simulator.dart';
import 'services/fire_order_engine.dart';
import 'services/prompt_auth_engine.dart';
import 'services/promptbase_service.dart';
import 'services/proof_deck_service.dart';

void main() => runApp(const PromptHouseEvoNativeStudio());

class PromptHouseEvoNativeStudio extends StatelessWidget {
  const PromptHouseEvoNativeStudio({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PromptHouse Evo Studio',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        colorSchemeSeed: const Color(0xFFF5B942),
        useMaterial3: true,
      ),
      home: const StudioShell(),
    );
  }
}

class StudioShell extends StatefulWidget {
  const StudioShell({super.key});

  @override
  State<StudioShell> createState() => _StudioShellState();
}

class _StudioShellState extends State<StudioShell> {
  int selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final pages = const [StudioHomePage(), ExtensionFoundryScreen()];
    return Scaffold(
      body: pages[selectedIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,
        onDestinationSelected: (index) => setState(() => selectedIndex = index),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_customize_outlined), selectedIcon: Icon(Icons.dashboard_customize), label: 'Studio'),
          NavigationDestination(icon: Icon(Icons.extension_outlined), selectedIcon: Icon(Icons.extension), label: 'Extension Foundry'),
        ],
      ),
    );
  }
}

class StudioHomePage extends StatefulWidget {
  const StudioHomePage({super.key});
  @override
  State<StudioHomePage> createState() => _StudioHomePageState();
}

class _StudioHomePageState extends State<StudioHomePage> {
  final intentController = TextEditingController(text: 'Build a mobile AI studio that turns vibe prompts into working app blueprints.');
  final promptAuth = PromptAuthEngine.seeded();
  final promptBase = PromptBaseService.seeded();
  final fireOrders = FireOrderEngine();
  final proofDeck = ProofDeckService();
  final botCustomers = BotCustomerSimulator();
  late BlueprintEngine blueprintEngine;

  StudioMission? mission;
  Blueprint? blueprint;
  List<FireOrder> orders = [];
  List<ProofArtifact> proofs = [];
  List<BotCustomerFeedback> feedback = [];

  @override
  void initState() {
    super.initState();
    blueprintEngine = BlueprintEngine(promptBase: promptBase);
    _forge();
  }

  void _forge() {
    final intent = intentController.text.trim();
    final auth = promptAuth.authorize(actorId: 'user_owner', action: PromptAction.forgeBlueprint, resource: 'mission:new');
    final m = StudioMission(
      id: 'mission_${DateTime.now().millisecondsSinceEpoch}',
      title: 'Native Studio Build',
      intent: intent,
      status: auth.allowed ? MissionStatus.blueprinting : MissionStatus.blocked,
      modules: const ['Prompt Architect', 'Product Framer', 'Tool Router', 'Truth Auditor', 'Artifact Builder', 'Extension Foundry'],
      truthStates: auth.allowed ? const ['built', 'recommended'] : const ['blocked'],
    );
    final o = fireOrders.createForIntent(intent);
    final b = auth.allowed ? blueprintEngine.createBlueprint(m, o) : Blueprint.blocked(m.id, auth.reason);
    setState(() {
      mission = m;
      orders = o;
      blueprint = b;
      proofs = proofDeck.createInitialProofs(m, b, o);
      feedback = botCustomers.simulateFeedback(b);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('PromptHouse Evo Native Studio'),
        actions: [
          const Padding(
            padding: EdgeInsets.only(right: 8),
            child: Center(child: Chip(label: Text('FORGERAIL_LOCAL'))),
          ),
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 12),
              child: Chip(label: Text(mission?.status.label ?? 'intake')),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          const _Card(title: '🦁 Post-MVP Mobile Dev Studio', child: Text('Prompt Auth → PromptBase → Fire Orders → Blueprint → Proof Deck → Bot Customers → Repair Loop → Extension Foundry')),
          TextField(controller: intentController, minLines: 2, maxLines: 4, decoration: const InputDecoration(labelText: 'Mission intent', border: OutlineInputBorder())),
          const SizedBox(height: 12),
          FilledButton.icon(onPressed: _forge, icon: const Icon(Icons.auto_awesome), label: const Text('Forge Mission')),
          if (mission != null) _Card(title: 'Saved Mission', child: Text('${mission!.title}\n${mission!.intent}\nModules: ${mission!.modules.join(", ")}')),
          if (blueprint != null) _Card(title: 'Blueprint Forge', child: Text('${blueprint!.productBrief}\n\nScreens: ${blueprint!.screens.join(", ")}')),
          _Card(title: 'Prompt Fire Orders', child: Column(children: orders.map((o) => ListTile(dense: true, leading: Text('${o.priority}'), title: Text(o.command), subtitle: Text('${o.ownerModule} → ${o.expectedArtifact}'), trailing: Chip(label: Text(o.riskLevel)))).toList())),
          _Card(title: 'Proof Deck', child: Column(children: proofs.map((p) => ListTile(dense: true, leading: const Icon(Icons.fact_check), title: Text(p.title), subtitle: Text(p.verificationNote), trailing: Chip(label: Text(p.status)))).toList())),
          _Card(title: 'Simulated Digital Bot Customers', child: Column(children: feedback.map((f) => ListTile(dense: true, leading: const Icon(Icons.smart_toy), title: Text(f.persona), subtitle: Text('${f.feedback}\nRepair: ${f.repairRequest}'), trailing: Text('${f.score}/10'))).toList())),
          const _Card(title: 'Compatibility Hub', child: Text('Runs as Flutter mobile/web/desktop. Compatible with VS Code, Android Studio, Antigravity, OpenAPI/MCP connectors, and any AI chat through the portable kernel.')),
        ],
      ),
    );
  }
}

class _Card extends StatelessWidget {
  const _Card({required this.title, required this.child});
  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) => Card(
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
