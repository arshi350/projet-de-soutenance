// lib/providers/guest_provider.dart
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/guest_model.dart';

class GuestProvider extends ChangeNotifier {
  List<GuestModel>? _guests;
  bool _isLoading = false;
  String? _error;

  List<GuestModel>? get guests => _guests;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  int get scannedGuests => _guests?.where((g) => g.status == 'present').length ?? 0;

  Future<void> fetchGuests(String eventId) async {
    _isLoading = true;
    _error = null;

    try {
      _guests = await ApiService.getGuests(eventId);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void updateGuestStatus(String guestId, String newStatus, String scanTime) {
    if (_guests != null) {
      final index = _guests!.indexWhere((g) => g.id == guestId);
      if (index != -1) {
        _guests![index].status = newStatus;
        _guests![index].scanTime = scanTime;
        notifyListeners();
      }
    }
  }
}