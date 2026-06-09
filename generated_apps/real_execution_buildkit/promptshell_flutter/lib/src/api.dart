import 'dart:convert';
import 'package:http/http.dart' as http;

class PromptEndsApi {
  PromptEndsApi({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;
  // PHASE 2: Updated to connect to PromptBridge backend on port 3001
  static const baseUrl = String.fromEnvironment('PROMPTENDS_BASE_URL',
      defaultValue: 'http://localhost:3001/api/promptshell');

  Future<Map<String, dynamic>> health() => _getMap('/health');
  Future<Map<String, dynamic>> evoCapabilities() =>
      _getMap('/evo-capabilities');
  Future<Map<String, dynamic>> liveReadiness() => _getMap('/live-readiness');
  Future<List<dynamic>> connectors() =>
      _getEnvelopeList('/connectors', 'connectors');
  Future<List<dynamic>> proofCards() =>
      _getEnvelopeList('/proof-cards', 'proofCards');
  Future<List<dynamic>> artifacts() =>
      _getEnvelopeList('/artifacts', 'artifacts');

  Future<Map<String, dynamic>> handshake(String connectorId) {
    return _postMap('/connectors/$connectorId/handshake', {});
  }

  Future<Map<String, dynamic>> manifest({required String seedIntent}) {
    return _postMap('/manifest/run', {
      'workspaceId': 'local-workspace',
      'projectId': 'local-project',
      'seedIntent': seedIntent,
      'constraints': ['no mock data', 'server-side secrets only'],
      'targetPlatform': 'flutter_web',
    });
  }

  Future<Map<String, dynamic>> _getMap(String path) async {
    final response = await _client.get(Uri.parse('$baseUrl$path'));
    return _decodeMap(response);
  }

  Future<List<dynamic>> _getEnvelopeList(String path, String key) async {
    final response = await _client.get(Uri.parse('$baseUrl$path'));
    final decoded = _decode(response);
    if (decoded is List) return decoded;
    if (decoded is Map<String, dynamic> && decoded[key] is List) {
      return decoded[key] as List<dynamic>;
    }
    throw Exception(
        'Expected list field "$key" from $path but got ${decoded.runtimeType}');
  }

  Future<Map<String, dynamic>> _postMap(
      String path, Map<String, dynamic> body) async {
    final response = await _client.post(
      Uri.parse('$baseUrl$path'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
    return _decodeMap(response);
  }

  Map<String, dynamic> _decodeMap(http.Response response) {
    final decoded = _decode(response);
    if (decoded is Map<String, dynamic>) return decoded;
    throw Exception('Expected object but got ${decoded.runtimeType}');
  }

  dynamic _decode(http.Response response) {
    final body = response.body.isEmpty ? null : jsonDecode(response.body);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('PromptEnds ${response.statusCode}: $body');
    }
    return body;
  }
}
