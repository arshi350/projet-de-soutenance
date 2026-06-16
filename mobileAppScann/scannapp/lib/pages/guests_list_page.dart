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
    final scannedGuests = guestProvider.scannedGuests;
    final totalGuests = widget.event.totalGuests;
    final attendanceRate = totalGuests > 0 ? scannedGuests / totalGuests : 0;

    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Invités scannés',
        showBackButton: true,
      ),
      body: Column(
        children: [
          // En-tête événement
          Container(
            padding: const EdgeInsets.all(16),
            color: AppColors.white,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.event.name,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _buildStatCard('TOTAL', '$totalGuests'),
                    const SizedBox(width: 12),
                    _buildStatCard('PRÉSENTS', '$scannedGuests'),
                    const SizedBox(width: 12),
                    _buildStatCard(
                        'TAUX', '${(attendanceRate * 100).toInt()}%'),
                  ],
                ),
              ],
            ),
          ),

          // Barre de recherche
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Rechercher un invité...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(30),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: AppColors.greyBackground,
              ),
              onChanged: (value) => setState(() => _searchQuery = value),
            ),
          ),

          // Liste des invités
          if (guestProvider.isLoading)
            const Expanded(child: Center(child: CircularProgressIndicator())),
          if (guestProvider.error != null)
            Expanded(
              child: Center(child: Text('Erreur: ${guestProvider.error}')),
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

  Widget _buildStatCard(String label, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.greyBackground,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: const TextStyle(fontSize: 11, color: AppColors.grey),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}
