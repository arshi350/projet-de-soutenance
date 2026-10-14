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
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _loadGuests();
      }
    });
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
    final allGuests = guestProvider.guests ?? [];
    final scannedGuests = guestProvider.scannedGuests;
    final totalGuests = widget.event.totalGuests > 0 ? widget.event.totalGuests : allGuests.length;
    final attendanceRate = totalGuests > 0 ? scannedGuests / totalGuests : 0;

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final headerBg = isDark ? AppColors.cardBackground : Colors.white;
    final textColor = isDark ? AppColors.white : AppColors.blue;
    final subtextColor = isDark ? AppColors.grey : const Color(0xFF64748B);
    final statCardBg = isDark ? AppColors.blueLight.withValues(alpha: 0.5) : const Color(0xFFF8FAFC);
    final borderColor = isDark ? AppColors.white.withValues(alpha: 0.08) : const Color(0xFFE2E8F0);

    return Column(
      children: [
        // En-tête événement & Statistiques principales
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: headerBg,
            border: Border(
              bottom: BorderSide(
                color: borderColor,
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
                  color: textColor,
                ),
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  _buildStatCard('TOTAL INVITÉS', '$totalGuests', textColor, statCardBg, borderColor, subtextColor),
                  const SizedBox(width: 10),
                  _buildStatCard('PRÉSENTS', '$scannedGuests', AppColors.green, statCardBg, borderColor, subtextColor),
                  const SizedBox(width: 10),
                  _buildStatCard('TAUX DE SCAN', '${(attendanceRate * 100).toInt()}%', AppColors.orange, statCardBg, borderColor, subtextColor),
                ],
              ),
            ],
          ),
        ),

        // Barre de recherche stylisée
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: TextField(
            style: GoogleFonts.plusJakartaSans(color: textColor),
            decoration: InputDecoration(
              hintText: 'Rechercher un invité par nom ou email...',
              hintStyle: GoogleFonts.plusJakartaSans(
                color: subtextColor,
                fontSize: 14,
              ),
              prefixIcon: const Icon(Icons.search_rounded, color: AppColors.orange),
              filled: true,
              fillColor: isDark ? AppColors.greyBackground : Colors.white,
              contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: isDark ? AppColors.greyLight : const Color(0xFFCBD5E1)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: isDark ? AppColors.greyLight : const Color(0xFFCBD5E1)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: const BorderSide(color: AppColors.orange, width: 2),
              ),
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

  Widget _buildStatCard(
    String label, 
    String value, 
    Color valueColor, 
    Color cardBg, 
    Color borderCol, 
    Color labelCol,
  ) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: borderCol,
          ),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: labelCol,
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

