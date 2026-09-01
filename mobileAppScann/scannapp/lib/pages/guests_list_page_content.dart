// lib/pages/guests_list_page_content.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/guest_provider.dart';
import '../models/guest_model.dart';
import '../models/event_model.dart';
import '../widgets/guest_card.dart';
import '../theme/app_colors.dart';
import 'package:provider/provider.dart';

class GuestsListPageContent extends StatefulWidget {
  final EventModel event;

  const GuestsListPageContent({super.key, required this.event});

  @override
  State<GuestsListPageContent> createState() => _GuestsListPageContentState();
}

class _GuestsListPageContentState extends State<GuestsListPageContent> {
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadGuests();
  }

  Future<void> _loadGuests() async {
    final guestProvider = Provider.of<GuestProvider>(context, listen: false);
    await guestProvider.fetchGuests(widget.event.id);
  }

  List<GuestModel> get _filteredGuests {
    final guests = Provider.of<GuestProvider>(context).guests ?? [];
    if (_searchQuery.isEmpty) return guests;
    return guests
        .where((g) =>
            g.fullName.toLowerCase().contains(_searchQuery.toLowerCase()) ||
            g.email.toLowerCase().contains(_searchQuery.toLowerCase()))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final guestProvider = Provider.of<GuestProvider>(context);
    final scannedGuests = guestProvider.scannedGuests;
    final totalGuests = widget.event.totalGuests;
    final attendanceRate = totalGuests > 0 ? scannedGuests / totalGuests : 0;

    return Column(
      children: [
        // En-tête événement & Statistiques principales
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.cardBackground,
            border: Border(
              bottom: BorderSide(
                color: AppColors.white.withValues(alpha: 0.08),
                width: 1,
              ),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.event.name,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.white,
                ),
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  _buildStatCard('TOTAL INVITÉS', '$totalGuests', AppColors.white),
                  const SizedBox(width: 10),
                  _buildStatCard('PRÉSENTS', '$scannedGuests', AppColors.green),
                  const SizedBox(width: 10),
                  _buildStatCard('TAUX DE SCAN', '${(attendanceRate * 100).toInt()}%', AppColors.orange),
                ],
              ),
            ],
          ),
        ),

        // Barre de recherche stylisée
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: TextField(
            style: GoogleFonts.plusJakartaSans(color: AppColors.white),
            decoration: InputDecoration(
              hintText: 'Rechercher un invité par nom ou email...',
              hintStyle: GoogleFonts.plusJakartaSans(
                color: AppColors.grey,
                fontSize: 14,
              ),
              prefixIcon: const Icon(Icons.search_rounded, color: AppColors.orange),
              contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            ),
            onChanged: (value) => setState(() => _searchQuery = value),
          ),
        ),

        // Liste des invités
        if (guestProvider.isLoading)
          const Expanded(
            child: Center(
              child: CircularProgressIndicator(color: AppColors.orange),
            ),
          ),
        if (guestProvider.error != null)
          Expanded(
            child: Center(
              child: Text(
                'Erreur: ${guestProvider.error}',
                style: GoogleFonts.plusJakartaSans(color: AppColors.red),
              ),
            ),
          ),
        if (!guestProvider.isLoading && guestProvider.guests != null)
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.only(top: 8, bottom: 24),
              itemCount: _filteredGuests.length,
              itemBuilder: (context, index) {
                final guest = _filteredGuests[index];
                return GuestCard(guest: guest);
              },
            ),
          ),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, Color valueColor) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color: AppColors.blueLight.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: AppColors.white.withValues(alpha: 0.08),
          ),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: AppColors.grey,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: valueColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

