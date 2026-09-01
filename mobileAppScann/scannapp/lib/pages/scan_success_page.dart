// lib/pages/scan_success_page.dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/event_model.dart';
import '../models/guest_model.dart';
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
  late Timer _timer;
  int _countdown = 3;

  @override
  void initState() {
    super.initState();
    _startAutoReturn();
  }

  void _startAutoReturn() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_countdown > 1) {
          _countdown--;
        } else {
          _timer.cancel();
          _goToNext();
        }
      });
    });
  }

  void _goToNext() {
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) => ScanPage(event: widget.event)),
      (route) => route.isFirst,
    );
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
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
                  color: AppColors.white,
                ),
              ),
              const SizedBox(height: 28),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.cardBackground,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: AppColors.white.withValues(alpha: 0.1),
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    _buildInfoRow('Statut Entrée', 'Présent', AppColors.green),
                    const SizedBox(height: 14),
                    Container(height: 1, color: AppColors.white.withValues(alpha: 0.08)),
                    const SizedBox(height: 14),
                    _buildInfoRow('Événement', widget.event.name, AppColors.white),
                    const SizedBox(height: 14),
                    Container(height: 1, color: AppColors.white.withValues(alpha: 0.08)),
                    const SizedBox(height: 14),
                    _buildInfoRow(
                      'Catégorie',
                      widget.guest.isVip ? 'VIP Exclusif' : 'Standard',
                      widget.guest.isVip ? AppColors.gold : AppColors.grey,
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

