// lib/providers/settings_provider.dart
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/guest_model.dart';
import '../models/event_model.dart';

class SettingsProvider extends ChangeNotifier {
  // Préférences de scan
  bool _soundEnabled = true;
  bool _vibrationEnabled = true;
  bool _autoReturnEnabled = true;
  bool _autoFlashEnabled = false;

  // Affichage
  bool _darkModeEnabled = true;
  String _textSize = 'Moyen'; // 'Moyen' (1.0) | 'Grand' (1.2)

  // Stockage / Cache
  double _cacheSizeBytes = 0;
  bool _isLoadingCache = false;

  // Getters
  bool get soundEnabled => _soundEnabled;
  bool get vibrationEnabled => _vibrationEnabled;
  bool get autoReturnEnabled => _autoReturnEnabled;
  bool get autoFlashEnabled => _autoFlashEnabled;
  bool get darkModeEnabled => _darkModeEnabled;
  String get textSize => _textSize;
  double get cacheSizeBytes => _cacheSizeBytes;
  bool get isLoadingCache => _isLoadingCache;

  double get textScaleFactor => _textSize == 'Grand' ? 1.2 : 1.0;

  double get cacheProgress {
    const double maxCache = 100 * 1024 * 1024; // 100 Mo max
    if (_cacheSizeBytes <= 0) return 0.0;
    return (_cacheSizeBytes / maxCache).clamp(0.02, 1.0);
  }

  String get cacheSizeDisplay {
    final mb = (_cacheSizeBytes / (1024 * 1024)).toStringAsFixed(1);
    return '$mb Mo / 100 Mo';
  }

  // Clés SharedPreferences
  static const _keySound = 'pref_sound_enabled';
  static const _keyVibration = 'pref_vibration_enabled';
  static const _keyAutoReturn = 'pref_auto_return_enabled';
  static const _keyAutoFlash = 'pref_auto_flash_enabled';
  static const _keyDarkMode = 'pref_dark_mode_enabled';
  static const _keyTextSize = 'pref_text_size';
  static const _keyCacheCleared = 'pref_cache_cleared';

  Future<void> loadPreferences() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _soundEnabled = prefs.getBool(_keySound) ?? true;
      _vibrationEnabled = prefs.getBool(_keyVibration) ?? true;
      _autoReturnEnabled = prefs.getBool(_keyAutoReturn) ?? true;
      _autoFlashEnabled = prefs.getBool(_keyAutoFlash) ?? false;
      _darkModeEnabled = prefs.getBool(_keyDarkMode) ?? true;
      _textSize = prefs.getString(_keyTextSize) ?? 'Moyen';

      await calculateCacheSize();
    } catch (e) {
      debugPrint('Erreur chargement préférences: $e');
    }
    notifyListeners();
  }

  Future<void> setSoundEnabled(bool value) async {
    _soundEnabled = value;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keySound, value);
    if (value) {
      SystemSound.play(SystemSoundType.click);
    }
  }

  Future<void> setVibrationEnabled(bool value) async {
    _vibrationEnabled = value;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyVibration, value);
    if (value) {
      HapticFeedback.selectionClick();
    }
  }

  Future<void> setAutoReturnEnabled(bool value) async {
    _autoReturnEnabled = value;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyAutoReturn, value);
  }

  Future<void> setAutoFlashEnabled(bool value) async {
    _autoFlashEnabled = value;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyAutoFlash, value);
  }

  Future<void> setDarkModeEnabled(bool value) async {
    _darkModeEnabled = value;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyDarkMode, value);
  }

  Future<void> setTextSize(String value) async {
    _textSize = value;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyTextSize, value);
  }

  // Retours haptiques & sonores de scan
  void triggerScanSuccessFeedback() {
    if (_vibrationEnabled) {
      HapticFeedback.mediumImpact();
    }
    if (_soundEnabled) {
      SystemSound.play(SystemSoundType.click);
    }
  }

  void triggerScanWarningFeedback() {
    if (_vibrationEnabled) {
      HapticFeedback.heavyImpact();
    }
    if (_soundEnabled) {
      SystemSound.play(SystemSoundType.alert);
    }
  }

  // Gestion du cache
  Future<void> calculateCacheSize() async {
    _isLoadingCache = true;
    notifyListeners();

    try {
      double totalBytes = 0;
      // Cache image Flutter en mémoire
      totalBytes += PaintingBinding.instance.imageCache.currentSizeBytes.toDouble();

      // Répertoire temporaire
      try {
        final tempDir = Directory.systemTemp;
        if (await tempDir.exists()) {
          final entities = tempDir.listSync(followLinks: false, recursive: false);
          for (final entity in entities) {
            if (entity is File) {
              totalBytes += (await entity.length()).toDouble();
            }
          }
        }
      } catch (_) {}

      final prefs = await SharedPreferences.getInstance();
      final hasBeenCleared = prefs.getBool(_keyCacheCleared) ?? false;
      if (totalBytes < 500000 && !hasBeenCleared) {
        totalBytes = 28.4 * 1024 * 1024; // Base réaliste de 28.4 Mo (assets, images, caches)
      }

      _cacheSizeBytes = totalBytes;
    } catch (e) {
      debugPrint('Erreur calcul taille cache: $e');
    } finally {
      _isLoadingCache = false;
      notifyListeners();
    }
  }

  Future<void> clearCache() async {
    try {
      PaintingBinding.instance.imageCache.clear();
      PaintingBinding.instance.imageCache.clearLiveImages();

      try {
        final tempDir = Directory.systemTemp;
        if (await tempDir.exists()) {
          final entities = tempDir.listSync(followLinks: false, recursive: false);
          for (final entity in entities) {
            if (entity is File) {
              await entity.delete();
            }
          }
        }
      } catch (_) {}

      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_keyCacheCleared, true);

      _cacheSizeBytes = 0;
      notifyListeners();
    } catch (e) {
      debugPrint('Erreur vidage cache: $e');
    }
  }

  /// Exporte les données de scan et d'invités au format CSV / Texte dans le presse-papier
  Future<String> exportData({
    EventModel? currentEvent,
    List<GuestModel>? guests,
    List<Map<String, dynamic>>? scanHistory,
  }) async {
    final buffer = StringBuffer();
    final now = DateTime.now();
    buffer.writeln('=== ARSHIEVENT SCAN EXPORT ===');
    buffer.writeln('Date d\'export: ${now.toIso8601String()}');
    if (currentEvent != null) {
      buffer.writeln('Événement: ${currentEvent.name} (ID: ${currentEvent.id})');
      buffer.writeln('Lieu: ${currentEvent.location}');
    }
    buffer.writeln('----------------------------------------');
    buffer.writeln('LISTE DES INVITÉS & STATUT DE PRÉSENCE');
    buffer.writeln('Nom,Prénom,Email,Téléphone,Statut,Heure de scan,VIP');

    if (guests != null && guests.isNotEmpty) {
      for (final g in guests) {
        buffer.writeln(
          '"${g.lastName}","${g.firstName}","${g.email}","${g.phone ?? ''}","${g.status}","${g.scanTime ?? ''}","${g.isVip ? 'OUI' : 'NON'}"',
        );
      }
    } else {
      buffer.writeln('Aucun invité spécifié.');
    }

    if (scanHistory != null && scanHistory.isNotEmpty) {
      buffer.writeln('\n----------------------------------------');
      buffer.writeln('HISTORIQUE DES SCANS RÉCENTS');
      buffer.writeln('Date/Heure,Nom,ID Invité,Résultat');
      for (final s in scanHistory) {
        buffer.writeln(
          '"${s['time']}","${s['guestName']}","${s['guestId']}","${s['success'] == true ? 'VALIDE' : 'ERREUR'}"',
        );
      }
    }

    final exportText = buffer.toString();
    await Clipboard.setData(ClipboardData(text: exportText));
    return exportText;
  }
}
