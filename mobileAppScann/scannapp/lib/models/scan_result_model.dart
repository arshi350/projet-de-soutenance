// lib/models/scan_result_model.dart
import 'guest_model.dart';

class ScanResult {
  final bool success;
  final bool alreadyScanned;
  final bool isPublicTicket;
  final String? scannedAt;
  final GuestModel? guest;
  final String? error;
  final bool accessDenied;

  ScanResult({
    required this.success,
    required this.alreadyScanned,
    this.isPublicTicket = false,
    this.scannedAt,
    this.guest,
    this.error,
    this.accessDenied = false,
  });
}
