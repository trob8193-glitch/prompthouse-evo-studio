/**
 * PH EVO STUDIO — MOBILE APP MAKER ENGINE
 * Autonomous mobile application scaffolding, generation, and deployment.
 * Supports React Native and Flutter output targets.
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'generated_apps');

const TEMPLATES = {
  'react-native': {
    extension: '.jsx',
    scaffold: (appName, screens) => {
      const screenImports = screens
        .map((s) => `import ${s.name}Screen from './screens/${s.name}Screen';`)
        .join('\n');

      const stackScreens = screens
        .map(
          (s) =>
            `        <Stack.Screen name="${s.name}" component={${s.name}Screen} options={{ title: '${s.label}' }} />`
        )
        .join('\n');

      return `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
${screenImports}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="${screens[0]?.name || 'Home'}">
${stackScreens}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
`;
    },
    screenTemplate: (screenDef) => `import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';

export default function ${screenDef.name}Screen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('${screenDef.apiEndpoint || 'https://api.example.com/data'}');
        const json = await response.json();
        setData(json.items || json);
      } catch (err) {
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>${screenDef.label}</Text>
      <FlatList
        data={data}
        keyExtractor={(item, index) => String(item.id || index)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>{item.title || item.name || JSON.stringify(item)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  card: { backgroundColor: '#1A1A2E', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { color: '#E0E0E0', fontSize: 16 },
});
`,
  },

  flutter: {
    extension: '.dart',
    scaffold: (appName, screens) => {
      const routes = screens
        .map((s) => `        '/${s.name.toLowerCase()}': (context) => const ${s.name}Screen(),`)
        .join('\n');

      return `import 'package:flutter/material.dart';
${screens.map((s) => `import 'screens/${s.name.toLowerCase()}_screen.dart';`).join('\n')}

void main() => runApp(const ${appName}App());

class ${appName}App extends StatelessWidget {
  const ${appName}App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${appName}',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primarySwatch: Colors.deepPurple,
        scaffoldBackgroundColor: const Color(0xFF0D0D0D),
      ),
      initialRoute: '/${screens[0]?.name.toLowerCase() || 'home'}',
      routes: {
${routes}
      },
    );
  }
}
`;
    },
    screenTemplate: (screenDef) => `import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class ${screenDef.name}Screen extends StatefulWidget {
  const ${screenDef.name}Screen({super.key});

  @override
  State<${screenDef.name}Screen> createState() => _${screenDef.name}ScreenState();
}

class _${screenDef.name}ScreenState extends State<${screenDef.name}Screen> {
  List<dynamic> _data = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final response = await http.get(Uri.parse('${screenDef.apiEndpoint || 'https://api.example.com/data'}'));
      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        setState(() {
          _data = decoded is List ? decoded : decoded['items'] ?? [];
          _loading = false;
        });
      }
    } catch (e) {
      setState(() { _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('${screenDef.label}')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _data.length,
              itemBuilder: (context, index) {
                final item = _data[index];
                return Card(
                  color: const Color(0xFF1A1A2E),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    title: Text(
                      item['title'] ?? item['name'] ?? item.toString(),
                      style: const TextStyle(color: Colors.white70),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
`,
  },
};

export class MobileAppMaker {
  constructor() {
    this.generatedApps = [];
  }

  async generate(config) {
    const {
      appName = 'EvoApp',
      platform = 'react-native',
      screens = [{ name: 'Home', label: 'Home', apiEndpoint: null }],
    } = config;

    const template = TEMPLATES[platform];
    if (!template) {
      throw new Error(`Unsupported platform: ${platform}. Supported: ${Object.keys(TEMPLATES).join(', ')}`);
    }

    const appDir = path.join(outputDir, appName);
    const screensDir = path.join(appDir, 'screens');
    fs.mkdirSync(screensDir, { recursive: true });

    // Generate App entry point
    const appCode = template.scaffold(appName, screens);
    const appFile = path.join(appDir, `App${template.extension}`);
    fs.writeFileSync(appFile, appCode, 'utf8');

    // Generate each screen
    for (const screenDef of screens) {
      const screenCode = template.screenTemplate(screenDef);
      const screenFileName =
        platform === 'flutter'
          ? `${screenDef.name.toLowerCase()}_screen${template.extension}`
          : `${screenDef.name}Screen${template.extension}`;
      const screenFile = path.join(screensDir, screenFileName);
      fs.writeFileSync(screenFile, screenCode, 'utf8');
    }

    // Write a manifest receipt
    const manifest = {
      appName,
      platform,
      screens: screens.map((s) => s.name),
      generatedAt: new Date().toISOString(),
      outputDir: appDir,
    };

    fs.writeFileSync(path.join(appDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

    this.generatedApps.push(manifest);
    return manifest;
  }

  listGenerated() {
    return this.generatedApps;
  }
}

// CLI execution
if (process.argv[1] && process.argv[1].endsWith('mobile-app-maker.mjs')) {
  const maker = new MobileAppMaker();

  const demoConfig = {
    appName: 'PromptHouseMobile',
    platform: 'react-native',
    screens: [
      { name: 'Home', label: 'Dashboard', apiEndpoint: 'http://127.0.0.1:3001/api/dashboard' },
      { name: 'Projects', label: 'My Projects', apiEndpoint: 'http://127.0.0.1:3001/api/projects' },
      { name: 'Settings', label: 'Settings', apiEndpoint: 'http://127.0.0.1:3001/api/settings' },
    ],
  };

  maker
    .generate(demoConfig)
    .then((manifest) => {
      process.stdout.write(`Mobile app generated: ${manifest.appName} (${manifest.platform})\n`);
      process.stdout.write(`Output: ${manifest.outputDir}\n`);
      process.stdout.write(`Screens: ${manifest.screens.join(', ')}\n`);
    })
    .catch((err) => {
      process.stderr.write(`Failed: ${err.message}\n`);
      process.exit(1);
    });
}
