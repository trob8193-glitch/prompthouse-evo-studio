import 'dart:convert';
import 'package:http/http.dart' as http;

class PromptEndsApi {
  PromptEndsApi({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;
  static const baseUrl = String.fromEnvironment('PROMPTENDS_BASE_URL', defaultValue: 'http://localhost:8000');

  Future<Map<String, dynamic>> health() => _getMap('/health');
  Future<List<dynamic>> connectors() => _getList('/link/connectors');
  Future<List<dynamic>> proofCards() => _getList('/api/proof-cards');
  Future<List<dynamic>> artifacts() => _getList('/api/artifacts');

  Future<Map<String, dynamic>> handshake(String connectorId) {
    return _postMap('/link/connectors/$connectorId/handshake', {});
  }

  Future<Map<String, dynamic>> manifest({required String seedIntent}) {
    return _postMap('/api/manifest/run', {
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

  Future<List<dynamic>> _getList(String path) async {
    final response = await _client.get(Uri.parse('$baseUrl$path'));
    final decoded = _decode(response);
    if (decoded is List) return decoded;
    throw Exception('Expected list from $path but got ${decoded.runtimeType}');
  }

  Future<Map<String, dynamic>> _postMap(String path, Map<String, dynamic> body) async {
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
