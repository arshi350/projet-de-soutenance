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
  });

  String get fullName => '$firstName $lastName';
  String get initials => '${firstName[0]}${lastName[0]}'.toUpperCase();

  factory GuestModel.fromJson(Map<String, dynamic> json) {
    return GuestModel(
      id: json['id'] ?? json['_id'] ?? '',
      firstName: json['firstName'] ?? json['prenom'] ?? '',
      lastName: json['lastName'] ?? json['nom'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? json['telephone'],
      status: json['status'] ?? 'pending',
      scanTime: json['scanTime'],
      isVip: json['isVip'] ?? json['vip'] ?? false,
      qrCode: json['qrCode'],
    );
  }

  // ✅ AJOUT DE LA MÉTHODE toJson
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
    };
  }

  // ✅ Copie avec modifications
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
    );
  }
}