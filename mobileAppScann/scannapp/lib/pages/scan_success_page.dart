// lib/pages/scan_success_page.dart
import 'dart:async';

import 'package:flutter/material.dart';
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
      body: Container(
        width: double.infinity,
        color: AppColors.green.withOpacity(0.05),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.green,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.green.withOpacity(0.3),
                    blurRadius: 20,
                  ),
                ],
              ),
              child: const Icon(Icons.check, color: Colors.white, size: 40),
            ),
            const SizedBox(height: 24),
            const Text(
              'ENTRÉE VALIDÉE !',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.green,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              widget.guest.fullName,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.black.withOpacity(0.05),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Column(
                children: [
                  _buildInfoRow('Statut', 'Présent', AppColors.green),
                  const SizedBox(height: 12),
                  _buildInfoRow('Heure', '19h42', AppColors.black),
                  const SizedBox(height: 12),
                  _buildInfoRow('Type d\'invité', 'VIP', AppColors.orange),
                ],
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _goToNext,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.orange,
                foregroundColor: AppColors.white,
                padding:
                    const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30),
                ),
              ),
              child: const Text('PASSER AU SUIVANT →'),
            ),
            const SizedBox(height: 16),
            Text(
              'Retour automatique dans $_countdown',
              style: TextStyle(fontSize: 12, color: AppColors.grey),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.circle,
                    size: 8,
                    color: _countdown <= 3
                        ? AppColors.orange
                        : AppColors.greyLight),
                const SizedBox(width: 4),
                Icon(Icons.circle,
                    size: 8,
                    color: _countdown <= 2
                        ? AppColors.orange
                        : AppColors.greyLight),
                const SizedBox(width: 4),
                Icon(Icons.circle,
                    size: 8,
                    color: _countdown <= 1
                        ? AppColors.orange
                        : AppColors.greyLight),
              ],
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

  Widget _buildInfoRow(String label, String value, Color valueColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
            style: const TextStyle(fontSize: 14, color: AppColors.grey)),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: valueColor,
          ),
        ),
      ],
    );
  }
}
