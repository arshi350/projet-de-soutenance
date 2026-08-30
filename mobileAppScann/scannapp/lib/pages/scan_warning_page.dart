// lib/pages/scan_warning_page.dart
import 'package:flutter/material.dart';
import '../models/event_model.dart';
import '../models/guest_model.dart';
import '../theme/app_colors.dart';
import '../widgets/bottom_nav_bar.dart';
import 'scan_page.dart';

class ScanWarningPage extends StatelessWidget {
  final EventModel event;
  final GuestModel guest;
  final String? scannedAt;
  final String? errorMessage;

  const ScanWarningPage({
    super.key, 
    required this.event, 
    required this.guest,
    this.scannedAt,
    this.errorMessage,
  });

  @override
  Widget build(BuildContext context) {
    final displayTime = scannedAt != null && scannedAt!.isNotEmpty 
        ? scannedAt! 
        : 'Précédemment enregistré';

    return Scaffold(
      body: Container(
        width: double.infinity,
        color: AppColors.warning.withOpacity(0.05),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 84,
              height: 84,
              decoration: BoxDecoration(
                color: AppColors.warning,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.warning.withOpacity(0.35),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 48),
            ),
            const SizedBox(height: 24),
            const Text(
              'BILLET DÉJÀ SCANNÉ',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.1,
                color: AppColors.warning,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              guest.fullName.isNotEmpty ? guest.fullName : 'Billet Officiel',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 24),
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 24),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.black.withOpacity(0.06),
                    blurRadius: 15,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  _buildInfoRow('Horodatage 1er Scan', displayTime),
                  const Divider(height: 24, color: AppColors.greyLight),
                  _buildInfoRow('Catégorie', guest.status.toUpperCase()),
                  const Divider(height: 24, color: AppColors.greyLight),
                  _buildInfoRow('Statut Entrée', 'Accès Déjà Validé'),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                errorMessage ?? 'Ce QR Code a déjà été validé à l\'entrée. Le porteur ne peut pas entrer une seconde fois avec le même billet.',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: AppColors.grey, height: 1.4),
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => ScanPage(event: event)),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.orange,
                foregroundColor: AppColors.white,
                padding: const EdgeInsets.symmetric(horizontal: 36, vertical: 16),
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30),
                ),
              ),
              child: const Text(
                'PASSER AU SCAN SUIVANT',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 0.8),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavBar(
        currentItem: NavItem.scanner,
        onItemSelected: (item) {
          if (item == NavItem.home) Navigator.pop(context);
        },
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: AppColors.grey)),
        Text(
          value,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.black),
        ),
      ],
    );
  }
}