// lib/providers/scan_provider.dart
import 'package:flutter/material.dart';

class ScanProvider extends ChangeNotifier {
  int _totalScans = 0;
  int _successfulScans = 0;
  final List<Map<String, dynamic>> _scanHistory = [];

  int get totalScans => _totalScans;
  int get successfulScans => _successfulScans;
  List<Map<String, dynamic>> get scanHistory => _scanHistory;

  void addScanResult({
    required bool success,
    required String guestName,
    required String guestId,
  }) {
    _totalScans++;
    if (success) _successfulScans++;
    
    _scanHistory.insert(0, {
      'time': DateTime.now(),
      'guestName': guestName,
      'guestId': guestId,
      'success': success,
    });
    
    if (_scanHistory.length > 50) _scanHistory.removeLast();
    notifyListeners();
  }

  void clearHistory() {
    _totalScans = 0;
    _successfulScans = 0;
    _scanHistory.clear();
    notifyListeners();
  }
}