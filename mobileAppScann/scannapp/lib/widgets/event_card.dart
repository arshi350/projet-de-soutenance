// lib/widgets/event_card.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../models/event_model.dart';
import '../theme/app_colors.dart';
import '../providers/auth_provider.dart';

class EventCard extends StatelessWidget {
  final EventModel event;
  final VoidCallback onScanPressed;
  final VoidCallback onGuestsPressed;
  final VoidCallback onStatsPressed;

  const EventCard({
    super.key,
    required this.event,
    required this.onScanPressed,
    required this.onGuestsPressed,
    required this.onStatsPressed,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.cardBackground : Colors.white;
    final cardBorder = isDark
        ? AppColors.white.withValues(alpha: 0.1)
        : const Color(0xFFE2E8F0);
    final shadowColor = isDark
        ? Colors.black.withValues(alpha: 0.3)
        : Colors.black.withValues(alpha: 0.06);
    final titleColor = isDark ? AppColors.white : AppColors.blue;
    final subtextColor = isDark ? AppColors.grey : const Color(0xFF64748B);
    final dividerColor = isDark
        ? AppColors.white.withValues(alpha: 0.08)
        : const Color(0xFFE2E8F0);
    final outlineBtnColor = isDark ? AppColors.grey : AppColors.blue;
    final outlineBorderColor = isDark
        ? AppColors.white.withValues(alpha: 0.2)
        : const Color(0xFFCBD5E1);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: cardBorder,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: shadowColor,
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.orange.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: AppColors.orange.withValues(alpha: 0.3),
                  ),
                ),
                child: const Icon(
                  Icons.event_seat_rounded,
                  color: AppColors.orange,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      event.name,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: titleColor,
                        letterSpacing: 0.2,
                      ),
                    ),
                  ],
                ),
              ),
              // Badge statut "Connecté"
              Builder(builder: (context) {
                final auth = Provider.of<AuthProvider>(context);
                final bool isConnected = auth.currentEvent != null &&
                    auth.currentEvent!.id == event.id;

                if (isConnected) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: AppColors.green.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: AppColors.green.withValues(alpha: 0.4),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            color: AppColors.green,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.green,
                                blurRadius: 6,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Actif',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: AppColors.green,
                          ),
                        ),
                      ],
                    ),
                  );
                }
                return const SizedBox.shrink();
              }),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Icon(Icons.calendar_today_rounded, size: 14, color: subtextColor),
              const SizedBox(width: 6),
              Text(
                '${event.formattedDate}, ${event.time}',
                style: GoogleFonts.plusJakartaSans(fontSize: 13, color: subtextColor),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Icon(Icons.location_on_rounded, size: 14, color: subtextColor),
              const SizedBox(width: 6),
              Text(
                event.location,
                style: GoogleFonts.plusJakartaSans(fontSize: 13, color: subtextColor),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            height: 1,
            color: dividerColor,
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _buildStatItem(
                Icons.people_outline_rounded,
                '${event.totalGuests} invités',
                subtextColor,
              ),
              const SizedBox(width: 16),
              _buildStatItem(
                Icons.qr_code_scanner_rounded,
                '${event.scannedGuests} scannés',
                subtextColor,
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.green.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${(event.attendanceRate * 100).toInt()}%',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: AppColors.green,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: event.attendanceRate,
              backgroundColor: isDark
                  ? AppColors.greyLight.withValues(alpha: 0.3)
                  : const Color(0xFFE2E8F0),
              color: AppColors.orange,
              minHeight: 7,
            ),
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onGuestsPressed,
                  icon: const Icon(Icons.people_alt_outlined, size: 16),
                  label: const Text('Invités'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: outlineBtnColor,
                    side: BorderSide(color: outlineBorderColor),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onStatsPressed,
                  icon: const Icon(Icons.show_chart_rounded, size: 16),
                  label: const Text('Stats'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: outlineBtnColor,
                    side: BorderSide(color: outlineBorderColor),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: onScanPressed,
              icon: const Icon(Icons.qr_code_scanner_rounded, size: 18),
              label: const Text('Scannez les entrées →'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.orange,
                foregroundColor: AppColors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shadowColor: AppColors.orangeGlow,
                elevation: 4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(IconData icon, String text, Color color) {
    return Row(
      children: [
        Icon(icon, size: 14, color: color),
        const SizedBox(width: 6),
        Text(
          text,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 12,
            color: color,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

