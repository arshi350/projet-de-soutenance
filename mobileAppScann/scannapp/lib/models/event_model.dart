// lib/models/event_model.dart
class EventModel {
  final String id;
  final String name;
  final String date; // Stored as ISO 8601 or "jj/mm/aa"
  final String time;
  final String location;
  int totalGuests;
  int scannedGuests;
  final String accessCode;
  final String status; // 'active', 'upcoming', 'ended'
  final String category;

  EventModel({
    required this.id,
    required this.name,
    required this.date,
    required this.time,
    required this.location,
    required this.totalGuests,
    required this.scannedGuests,
    required this.accessCode,
    required this.status,
    this.category = 'Événement',
  });

  double get attendanceRate =>
      totalGuests > 0 ? scannedGuests / totalGuests : 0;

  /// Format date to "jj/mm/aa" format
  String get formattedDate {
    try {
      if (date.contains('-')) {
        // ISO 8601 format: "2026-05-16T00:00:00.000Z"
        final DateTime dt = DateTime.parse(date);
        return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year.toString().substring(2)}';
      } else if (date.contains('/')) {
        // Already formatted
        return date;
      }
      return date;
    } catch (e) {
      return date;
    }
  }

  factory EventModel.fromJson(Map<String, dynamic> json) {
    // Extract date, handle both ISO 8601 and plain date formats
    String parsedDate =
        json['date'] ?? json['DateDebut'] ?? json['dateDebut'] ?? '';

    // Extract time, handle both formats
    String parsedTime =
        json['time'] ?? json['heure'] ?? json['heureDebut'] ?? '';

    return EventModel(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? json['titre'] ?? json['nom'] ?? '',
      date: parsedDate,
      time: parsedTime,
      location: json['location'] ?? json['lieu'] ?? '',
      totalGuests: json['totalGuests'] ?? json['totalInvites'] ?? 0,
      scannedGuests: json['scannedGuests'] ?? json['scanned'] ?? 0,
      accessCode: json['accessCode'] ?? json['EventCode'] ?? '',
      status: json['status'] ?? 'active',
      category: json['category'] ?? json['categorie'] ?? 'Événement',
    );
  }

  // ✅ AJOUT DE LA MÉTHODE toJson
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'date': date,
      'time': time,
      'location': location,
      'totalGuests': totalGuests,
      'scannedGuests': scannedGuests,
      'accessCode': accessCode,
      'status': status,
      'category': category,
    };
  }

  // ✅ Copie avec modifications
  EventModel copyWith({
    String? id,
    String? name,
    String? date,
    String? time,
    String? location,
    int? totalGuests,
    int? scannedGuests,
    String? accessCode,
    String? status,
  }) {
    return EventModel(
      id: id ?? this.id,
      name: name ?? this.name,
      date: date ?? this.date,
      time: time ?? this.time,
      location: location ?? this.location,
      totalGuests: totalGuests ?? this.totalGuests,
      scannedGuests: scannedGuests ?? this.scannedGuests,
      accessCode: accessCode ?? this.accessCode,
      status: status ?? this.status,
    );
  }
}
