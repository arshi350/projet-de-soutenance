// lib/pages/event_access_modal.dart
import 'package:flutter/material.dart';
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
        // Sélectionner l'événement et fermer le modal
        authProvider.selectEvent(widget.event);
        Navigator.pop(context);
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
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'CONNEXION ÉVÉNEMENT',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              widget.event.name,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 24),
            const Text(
              'CODE D\'ACCÈS ÉVÉNEMENT',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _codeController,
              maxLength: 8,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 24, letterSpacing: 8),
              decoration: const InputDecoration(
                hintText: 'GT25',
                counterText: '',
                contentPadding: EdgeInsets.symmetric(vertical: 20),
              ),
              onChanged: (_) => setState(() => _errorMessage = ''),
              enabled: !_isLoading,
            ),
            const SizedBox(height: 8),
            const Text(
              'Format: 8 caractères alphanumériques',
              style: TextStyle(fontSize: 12, color: AppColors.grey),
            ),
            if (_errorMessage.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  _errorMessage,
                  style: const TextStyle(fontSize: 12, color: AppColors.red),
                ),
              ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _validateAndConnect,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.orange,
                  foregroundColor: AppColors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text('SE CONNECTER'),
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.greyBackground,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, size: 20, color: AppColors.blue),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'CODE NON REÇU ? Contactez l\'organisateur pour obtenir votre code d\'accès à l\'événement.',
                      style: TextStyle(fontSize: 13, color: AppColors.blue),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
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
