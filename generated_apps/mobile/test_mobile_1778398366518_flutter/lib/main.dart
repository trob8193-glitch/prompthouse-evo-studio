import 'package:flutter/material.dart';

void main() {
  runApp(const testmobile1778398366518App());
}

class testmobile1778398366518App extends StatelessWidget {
  const testmobile1778398366518App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'test_mobile_1778398366518',
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
      appBar: AppBar(title: const Text('test_mobile_1778398366518')),
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
