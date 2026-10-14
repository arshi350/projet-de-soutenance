// lib/pages/guests_list_page.dart
import 'package:flutter/material.dart';
import '../providers/guest_provider.dart';
import '../models/guest_model.dart';
import '../models/event_model.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/bottom_nav_bar.dart' show BottomNavBar, NavItem;
import '../widgets/guest_card.dart';
import '../theme/app_colors.dart';
import 'package:provider/provider.dart';

class GuestsListPage extends StatefulWidget {
  final EventModel event;

  const GuestsListPage({super.key, required this.event});

  @override
  State<GuestsListPage> createState() => _GuestsListPageState();
}

class _GuestsListPageState extends State<GuestsListPage> {
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

    return Scaffold(
      backgroundColor: isDark ? AppColors.background : const Color(0xFFF4F6F9),
      appBar: const CustomAppBar(
        title: 'Invités scannés',
        showBackButton: true,
      ),
      body: Column(
        children: [
          // En-tête événement
          Container(
            padding: const EdgeInsets.all(16),
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
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: textColor,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _buildStatCard('TOTAL', '$totalGuests', statCardBg, subtextColor, textColor, borderColor),
                    const SizedBox(width: 12),
                    _buildStatCard('PRÉSENTS', '$scannedGuests', statCardBg, subtextColor, AppColors.green, borderColor),
                    const SizedBox(width: 12),
                    _buildStatCard(
                        'TAUX', '${(attendanceRate * 100).toInt()}%', statCardBg, subtextColor, AppColors.orange, borderColor),
                  ],
                ),
              ],
            ),
          ),

          // Barre de recherche
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              style: TextStyle(color: textColor),
              decoration: InputDecoration(
                hintText: 'Rechercher un invité...',
                hintStyle: TextStyle(color: subtextColor),
                prefixIcon: const Icon(Icons.search, color: AppColors.orange),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(30),
                  borderSide: BorderSide(color: borderColor),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(30),
                  borderSide: BorderSide(color: borderColor),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(30),
                  borderSide: const BorderSide(color: AppColors.orange, width: 2),
                ),
                filled: true,
                fillColor: isDark ? AppColors.greyBackground : Colors.white,
              ),
              onChanged: (value) => setState(() => _searchQuery = value),
            ),
          ),

          // Liste des invités
          if (guestProvider.isLoading)
            const Expanded(child: Center(child: CircularProgressIndicator(color: AppColors.orange))),
          if (guestProvider.error != null)
            Expanded(
              child: Center(
                child: Text(
                  'Erreur: ${guestProvider.error}',
                  style: const TextStyle(color: AppColors.red),
                ),
              ),
            ),
          if (!guestProvider.isLoading && guestProvider.guests != null)
            Expanded(
              child: ListView.builder(
                itemCount: _filteredGuests.length,
                itemBuilder: (context, index) {
                  final guest = _filteredGuests[index];
                  return GuestCard(guest: guest);
                },
              ),
            ),
        ],
      ),
      bottomNavigationBar: BottomNavBar(
        currentItem: NavItem.guests,
        onItemSelected: (item) {
          if (item == NavItem.home) Navigator.pop(context);
        },
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color bgColor, Color labelColor, Color valueColor, Color borderCol) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: borderCol),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: TextStyle(fontSize: 11, color: labelColor),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: valueColor),
            ),
          ],
        ),
      ),
    );
  }
}
