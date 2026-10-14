import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../models/event_model.dart';
import '../models/guest_model.dart';
import '../providers/settings_provider.dart';
import '../theme/app_colors.dart';
import '../widgets/bottom_nav_bar.dart';
import 'scan_page.dart';

class ScanSuccessPage extends StatefulWidget {
  final EventModel event;
  final GuestModel guest;

  const ScanSuccessPage({super.key, required this.event, required this.guest});

  @override
  State<ScanSuccessPage> createState() => _ScanSuccessPageState();
}

class _ScanSuccessPageState extends State<ScanSuccessPage> {
  Timer? _timer;
  int _countdown = 3;
  bool _autoReturn = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _autoReturn = context.read<SettingsProvider>().autoReturnEnabled;
      if (_autoReturn) {
        _startAutoReturn();
      } else {
        setState(() {});
      }
    });
  }

  void _startAutoReturn() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      setState(() {
        if (_countdown > 1) {
          _countdown--;
        } else {
          _timer?.cancel();
          _goToNext();
        }
      });
    });
  }

  void _goToNext() {
    _timer?.cancel();
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) => ScanPage(event: widget.event)),
      (route) => route.isFirst,
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.cardBackground : Colors.white;
    final textColor = isDark ? AppColors.white : AppColors.blue;
    final borderColor = isDark ? AppColors.white.withValues(alpha: 0.1) : const Color(0xFFE2E8F0);
    final dividerColor = isDark ? AppColors.white.withValues(alpha: 0.08) : const Color(0xFFE2E8F0);

    return Scaffold(
      backgroundColor: isDark ? AppColors.background : const Color(0xFFF4F6F9),
      body: SafeArea(
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Circle validation glow émeraude
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  color: AppColors.green,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.green.withValues(alpha: 0.4),
                      blurRadius: 35,
                      spreadRadius: 10,
                    ),
                  ],
                ),
                child: const Icon(Icons.check_rounded, color: Colors.white, size: 48),
              ),
              const SizedBox(height: 28),
              Text(
                'ENTRÉE VALIDÉE !',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: AppColors.green,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                widget.guest.fullName,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: textColor,
                ),
              ),
              const SizedBox(height: 28),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: borderColor,
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: isDark ? Colors.black.withValues(alpha: 0.3) : Colors.black.withValues(alpha: 0.06),
                      blurRadius: 20,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    _buildInfoRow('Statut Entrée', 'Présent', AppColors.green),
                    const SizedBox(height: 14),
                    Container(height: 1, color: dividerColor),
                    const SizedBox(height: 14),
                    _buildInfoRow('Événement', widget.event.name, textColor),
                    const SizedBox(height: 14),
                    Container(height: 1, color: dividerColor),
                    const SizedBox(height: 14),
                    _buildInfoRow(
                      'Catégorie',
                      widget.guest.isVip ? 'VIP Exclusif' : 'Standard',
                      widget.guest.isVip ? AppColors.gold : (isDark ? AppColors.grey : const Color(0xFF64748B)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  onPressed: _goToNext,
                  icon: const Icon(Icons.arrow_forward_rounded, size: 20),
                  label: Text(
                    'PASSER AU SUIVANT',
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
              const SizedBox(height: 20),
              if (_autoReturn) ...[
                Text(
                  'Retour automatique dans $_countdown s',
                  style: GoogleFonts.plusJakartaSans(fontSize: 12, color: AppColors.grey),
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildTimerDot(_countdown <= 3),
                    const SizedBox(width: 6),
                    _buildTimerDot(_countdown <= 2),
                    const SizedBox(width: 6),
                    _buildTimerDot(_countdown <= 1),
                  ],
                ),
              ] else ...[
                Text(
                  'Appuyez sur le bouton pour scanner le billet suivant',
                  style: GoogleFonts.plusJakartaSans(fontSize: 12, color: AppColors.grey),
                ),
              ],
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

  Widget _buildTimerDot(bool isActive) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      width: isActive ? 10 : 8,
      height: isActive ? 10 : 8,
      decoration: BoxDecoration(
        color: isActive ? AppColors.green : AppColors.greyLight.withValues(alpha: 0.3),
        shape: BoxShape.circle,
        boxShadow: isActive
            ? [
                BoxShadow(
                  color: AppColors.green.withValues(alpha: 0.5),
                  blurRadius: 6,
                ),
              ]
            : [],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, Color valueColor) {
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
            color: valueColor,
          ),
        ),
      ],
    );
  }
}

