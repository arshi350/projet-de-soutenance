// lib/pages/scan_warning_page.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
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
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 86,
                height: 86,
                decoration: BoxDecoration(
                  color: AppColors.warning,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.warning.withValues(alpha: 0.4),
                      blurRadius: 30,
                      spreadRadius: 8,
                    ),
                  ],
                ),
                child: const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 48),
              ),
              const SizedBox(height: 24),
              Text(
                'BILLET DÉJÀ SCANNÉ',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.2,
                  color: AppColors.warning,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                guest.fullName.isNotEmpty ? guest.fullName : 'Billet Officiel',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.white,
                ),
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.cardBackground,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: AppColors.white.withValues(alpha: 0.1),
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.3),
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
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  errorMessage ?? 'Ce QR Code a déjà été validé à l\'entrée. Le porteur ne peut pas entrer une seconde fois avec le même billet.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 13,
                    color: AppColors.grey,
                    height: 1.4,
                  ),
                ),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (context) => ScanPage(event: event)),
                    );
                  },
                  icon: const Icon(Icons.qr_code_scanner_rounded, size: 20),
                  label: Text(
                    'PASSER AU SCAN SUIVANT',
                    style: GoogleFonts.plusJakartaSans(
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.orange,
                    foregroundColor: AppColors.white,
                    shadowColor: AppColors.orangeGlow,
                    elevation: 4,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
              ),
            ],
          ),
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
        Text(
          label,
          style: GoogleFonts.plusJakartaSans(fontSize: 13, color: AppColors.grey),
        ),
        Text(
          value,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: AppColors.white,
          ),
        ),
      ],
    );
  }
}