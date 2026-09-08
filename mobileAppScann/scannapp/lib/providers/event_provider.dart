// lib/providers/event_provider.dart
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/event_model.dart';

class EventProvider extends ChangeNotifier {
  List<EventModel>? _events;
  bool _isLoading = false;
  String? _error;
  EventModel? _currentEvent;

  List<EventModel>? get events => _events;
  bool get isLoading => _isLoading;
  String? get error => _error;
  EventModel? get currentEvent => _currentEvent;

  /// Récupère tous les événements (publics)
  Future<void> fetchEvents() async {
    _isLoading = true;
    _error = null;

    try {
      _events = await ApiService.getEvents();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Récupère les événements de l'utilisateur connecté
  Future<void> fetchUserEvents(String userId) async {
    _isLoading = true;
    _error = null;

    try {
      _events = await ApiService.getEventsByUser(userId);
    } on AuthException catch (e) {
      _error = e.message;
      rethrow;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void setCurrentEvent(EventModel event) {
    _currentEvent = event;
    notifyListeners();
  }

  void updateScannedCount(String eventId, int newCount) {
    if (_events != null) {
      final index = _events!.indexWhere((e) => e.id == eventId);
      if (index != -1) {
        _events![index].scannedGuests = newCount;
        notifyListeners();
      }
    }
    if (_currentEvent?.id == eventId) {
      _currentEvent?.scannedGuests = newCount;
      notifyListeners();
    }
  }
}
