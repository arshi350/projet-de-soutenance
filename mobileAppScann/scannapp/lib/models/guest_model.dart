// lib/models/guest_model.dart

class GuestModel {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String? phone;

  String status; // 'present', 'absent', 'pending'
  String? scanTime;

  final bool isVip;
  final String? qrCode;
  final String? idEvent;

  GuestModel({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.phone,
    required this.status,
    this.scanTime,
    this.isVip = false,
    this.qrCode,
    this.idEvent,
  });

  // Alias pour compatibilité FR
  String get nom => lastName.isNotEmpty ? lastName : firstName;

  String get prenom => firstName;

  String? get telephone => phone;

  bool get isScanned => status == 'present' || scanTime != null;

  bool get isPresent => status == 'present';

  String get fullName => '$firstName $lastName'.trim();

  String get initials {
    final f = firstName.isNotEmpty ? firstName[0] : '';
    final l = lastName.isNotEmpty ? lastName[0] : '';

    final combined = '$f$l';

    return combined.isNotEmpty ? combined.toUpperCase() : '?';
  }

  static String? _formatScanTime(dynamic rawTime) {
    if (rawTime == null) return null;
    final str = rawTime.toString();
    if (str.isEmpty) return null;
    if (str.length <= 5 && str.contains(':')) return str;
    try {
      final dt = DateTime.parse(str).toLocal();
      return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return str;
    }
  }

  factory GuestModel.fromJson(Map<String, dynamic> json) {
    final bool isPresentOrScanned = json['isPresent'] == true ||
        json['isScanned'] == true ||
        json['status'] == 'present';

    final String resolvedStatus = isPresentOrScanned ? 'present' : 'pending';

    final dynamic rawScanTime = json['scanTime'] ??
        json['scannedAt'] ??
        (isPresentOrScanned ? json['updatedAt'] : null);

    final bool isVipGuest = json['isVip'] == true ||
        json['vip'] == true ||
        (json['status']?.toString().toLowerCase() == 'vip') ||
        (json['guestCategory']?.toString().toLowerCase() == 'vip');

    return GuestModel(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      firstName: json['firstName'] ?? json['prenom'] ?? json['nom'] ?? '',
      lastName: json['lastName'] ?? (json['prenom'] != null ? json['nom'] ?? '' : ''),
      email: json['email'] ?? json['inviteeEmail'] ?? '',
      phone: json['phone'] ?? json['telephone'] ?? json['invitePhone'],
      status: resolvedStatus,
      scanTime: _formatScanTime(rawScanTime),
      isVip: isVipGuest,
      qrCode: json['qrCode'],
      idEvent: (json['idEvent'] ?? json['eventId'])?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'phone': phone,
      'status': status,
      'scanTime': scanTime,
      'isVip': isVip,
      'qrCode': qrCode,
      'idEvent': idEvent,
    };
  }

  GuestModel copyWith({
    String? id,
    String? firstName,
    String? lastName,
    String? email,
    String? phone,
    String? status,
    String? scanTime,
    bool? isVip,
    String? qrCode,
    String? idEvent,
  }) {
    return GuestModel(
      id: id ?? this.id,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      status: status ?? this.status,
      scanTime: scanTime ?? this.scanTime,
      isVip: isVip ?? this.isVip,
      qrCode: qrCode ?? this.qrCode,
      idEvent: idEvent ?? this.idEvent,
    );
  }
}