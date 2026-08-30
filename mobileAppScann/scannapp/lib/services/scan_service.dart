// lib/services/scan_service.dart
import '../models/guest_model.dart';
import '../models/scan_result_model.dart';
import 'api_service.dart';

export '../models/scan_result_model.dart';

class ScanService {
  static Future<ScanResult> verifyQRCode(String qrData, String eventId) async {
    try {
      final response = await ApiService.verifyQRCode(qrData, eventId);

      final isSuccess = response['success'] == true;
      final isAlreadyScanned = response['alreadyScanned'] == true;
      final isPublic = response['isPublicTicket'] == true;
      final scannedAtStr = response['scannedAt']?.toString() ?? 
          (response['ticket']?['scannedAt']?.toString());

      GuestModel? guest;
      if (response['guest'] != null) {
        guest = GuestModel.fromJson(response['guest']);
      } else if (response['ticket'] != null) {
        final tkt = response['ticket'];
        final buyerName = tkt['buyerName']?.toString() ?? 'Acheteur';
        final nameParts = buyerName.trim().split(' ');
        final firstName = nameParts.isNotEmpty ? nameParts.first : buyerName;
        final lastName = nameParts.length > 1 ? nameParts.sublist(1).join(' ') : '';

        guest = GuestModel(
          id: tkt['_id']?.toString() ?? '',
          firstName: firstName,
          lastName: lastName,
          email: tkt['buyerEmail']?.toString() ?? '',
          phone: tkt['buyerPhone']?.toString(),
          status: 'present',
          scanTime: scannedAtStr,
          isVip: tkt['categoryName']?.toString().toLowerCase().contains('vip') ?? false,
          idEvent: eventId, nom: '', prenom: '', telephone: '', isScanned: false, isPresent: false,
        );
      }

      return ScanResult(
        success: isSuccess,
        alreadyScanned: isAlreadyScanned,
        isPublicTicket: isPublic,
        scannedAt: scannedAtStr,
        guest: guest,
        error: response['message']?.toString(),
        accessDenied: response['accessDenied'] == true,
      );
    } catch (e) {
      return ScanResult(
        success: false,
        alreadyScanned: false,
        isPublicTicket: false,
        guest: null,
        error: e.toString(),
      );
    }
  }
}
