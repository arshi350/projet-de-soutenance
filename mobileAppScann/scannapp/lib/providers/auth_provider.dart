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
  bool _isLoading = false;
  String? _error;

  String? get token => _token;
  String? get userId => _userId;
  Map<String, dynamic>? get user => _user;
  EventModel? get currentEvent => _currentEvent;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _token != null;
  bool get hasEventSelected => _currentEvent != null;

  /// Initialize auth from stored token on app startup
  Future<void> initializeAuth() async {
    _token = await StorageService.getToken();
    _userId = await StorageService.getUserId();
    if (_token != null) {
      ApiService.setAuthToken(_token);
    }
    notifyListeners();
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

      // Store token and userId
      _token = accessToken;
      _userId = userId;
      _user = userInfo;

      // Persist to local storage
      await StorageService.saveToken(accessToken);
      await StorageService.saveUserId(userId);

      // Set auth token in API service for future requests
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
    notifyListeners();

    try {
      final response = await ApiService.connectToEventByCode(eventCode);
      if (response['event'] != null) {
        // Créer un EventModel depuis la réponse
        final eventData = response['event'] as Map<String, dynamic>;
        _currentEvent = EventModel.fromJson(eventData);
        notifyListeners();
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
    // Sélectionner un nouvel événement (déconnecte de l'ancien)
    _currentEvent = event;
    _error = null;
    notifyListeners();
  }

  void clearCurrentEvent() {
    // Déconnecter de l'événement courant
    _currentEvent = null;
    notifyListeners();
  }

  Future<bool> connectToEvent(String eventId, String accessCode) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.verifyEventAccess(eventId, accessCode);
      if (response['valid']) {
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
    ApiService.setAuthToken(null);
    await StorageService.logout();
    notifyListeners();
  }
}
