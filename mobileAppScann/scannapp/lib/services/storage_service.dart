// lib/services/storage_service.dart
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/event_model.dart';
import '../models/guest_model.dart';

class StorageService {
  static const String _tokenKey = 'auth_token';
  static const String _userIdKey = 'user_id';
  static const String _eventsCacheKey = 'events_cache';
  static const String _guestsCachePrefix = 'guests_';

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  static Future<void> saveUserId(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userIdKey, userId);
  }

  static Future<String?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_userIdKey);
  }

  static const String _userKey = 'user_data';

  static Future<void> saveUser(Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, jsonEncode(user));
  }

  static Future<Map<String, dynamic>?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final String? userJson = prefs.getString(_userKey);
    if (userJson != null) {
      return jsonDecode(userJson) as Map<String, dynamic>;
    }
    return null;
  }

  // ✅ Version corrigée sans toJson
  static Future<void> cacheEvents(List<EventModel> events) async {
    final prefs = await SharedPreferences.getInstance();
    final eventsJson = events.map((e) => {
      'id': e.id,
      'name': e.name,
      'date': e.date,
      'time': e.time,
      'location': e.location,
      'totalGuests': e.totalGuests,
      'scannedGuests': e.scannedGuests,
      'accessCode': e.accessCode,
      'status': e.status,
    }).toList();
    await prefs.setString(_eventsCacheKey, jsonEncode(eventsJson));
  }

  static Future<List<EventModel>?> getCachedEvents() async {
    final prefs = await SharedPreferences.getInstance();
    final String? eventsJson = prefs.getString(_eventsCacheKey);
    if (eventsJson != null) {
      final List data = jsonDecode(eventsJson);
      return data.map((json) => EventModel.fromJson(json)).toList();
    }
    return null;
  }

  // ✅ Version corrigée sans toJson
  static Future<void> cacheGuests(String eventId, List<GuestModel> guests) async {
    final prefs = await SharedPreferences.getInstance();
    final guestsJson = guests.map((g) => {
      'id': g.id,
      'firstName': g.firstName,
      'lastName': g.lastName,
      'email': g.email,
      'phone': g.phone,
      'status': g.status,
      'scanTime': g.scanTime,
      'isVip': g.isVip,
      'qrCode': g.qrCode,
    }).toList();
    await prefs.setString('$_guestsCachePrefix$eventId', jsonEncode(guestsJson));
  }

  static Future<List<GuestModel>?> getCachedGuests(String eventId) async {
    final prefs = await SharedPreferences.getInstance();
    final String? guestsJson = prefs.getString('$_guestsCachePrefix$eventId');
    if (guestsJson != null) {
      final List data = jsonDecode(guestsJson);
      return data.map((json) => GuestModel.fromJson(json)).toList();
    }
    return null;
  }

  static Future<void> clearCache() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  static const String _eventConnectedKey = 'is_event_connected';
  static const String _connectedEventIdKey = 'connected_event_id';

  static Future<void> saveEventConnection(String eventId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_eventConnectedKey, true);
    await prefs.setString(_connectedEventIdKey, eventId);
  }

  static Future<bool> isEventConnected() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_eventConnectedKey) ?? false;
  }

  static Future<String?> getConnectedEventId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_connectedEventIdKey);
  }

  static Future<void> clearEventConnection() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_eventConnectedKey);
    await prefs.remove(_connectedEventIdKey);
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userIdKey);
    await clearEventConnection();
  }
}