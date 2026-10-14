// lib/services/api_service.dart (extrait des méthodes problématiques)
import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb, debugPrint;
import 'package:http/http.dart' as http;
import '../models/event_model.dart';
import '../models/guest_model.dart';

class ApiService {
  // Résout dynamiquement l'URL du backend selon l'environnement.
  // - Override en build/run: --dart-define=API_HOST=192.168.1.10 (optionnel)
  static String get baseUrl {
    const envHost = String.fromEnvironment('API_HOST', defaultValue: '');
    if (envHost.isNotEmpty) {
      // Allow passing host with optional port, e.g. "192.168.1.10:8000"
      return 'http://$envHost/api';
    }

    if (kIsWeb) return 'http://localhost:3000/api';
    // Sur Android avec 'adb reverse tcp:3000 tcp:3000' (ou émulateur configuré), localhost:3000 redirige vers le PC
    if (Platform.isAndroid) return 'http://192.168.43.250:3000/api';
    if (Platform.isIOS) return 'http://localhost:3000/api';

    // Fallback to localhost for other platforms (desktop/emulator)
    return 'http://localhost:3000/api';
  }

  static String? _authToken;

  static void setAuthToken(String? token) {
    _authToken = token == null || token.isEmpty ? null : token;
  }

  static Map<String, String> get _headers {
    return {
      'Content-Type': 'application/json',
      if (_authToken != null) 'Authorization': 'Bearer $_authToken',
    };
  }

  static dynamic _safeDecode(String body) {
    try {
      return jsonDecode(body);
    } catch (_) {
      return null;
    }
  }

  static String _extractErrorMessage(dynamic body, String fallback) {
    if (body is Map<String, dynamic>) {
      return body['message']?.toString() ??
          body['error']?.toString() ??
          body['detail']?.toString() ??
          fallback;
    }
    return fallback;
  }

  static void _checkResponse(http.Response response, {String? fallback}) {
    if (response.statusCode == 200) return;

    final body = _safeDecode(response.body);
    final message = _extractErrorMessage(body, fallback ?? response.body);

    if (response.statusCode == 401 || response.statusCode == 403) {
      throw AuthException(message);
    }

    throw ApiException('Erreur ${response.statusCode} : $message');
  }

  // ✅ Récupération des événements (tous les événements récents)
  static Future<List<EventModel>> getEvents() async {
    final response = await http.get(
      Uri.parse('$baseUrl/event/getRecentEvents'),
      headers: _headers,
    );

    _checkResponse(response,
        fallback: 'Erreur lors du chargement des événements');
    final dynamic body = _safeDecode(response.body);
    final List<dynamic> data;

    if (body is Map<String, dynamic>) {
      if (body['events'] is List) {
        data = body['events'] as List<dynamic>;
      } else if (body['data'] is List) {
        data = body['data'] as List<dynamic>;
      } else {
        data = body.values
            .whereType<List<dynamic>>()
            .firstWhere((value) => value.isNotEmpty, orElse: () => []);
      }
    } else if (body is List) {
      data = body;
    } else {
      data = [];
    }
    return data.map((json) => EventModel.fromJson(json)).toList();
  }

  // ✅ Récupération des événements de l'utilisateur connecté
  static Future<List<EventModel>> getEventsByUser(String userId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/event/getAllEventByUser/$userId'),
      headers: _headers,
    );

    _checkResponse(response,
        fallback: 'Erreur lors du chargement des événements de l\'utilisateur');
    final dynamic body = _safeDecode(response.body);
    final List<dynamic> data;

    if (body is Map<String, dynamic>) {
      if (body['events'] is List) {
        data = body['events'] as List<dynamic>;
      } else if (body['data'] is List) {
        data = body['data'] as List<dynamic>;
      } else {
        data = body.values
            .whereType<List<dynamic>>()
            .firstWhere((value) => value.isNotEmpty, orElse: () => []);
      }
    } else if (body is List) {
      data = body;
    } else {
      data = [];
    }

    return data.map((json) => EventModel.fromJson(json)).toList();
  }

  // ✅ Récupération des invités
  static Future<List<GuestModel>> getGuests(String eventId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/invite/getInvites/$eventId'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final Map<String, dynamic> body = jsonDecode(response.body);
      final List data = body['invites'] ?? (body is List ? body : []);
      return data.map((json) => GuestModel.fromJson(json)).toList();
    } else {
      throw Exception('Erreur lors du chargement des invités');
    }
  }

  // ✅ Statistiques utilisateur
  static Future<Map<String, dynamic>> getUserStats(String userId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/user/$userId/stats'),
      headers: _headers,
    );

    _checkResponse(response,
        fallback: 'Erreur lors du chargement des statistiques utilisateur');
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  // ✅ Vérification QR code
  static Future<Map<String, dynamic>> verifyQRCode(
      String qrData, String eventId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/scan/verify'),
      headers: _headers,
      body: jsonEncode({
        'qrData': qrData,
        'eventId': eventId,
      }),
    );

    return jsonDecode(response.body);
  }

  // ✅ Connexion
  static Future<Map<String, dynamic>> login(
      String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    _checkResponse(response, fallback: 'Échec de la connexion');
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  // ✅ Connexion Google avec vérification préalable en base de données
  static Future<Map<String, dynamic>> googleLogin(String token,
      {String? email, bool requireExisting = true}) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/google'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': token,
        if (email != null && email.isNotEmpty) 'email': email,
        'requireExisting': requireExisting,
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    _checkResponse(response,
        fallback:
            'Aucun compte associé à cette adresse Google n\'a été trouvé.');
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  // ✅ Vérification accès événement (délègue à connectToEventByCode)
  static Future<Map<String, dynamic>> verifyEventAccess(
      String eventId, String code) async {
    return connectToEventByCode(code);
  }

  // ✅ Connexion à un événement via code (utilise /event/connect)
  static Future<Map<String, dynamic>> connectToEventByCode(
      String eventCode) async {
    final response = await http.post(
      Uri.parse('$baseUrl/event/connect'),
      headers: _headers,
      body: jsonEncode({'EventCode': eventCode}),
    );

    _checkResponse(response, fallback: 'Code d\'événement invalide');
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  // ✅ Statistiques complètes de scan d'événement (Graphes, Présents, Absents, Alertes)
  static Future<Map<String, dynamic>> getScanStats(String eventId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/scan/stats/$eventId'),
      headers: _headers,
    );

    _checkResponse(response,
        fallback: 'Erreur lors du chargement des statistiques de scan');
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  // ✅ Statistiques événement
  static Future<Map<String, dynamic>> getEventStats(String eventId) async {
    return getScanStats(eventId);
  }

  // ✅ Récupération de l'événement assigné à l'agent connecté
  static Future<EventModel?> getMyAgentEvent() async {
    final response = await http.get(
      Uri.parse('$baseUrl/agent/my-event'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (data['event'] != null) {
        return EventModel.fromJson(data['event'] as Map<String, dynamic>);
      }
      return null;
    } else if (response.statusCode == 404) {
      // Pas d'événement assigné — cas légitime
      debugPrint('getMyAgentEvent: aucun événement assigné (404)');
      return null;
    } else {
      _checkResponse(response,
          fallback: 'Erreur lors de la récupération de l\'événement agent');
      return null;
    }
  }

  // ✅ Récupération d'un événement unique par son ID
  static Future<EventModel?> getEventById(String eventId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/event/$eventId'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final dynamic body = _safeDecode(response.body);
      if (body is Map<String, dynamic>) {
        final eventJson = body['event'] ?? body;
        return EventModel.fromJson(eventJson as Map<String, dynamic>);
      }
    }
    return null;
  }

  // ✅ Modification de mot de passe Agent
  static Future<Map<String, dynamic>> changeAgentPassword(
      String oldPassword, String newPassword) async {
    final response = await http.post(
      Uri.parse('$baseUrl/agent/change-password'),
      headers: _headers,
      body: jsonEncode({
        'oldPassword': oldPassword,
        'newPassword': newPassword,
      }),
    );

    _checkResponse(response,
        fallback: 'Erreur lors de la modification du mot de passe');
    return jsonDecode(response.body) as Map<String, dynamic>;
  }
}

class ApiException implements Exception {
  final String message;
  ApiException(this.message);
  @override
  String toString() => message;
}

class AuthException extends ApiException {
  AuthException(super.message);
}
