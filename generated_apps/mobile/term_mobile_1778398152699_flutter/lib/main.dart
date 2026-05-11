import 'package:flutter/material.dart';

void main() {
  runApp(const termmobile1778398152699App());
}

class termmobile1778398152699App extends StatelessWidget {
  const termmobile1778398152699App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'term_mobile_1778398152699',
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: const Color(0xFF4F46E5)),
      home: const MobileHomePage(),
    );
  }
}

class MobileHomePage extends StatelessWidget {
  const MobileHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final features = <String>[
      'Auth',
      'Dashboard',
    ];
    return Scaffold(
      appBar: AppBar(title: const Text('term_mobile_1778398152699')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: features.length,
        itemBuilder: (context, i) => Card(
          child: ListTile(
            leading: const Icon(Icons.bolt),
            title: Text(features[i]),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: const Icon(Icons.rocket_launch),
      ),
    );
  }
}
