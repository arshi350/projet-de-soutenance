// lib/pages/event_access_modal.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../models/event_model.dart';
import '../providers/auth_provider.dart';
import '../theme/app_colors.dart';

class EventAccessModal extends StatefulWidget {
  final EventModel event;

  const EventAccessModal({super.key, required this.event});

  @override
  State<EventAccessModal> createState() => _EventAccessModalState();
}

class _EventAccessModalState extends State<EventAccessModal> {
  final TextEditingController _codeController = TextEditingController();
  String _errorMessage = '';
  bool _isLoading = false;

  void _validateAndConnect() async {
    if (_codeController.text.isEmpty) {
      setState(() {
        _errorMessage = 'Veuillez entrer un code d\'accès';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final response = await authProvider.connectToEventByCode(
        widget.event.id,
        _codeController.text.toUpperCase(),
      );

      if (response) {
        if (!mounted) return;
        authProvider.markEventConnected(widget.event);
        Navigator.pop(context, true);
      } else {
        setState(() {
          _errorMessage = authProvider.error ?? 'Code d\'événement invalide.';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.cardBackground : Colors.white;
    final textColor = isDark ? AppColors.white : AppColors.blue;
    final subtextColor = isDark ? AppColors.grey : const Color(0xFF64748B);
    final borderColor = isDark
        ? AppColors.white.withValues(alpha: 0.12)
        : const Color(0xFFE2E8F0);
    final handleColor = isDark
        ? AppColors.white.withValues(alpha: 0.2)
        : const Color(0xFFCBD5E1);

    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        border: Border.all(
          color: borderColor,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black.withValues(alpha: 0.6) : Colors.black.withValues(alpha: 0.1),
            blurRadius: 30,
            offset: const Offset(0, -10),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle bar
            Center(
              child: Container(
                width: 44,
                height: 5,
                decoration: BoxDecoration(
                  color: handleColor,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'ACCÈS À L\'ÉVÉNEMENT',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: AppColors.orange,
                    letterSpacing: 1.5,
                  ),
                ),
                IconButton(
                  icon: Icon(Icons.close_rounded, color: subtextColor),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              widget.event.name,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'CODE D\'ACCÈS (8 CARACTÈRES)',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: subtextColor,
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _codeController,
              maxLength: 8,
              textAlign: TextAlign.center,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                letterSpacing: 10,
                color: textColor,
              ),
              decoration: InputDecoration(
                hintText: 'GT25XXXX',
                hintStyle: GoogleFonts.plusJakartaSans(
                  fontSize: 20,
                  letterSpacing: 8,
                  color: subtextColor.withValues(alpha: 0.4),
                ),
                counterText: '',
                filled: true,
                fillColor: isDark ? AppColors.greyBackground : const Color(0xFFF8FAFC),
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
                contentPadding: const EdgeInsets.symmetric(vertical: 18),
              ),
              onChanged: (_) => setState(() => _errorMessage = ''),
              enabled: !_isLoading,
            ),
            if (_errorMessage.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 10),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline_rounded, size: 16, color: AppColors.red),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        _errorMessage,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 12,
                          color: AppColors.red,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _validateAndConnect,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.orange,
                  foregroundColor: AppColors.white,
                  shadowColor: AppColors.orangeGlow,
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          color: Colors.white,
                        ),
                      )
                    : Text(
                        'VALIDER LE CODE',
                        style: GoogleFonts.plusJakartaSans(
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.8,
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 18),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isDark
                    ? AppColors.blueLight.withValues(alpha: 0.4)
                    : const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: AppColors.blueAccent.withValues(alpha: isDark ? 0.3 : 0.2),
                ),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline_rounded, size: 20, color: AppColors.blueAccent),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Demandez le code d\'accès de l\'événement auprès de l\'organisateur principal.',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 12,
                        color: isDark ? AppColors.white.withValues(alpha: 0.9) : const Color(0xFF1E40AF),
                        height: 1.3,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }
}

