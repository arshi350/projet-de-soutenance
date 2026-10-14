// lib/pages/scan_failure_page.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';
import '../widgets/bottom_nav_bar.dart';

import '../models/event_model.dart';
import 'scan_page.dart';

class ScanFailurePage extends StatelessWidget {
  final EventModel? event;

  const ScanFailurePage({super.key, this.event});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? AppColors.background : const Color(0xFFF4F6F9);
    final cardBg = isDark ? AppColors.cardBackground : Colors.white;
    final textColor = isDark ? AppColors.white : AppColors.blue;
    final subtextColor = isDark ? AppColors.grey : const Color(0xFF64748B);
    final borderColor = isDark ? AppColors.white.withValues(alpha: 0.1) : const Color(0xFFE2E8F0);

    return Scaffold(
      backgroundColor: bgColor,
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
                  color: AppColors.red,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.red.withValues(alpha: 0.4),
                      blurRadius: 30,
                      spreadRadius: 8,
                    ),
                  ],
                ),
                child: const Icon(Icons.close_rounded, color: Colors.white, size: 48),
              ),
              const SizedBox(height: 24),
              Text(
                'QR CODE INVALIDE',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.2,
                  color: AppColors.red,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Ce QR code n\'existe pas ou est incorrect.',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 14,
                  color: subtextColor,
                ),
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: borderColor,
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.05),
                      blurRadius: 15,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Points de vérification :',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: textColor,
                      ),
                    ),
                    const SizedBox(height: 14),
                    _buildBulletPoint('Le QR code provient de l\'invitation officielle ARSHI EVENT.', subtextColor),
                    const SizedBox(height: 10),
                    _buildBulletPoint('L\'invitation n\'a pas été annulée ou expirée.', subtextColor),
                    const SizedBox(height: 10),
                    _buildBulletPoint('L\'invité est inscrit sur cet événement spécifique.', subtextColor),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 50,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          if (event != null) {
                            Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(builder: (context) => ScanPage(event: event!)),
                            );
                          } else {
                            Navigator.pop(context);
                          }
                        },
                        icon: const Icon(Icons.refresh_rounded, size: 18),
                        label: Text(
                          'RÉESSAYER',
                          style: GoogleFonts.plusJakartaSans(
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.orange,
                          foregroundColor: AppColors.white,
                          shadowColor: AppColors.orangeGlow,
                          elevation: 4,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: SizedBox(
                      height: 50,
                      child: OutlinedButton(
                        onPressed: () {
                          if (event != null) {
                            Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(builder: (context) => ScanPage(event: event!)),
                            );
                          } else {
                            Navigator.pop(context);
                          }
                        },
                        style: OutlinedButton.styleFrom(
                          foregroundColor: subtextColor,
                          side: BorderSide(color: borderColor),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        child: Text(
                          'PASSER',
                          style: GoogleFonts.plusJakartaSans(
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
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

  Widget _buildBulletPoint(String text, Color textColor) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          margin: const EdgeInsets.only(top: 6),
          width: 6,
          height: 6,
          decoration: const BoxDecoration(
            color: AppColors.orange,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            text,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 13,
              color: textColor,
              height: 1.3,
            ),
          ),
        ),
      ],
    );
  }
}