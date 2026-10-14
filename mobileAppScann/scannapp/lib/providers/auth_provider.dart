// lib/providers/auth_provider.dart
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../models/event_model.dart';

class AuthProvider extends ChangeNotifier {
  String? _token;
  String? _userId;
  Map<String, dynamic>? _user;
  EventModel? _currentEvent;
  bool _isEventConnected = false;
  bool _isLoading = false;
  String? _error;
  bool _isAgentEventLoading = false;
  String? _agentEventError;

  String? get token => _token;
  String? get userId => _userId;
  Map<String, dynamic>? get user => _user;
  EventModel? get currentEvent => _currentEvent;
  bool get isEventConnected => _isEventConnected;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAgentEventLoading => _isAgentEventLoading;
  String? get agentEventError => _agentEventError;
  bool get isAuthenticated => _token != null;
  bool get hasEventSelected => _currentEvent != null && _isEventConnected;

  bool get isAgent => _user?['role'] == 'agent';
  String? get assignedEventId => (_user?['eventId'] ?? _user?['idEvent'])?.toString();

  /// Initialize auth from stored token on app startup
  Future<void> initializeAuth() async {
    _token = await StorageService.getToken();
    _userId = await StorageService.getUserId();
    _user = await StorageService.getUser();
    _isEventConnected = await StorageService.isEventConnected();
    final connectedEvtId = await StorageService.getConnectedEventId();

    if (_token != null) {
      ApiService.setAuthToken(_token);

      if (_isEventConnected && connectedEvtId != null && connectedEvtId.isNotEmpty) {
        try {
          final event = await ApiService.getEventById(connectedEvtId);
          if (event != null) {
            _currentEvent = event;
          }
        } catch (e) {
          debugPrint('Erreur rechargement événement connecté: $e');
        }
      }

      // Si l'utilisateur est un Agent de Scan et n'a pas encore d'événement chargé
      if (isAgent && _currentEvent == null) {
        await fetchMyAgentEvent();
      }
    }
    notifyListeners();
  }

  Future<EventModel?> fetchMyAgentEvent() async {
    _isAgentEventLoading = true;
    _agentEventError = null;
    notifyListeners();

    try {
      final agentEvtId = assignedEventId;
      EventModel? event;
      if (agentEvtId != null && agentEvtId.isNotEmpty) {
        debugPrint('Agent: chargement événement par ID assigné: $agentEvtId');
        event = await ApiService.getEventById(agentEvtId);
      }
      event ??= await ApiService.getMyAgentEvent();

      if (event != null) {
        _currentEvent = event;
        debugPrint('Agent: événement chargé avec succès: ${event.name}');
      } else {
        _agentEventError = 'Aucun événement assigné trouvé.';
        debugPrint('Agent: aucun événement trouvé');
      }
      return event;
    } catch (e) {
      debugPrint('Erreur fetchMyAgentEvent: $e');
      _agentEventError = 'Erreur de chargement : ${e.toString().replaceAll("Exception: ", "")}';
      return null;
    } finally {
      _isAgentEventLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.login(email, password);

      // Extract accessToken from response
      final accessToken = response['accessToken'] as String?;
      if (accessToken == null) {
        _error = 'Token non reçu du serveur';
        notifyListeners();
        return false;
      }

      // Extract user info from response
      final userInfo = response['user'] as Map<String, dynamic>? ?? {};
      final userId =
          (userInfo['id'] ?? userInfo['_id'] ?? userInfo['userId'])?.toString();

      if (userId == null) {
        _error = 'ID utilisateur non reçu';
        notifyListeners();
        return false;
      }

      // Store token, userId and user object
      _token = accessToken;
      _userId = userId;
      _user = userInfo;

      // Persist to local storage
      await StorageService.saveToken(accessToken);
      await StorageService.saveUserId(userId);
      await StorageService.saveUser(userInfo);

      // Set auth token in API service for future requests
      ApiService.setAuthToken(accessToken);

      // Si l'utilisateur est un Agent de Scan, charger automatiquement son événement assigné
      if (isAgent) {
        await fetchMyAgentEvent();
      }

      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> loginWithGoogle(String token, {String? email}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.googleLogin(token, email: email, requireExisting: true);

      final accessToken = response['accessToken'] as String?;
      if (accessToken == null) {
        _error = 'Token non reçu du serveur';
        notifyListeners();
        return false;
      }

      final userInfo = response['user'] as Map<String, dynamic>? ?? {};
      final userId =
          (userInfo['id'] ?? userInfo['_id'] ?? userInfo['userId'])?.toString();

      if (userId == null) {
        _error = 'ID utilisateur non reçu';
        notifyListeners();
        return false;
      }

      _token = accessToken;
      _userId = userId;
      _user = userInfo;

      await StorageService.saveToken(accessToken);
      await StorageService.saveUserId(userId);
      ApiService.setAuthToken(accessToken);

      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> connectToEventByCode(String eventId, String eventCode) async {
    _isLoading = true;
    _error = null;

    try {
      final response = await ApiService.connectToEventByCode(eventCode);
      if (response['event'] != null) {
        final eventData = response['event'] as Map<String, dynamic>;
        _currentEvent = EventModel.fromJson(eventData);
        _isEventConnected = true;
        await StorageService.saveEventConnection(_currentEvent!.id);
        return true;
      } else {
        _error = 'Événement non trouvé';
        return false;
      }
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void selectEvent(EventModel event) {
    _currentEvent = event;
    _error = null;
    notifyListeners();
  }

  void markEventConnected(EventModel event) async {
    _currentEvent = event;
    _isEventConnected = true;
    await StorageService.saveEventConnection(event.id);
    notifyListeners();
  }

  void clearCurrentEvent() async {
    _currentEvent = null;
    _isEventConnected = false;
    await StorageService.clearEventConnection();
    notifyListeners();
  }

  Future<bool> connectToEvent(String eventId, String accessCode) async {
    _isLoading = true;
    _error = null;

    try {
      final response = await ApiService.verifyEventAccess(eventId, accessCode);
      if (response['valid']) {
        _isEventConnected = true;
        await StorageService.saveEventConnection(eventId);
        return true;
      } else {
        _error = 'Code d\'accès invalide';
        return false;
      }
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _token = null;
    _userId = null;
    _user = null;
    _currentEvent = null;
    _isEventConnected = false;
    ApiService.setAuthToken(null);
    await StorageService.logout();
    await StorageService.clearEventConnection();
    notifyListeners();
  }
}
