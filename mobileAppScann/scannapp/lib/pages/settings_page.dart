// lib/pages/settings_page.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/auth_provider.dart';
import '../theme/app_colors.dart';
import '../widgets/bottom_nav_bar.dart';
import 'package:provider/provider.dart';
import 'login_page.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool _soundEnabled = true;
  bool _vibrationEnabled = true;
  bool _autoReturnEnabled = true;
  bool _autoFlashEnabled = false;
  bool _darkModeEnabled = true;
  String _textSize = 'Moyen';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Paramètres',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.white,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: AppColors.white),
          onPressed: () => Navigator.pop(context),
        ),
        backgroundColor: AppColors.blue,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 12),
            _buildSectionTitle('PRÉFÉRENCES DE SCAN'),
            _buildToggleTile(
              icon: Icons.volume_up_rounded,
              title: 'Son du scan',
              value: _soundEnabled,
              onChanged: (val) => setState(() => _soundEnabled = val),
            ),
            _buildToggleTile(
              icon: Icons.vibration_rounded,
              title: 'Vibration haptique',
              value: _vibrationEnabled,
              onChanged: (val) => setState(() => _vibrationEnabled = val),
            ),
            _buildToggleTile(
              icon: Icons.camera_alt_outlined,
              title: 'Retour auto à la caméra',
              value: _autoReturnEnabled,
              onChanged: (val) => setState(() => _autoReturnEnabled = val),
            ),
            _buildToggleTile(
              icon: Icons.flash_on_outlined,
              title: 'Flash automatique',
              value: _autoFlashEnabled,
              onChanged: (val) => setState(() => _autoFlashEnabled = val),
            ),

            const SizedBox(height: 24),
            _buildSectionTitle('AFFICHAGE'),
            _buildToggleTile(
              icon: Icons.dark_mode_outlined,
              title: 'Mode sombre cinématographique',
              value: _darkModeEnabled,
              onChanged: (val) => setState(() => _darkModeEnabled = val),
            ),

            const SizedBox(height: 14),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Taille du texte',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: AppColors.white,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      _buildTextSizeButton('Moyen', _textSize == 'Moyen'),
                      const SizedBox(width: 12),
                      _buildTextSizeButton('Grand', _textSize == 'Grand'),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            _buildSectionTitle('STOCKAGE & DONNÉES'),
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.cardBackground,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: AppColors.white.withValues(alpha: 0.1),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.2),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Espace cache',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 14,
                          color: AppColors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        '45 Mo / 100 Mo',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 13,
                          color: AppColors.grey,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: const LinearProgressIndicator(
                      value: 0.45,
                      backgroundColor: AppColors.greyLight,
                      color: AppColors.orange,
                      minHeight: 6,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {},
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.red),
                            foregroundColor: AppColors.red,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text('Vider le cache'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.blueLight,
                            foregroundColor: AppColors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text('Exporter'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            _buildSectionTitle('COMPTE & SESSION'),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: SizedBox(
                width: double.infinity,
                height: 50,
                child: OutlinedButton.icon(
                  onPressed: () {
                    final authProvider =
                        Provider.of<AuthProvider>(context, listen: false);
                    authProvider.logout();
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(
                          builder: (context) => const LoginPage()),
                      (route) => false,
                    );
                  },
                  icon: const Icon(Icons.logout_rounded, size: 18),
                  label: const Text('Se déconnecter'),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.red, width: 1.5),
                    foregroundColor: AppColors.red,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 24),
            _buildSectionTitle('INFORMATIONS SYSTÈME'),
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.cardBackground,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: AppColors.white.withValues(alpha: 0.1),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.2),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Column(
                children: [
                  _buildInfoRow('Version Application', '2.0.0 (Ultra)'),
                  Divider(color: AppColors.white.withValues(alpha: 0.08), height: 20),
                  _buildInfoRow('Conditions d\'utilisation', 'Consulter →'),
                  Divider(color: AppColors.white.withValues(alpha: 0.08), height: 20),
                  _buildInfoRow('Politique de confidentialité', 'Consulter →'),
                ],
              ),
            ),

            const SizedBox(height: 24),
            Center(
              child: Text(
                '© 2026 ARSHI EVENT. Tous droits réservés.',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 12,
                  color: AppColors.grey,
                ),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavBar(
        currentItem: NavItem.home,
        onItemSelected: (item) {
          if (item == NavItem.home) Navigator.pop(context);
        },
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Text(
        title,
        style: GoogleFonts.plusJakartaSans(
          fontSize: 11,
          fontWeight: FontWeight.w800,
          color: AppColors.orange,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildToggleTile({
    required IconData icon,
    required String title,
    required bool value,
    required Function(bool) onChanged,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.white.withValues(alpha: 0.08),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 8,
          ),
        ],
      ),
      child: Row(
        children: [
          Icon(icon, size: 22, color: AppColors.orange),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              title,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.white,
              ),
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeTrackColor: AppColors.orange,
            activeThumbColor: AppColors.white,
          ),
        ],
      ),
    );
  }

  Widget _buildTextSizeButton(String text, bool isSelected) {
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _textSize = text),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.orange : AppColors.cardBackground,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isSelected
                  ? AppColors.orange
                  : AppColors.white.withValues(alpha: 0.1),
            ),
          ),
          child: Center(
            child: Text(
              text,
              style: GoogleFonts.plusJakartaSans(
                color: isSelected ? AppColors.white : AppColors.grey,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
              ),
            ),
          ),
        ),
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
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: AppColors.white,
          ),
        ),
      ],
    );
  }
}

