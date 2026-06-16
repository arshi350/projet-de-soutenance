// lib/services/scan_service.dart
import '../models/guest_model.dart';
import 'api_service.dart';

class ScanService {
  static Future<ScanResult> verifyQRCode(String qrData, String eventId) async {
    try {
      final response = await ApiService.verifyQRCode(qrData, eventId);

      if (response['success']) {
        return ScanResult(
          success: true,
          alreadyScanned: response['alreadyScanned'] ?? false,
          guest: response['guest'] != null
              ? GuestModel.fromJson(response['guest'])
              : null,
        );
      } else {
        return ScanResult(
          success: false,
          alreadyScanned: false,
          guest: null,
          error: response['message'],
        );
      }
    } catch (e) {
      return ScanResult(
        success: false,
        alreadyScanned: false,
        guest: null,
        error: e.toString(),
      );
    }
  }
}

class ScanResult {
  final bool success;
  final bool alreadyScanned;
  final GuestModel? guest;
  final String? error;

  ScanResult({
    required this.success,
    required this.alreadyScanned,
    this.guest,
    this.error,
  });
}
