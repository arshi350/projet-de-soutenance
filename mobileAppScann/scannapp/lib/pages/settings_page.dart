// lib/pages/settings_page.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/guest_provider.dart';
import '../providers/scan_provider.dart';
import '../providers/settings_provider.dart';
import '../theme/app_colors.dart';
import '../services/api_service.dart';
import '../widgets/bottom_nav_bar.dart';
import 'login_page.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  @override
  Widget build(BuildContext context) {
    final settings = context.watch<SettingsProvider>();
    final isDark = settings.darkModeEnabled;

    final bgColor = isDark ? AppColors.background : const Color(0xFFF1F5F9);
    final cardBg = isDark ? AppColors.cardBackground : Colors.white;
    final textColor = isDark ? AppColors.white : AppColors.blue;
    final subtleBorder = isDark
        ? AppColors.white.withValues(alpha: 0.08)
        : const Color(0xFFE2E8F0);
    final subtextColor = isDark ? AppColors.grey : const Color(0xFF64748B);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: Text(
          'Paramètres',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: isDark ? AppColors.white : AppColors.blue,
          ),
        ),
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios_new_rounded,
            size: 18,
            color: isDark ? AppColors.white : AppColors.blue,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        backgroundColor: isDark ? AppColors.blue : Colors.white,
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
              subtitle: 'Signal sonore lors de la validation du badge',
              value: settings.soundEnabled,
              onChanged: (val) => context.read<SettingsProvider>().setSoundEnabled(val),
              cardBg: cardBg,
              textColor: textColor,
              subtextColor: subtextColor,
              borderColor: subtleBorder,
            ),
            _buildToggleTile(
              icon: Icons.vibration_rounded,
              title: 'Vibration haptique',
              subtitle: 'Retour tactile à chaque scan effectué',
              value: settings.vibrationEnabled,
              onChanged: (val) => context.read<SettingsProvider>().setVibrationEnabled(val),
              cardBg: cardBg,
              textColor: textColor,
              subtextColor: subtextColor,
              borderColor: subtleBorder,
            ),
            _buildToggleTile(
              icon: Icons.camera_alt_outlined,
              title: 'Retour auto à la caméra',
              subtitle: 'Relance le viseur après l\'écran de résultat',
              value: settings.autoReturnEnabled,
              onChanged: (val) => context.read<SettingsProvider>().setAutoReturnEnabled(val),
              cardBg: cardBg,
              textColor: textColor,
              subtextColor: subtextColor,
              borderColor: subtleBorder,
            ),
            _buildToggleTile(
              icon: Icons.flash_on_outlined,
              title: 'Flash automatique',
              subtitle: 'Allumer la torche au lancement de la caméra',
              value: settings.autoFlashEnabled,
              onChanged: (val) => context.read<SettingsProvider>().setAutoFlashEnabled(val),
              cardBg: cardBg,
              textColor: textColor,
              subtextColor: subtextColor,
              borderColor: subtleBorder,
            ),

            const SizedBox(height: 24),
            _buildSectionTitle('AFFICHAGE'),
            _buildToggleTile(
              icon: Icons.dark_mode_outlined,
              title: 'Mode sombre cinématographique',
              subtitle: 'Palette ARSHI EVENT haute autorité',
              value: settings.darkModeEnabled,
              onChanged: (val) => context.read<SettingsProvider>().setDarkModeEnabled(val),
              cardBg: cardBg,
              textColor: textColor,
              subtextColor: subtextColor,
              borderColor: subtleBorder,
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
                      color: textColor,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      _buildTextSizeButton(
                        'Moyen',
                        settings.textSize == 'Moyen',
                        () => context.read<SettingsProvider>().setTextSize('Moyen'),
                        cardBg: cardBg,
                        borderColor: subtleBorder,
                      ),
                      const SizedBox(width: 12),
                      _buildTextSizeButton(
                        'Grand',
                        settings.textSize == 'Grand',
                        () => context.read<SettingsProvider>().setTextSize('Grand'),
                        cardBg: cardBg,
                        borderColor: subtleBorder,
                      ),
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
                color: cardBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: subtleBorder, width: 1),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
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
                          color: textColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        settings.cacheSizeDisplay,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 13,
                          color: subtextColor,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(
                      value: settings.cacheProgress,
                      backgroundColor: isDark ? AppColors.greyLight : const Color(0xFFE2E8F0),
                      color: AppColors.orange,
                      minHeight: 6,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _confirmClearCache(context, cardBg, textColor),
                          icon: const Icon(Icons.delete_sweep_rounded, size: 18),
                          label: const Text('Vider le cache'),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.red),
                            foregroundColor: AppColors.red,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _exportData(context),
                          icon: const Icon(Icons.share_rounded, size: 18),
                          label: const Text('Exporter'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.blueLight,
                            foregroundColor: AppColors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            _buildSectionTitle('COMPTE & SÉCURITÉ'),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton.icon(
                      onPressed: () => _showChangePasswordDialog(context, cardBg, textColor),
                      icon: const Icon(Icons.lock_reset_rounded, size: 20),
                      label: const Text('Changer mon mot de passe'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.orange,
                        foregroundColor: AppColors.white,
                        elevation: 3,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: OutlinedButton.icon(
                      onPressed: () => _confirmLogout(context, cardBg, textColor),
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
                ],
              ),
            ),

            const SizedBox(height: 24),
            _buildSectionTitle('INFORMATIONS SYSTÈME'),
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: subtleBorder, width: 1),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Column(
                children: [
                  _buildInfoRow('Version Application', '2.0.0 (Ultra Pro)', textColor, subtextColor),
                  Divider(color: subtleBorder, height: 20),
                  _buildInteractiveRow(
                    'Conditions d\'utilisation',
                    'Consulter →',
                    textColor,
                    () => _showTermsOfService(context, isDark),
                  ),
                  Divider(color: subtleBorder, height: 20),
                  _buildInteractiveRow(
                    'Politique de confidentialité',
                    'Consulter →',
                    textColor,
                    () => _showPrivacyPolicy(context, isDark),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            Center(
              child: Text(
                '© 2026 ARSHI EVENT. Tous droits réservés.',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 12,
                  color: subtextColor,
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
    String? subtitle,
    required bool value,
    required Function(bool) onChanged,
    required Color cardBg,
    required Color textColor,
    required Color subtextColor,
    required Color borderColor,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 8,
          ),
        ],
      ),
      child: Row(
        children: [
          Icon(icon, size: 22, color: AppColors.orange),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  title,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: textColor,
                  ),
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 11,
                      color: subtextColor,
                    ),
                  ),
                ],
              ],
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

  Widget _buildTextSizeButton(
    String text,
    bool isSelected,
    VoidCallback onTap, {
    required Color cardBg,
    required Color borderColor,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.orange : cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isSelected ? AppColors.orange : borderColor,
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

  Widget _buildInfoRow(String label, String value, Color textColor, Color subtextColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.plusJakartaSans(fontSize: 13, color: subtextColor),
        ),
        Text(
          value,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: textColor,
          ),
        ),
      ],
    );
  }

  Widget _buildInteractiveRow(
    String label,
    String actionText,
    Color textColor,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 13,
                color: textColor,
                fontWeight: FontWeight.w500,
              ),
            ),
            Text(
              actionText,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: AppColors.orange,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _confirmClearCache(BuildContext context, Color cardBg, Color textColor) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: cardBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.delete_sweep_rounded, color: AppColors.red, size: 24),
            const SizedBox(width: 8),
            Text(
              'Vider le cache ?',
              style: GoogleFonts.plusJakartaSans(
                fontWeight: FontWeight.bold,
                fontSize: 16,
                color: textColor,
              ),
            ),
          ],
        ),
        content: Text(
          'Cette action va nettoyer les fichiers temporaires et les images mises en cache. Vos données d\'authentification restent conservées.',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 13,
            color: AppColors.grey,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Annuler', style: GoogleFonts.plusJakartaSans(color: AppColors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.red,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text('Vider', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      await context.read<SettingsProvider>().clearCache();
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.green,
            behavior: SnackBarBehavior.floating,
            content: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                const SizedBox(width: 8),
                Text(
                  'Cache vidé avec succès ! (0.0 Mo)',
                  style: GoogleFonts.plusJakartaSans(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        );
      }
    }
  }

  Future<void> _exportData(BuildContext context) async {
    final authProvider = context.read<AuthProvider>();
    final guestProvider = context.read<GuestProvider>();
    final scanProvider = context.read<ScanProvider>();
    final guests = guestProvider.guests;
    final scanHistory = scanProvider.scanHistory;
    final currentEvent = authProvider.currentEvent;

    await context.read<SettingsProvider>().exportData(
      currentEvent: currentEvent,
      guests: guests,
      scanHistory: scanHistory,
    );

    if (context.mounted) {
      final totalEntries = (guests?.length ?? 0) + scanHistory.length;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.blueLight,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 4),
          content: Row(
            children: [
              const Icon(Icons.content_copy_rounded, color: AppColors.orange, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Données de scan et d\'invités ($totalEntries entrées) copiées dans le presse-papier !',
                  style: GoogleFonts.plusJakartaSans(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }
  }

  Future<void> _confirmLogout(BuildContext context, Color cardBg, Color textColor) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: cardBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.logout_rounded, color: AppColors.red, size: 22),
            const SizedBox(width: 8),
            Text(
              'Se déconnecter ?',
              style: GoogleFonts.plusJakartaSans(
                fontWeight: FontWeight.bold,
                fontSize: 16,
                color: textColor,
              ),
            ),
          ],
        ),
        content: Text(
          'Voulez-vous vraiment vous déconnecter de votre session agent ARSHI EVENT ?',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 13,
            color: AppColors.grey,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Annuler', style: GoogleFonts.plusJakartaSans(color: AppColors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.red,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text('Déconnexion', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      await authProvider.logout();
      if (context.mounted) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => const LoginPage()),
          (route) => false,
        );
      }
    }
  }

  void _showTermsOfService(BuildContext context, bool isDark) {
    _showLegalModal(
      context: context,
      isDark: isDark,
      title: 'Conditions d\'utilisation',
      sections: [
        {
          'title': '1. Objet de l\'application',
          'body': 'L\'application mobile ARSHI EVENT Scan est réservée au contrôle d\'accès, à la vérification des billets QR code et au pointage des invités lors d\'événements gérés sur la plateforme ARSHI EVENT.'
        },
        {
          'title': '2. Responsabilité de l\'agent',
          'body': 'Chaque agent de contrôle est responsable des actions de scan opérées sous son compte. Les identifiants sont strictement personnels.'
        },
        {
          'title': '3. Validation des billets',
          'body': 'Un billet QR code ne peut être validé qu\'une seule fois. Toute tentative de validation multiple est automatiquement rejetée par le système de sécurité avec horodatage.'
        },
        {
          'title': '4. Continuité de service',
          'body': 'L\'application synchronise les données en temps réel avec le serveur ARSHI EVENT. Une connexion réseau stable est requise pour assurer la parfaite fiabilité des accès.'
        },
      ],
    );
  }

  void _showPrivacyPolicy(BuildContext context, bool isDark) {
    _showLegalModal(
      context: context,
      isDark: isDark,
      title: 'Politique de confidentialité',
      sections: [
        {
          'title': '1. Collecte des données',
          'body': 'Seules les informations strictement nécessaires au contrôle d\'accès (nom, prénom, statut de présence, heure de scan) sont traitées par l\'application mobile.'
        },
        {
          'title': '2. Sécurité & Chiffrement',
          'body': 'Toutes les communications entre l\'application mobile et l\'API ARSHI EVENT sont sécurisées via jetons JWT et protocoles HTTPS/TLS chiffrés.'
        },
        {
          'title': '3. Respect du RGPD',
          'body': 'Les données personnelles des participants et invités sont stockées conformément aux réglementations applicables en matière de protection des données et restent la propriété exclusive de l\'organisateur.'
        },
        {
          'title': '4. Suppression des données locales',
          'body': 'L\'option "Vider le cache" permet à tout moment de purger les données temporaires, aperçus d\'images et historiques stockés sur l\'appareil.'
        },
      ],
    );
  }

  void _showLegalModal({
    required BuildContext context,
    required bool isDark,
    required String title,
    required List<Map<String, String>> sections,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final cardBg = isDark ? AppColors.cardBackground : Colors.white;
        final textColor = isDark ? AppColors.white : AppColors.blue;
        final subtextColor = isDark ? AppColors.grey : const Color(0xFF64748B);

        return Container(
          height: MediaQuery.of(context).size.height * 0.75,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            boxShadow: const [
              BoxShadow(color: Colors.black38, blurRadius: 20, spreadRadius: 5),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.grey.withValues(alpha: 0.4),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: textColor,
                    ),
                  ),
                  IconButton(
                    icon: Icon(Icons.close_rounded, color: subtextColor),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const Divider(height: 16),
              Expanded(
                child: ListView.separated(
                  physics: const BouncingScrollPhysics(),
                  itemCount: sections.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 16),
                  itemBuilder: (context, i) {
                    final item = sections[i];
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item['title']!,
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: AppColors.orange,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          item['body']!,
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 13,
                            color: isDark ? AppColors.grey : const Color(0xFF334155),
                            height: 1.45,
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.orange,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  onPressed: () => Navigator.pop(ctx),
                  child: Text(
                    'J\'ai compris',
                    style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showChangePasswordDialog(BuildContext context, Color cardBg, Color textColor) {
    final oldPasswordController = TextEditingController();
    final newPasswordController = TextEditingController();
    final confirmPasswordController = TextEditingController();
    bool isLoading = false;
    String? errorMessage;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) {
          return AlertDialog(
            backgroundColor: cardBg,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
              side: BorderSide(color: AppColors.white.withValues(alpha: 0.1)),
            ),
            title: Row(
              children: [
                const Icon(Icons.lock_reset_rounded, color: AppColors.orange, size: 24),
                const SizedBox(width: 10),
                Text(
                  'Changer le mot de passe',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: textColor,
                  ),
                ),
              ],
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (errorMessage != null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.red.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.red.withValues(alpha: 0.3)),
                      ),
                      child: Text(
                        errorMessage!,
                        style: GoogleFonts.plusJakartaSans(
                          color: AppColors.red,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  TextField(
                    controller: oldPasswordController,
                    obscureText: true,
                    style: TextStyle(color: textColor),
                    decoration: const InputDecoration(
                      labelText: 'Mot de passe actuel',
                      prefixIcon: Icon(Icons.lock_outline_rounded, color: AppColors.grey),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: newPasswordController,
                    obscureText: true,
                    style: TextStyle(color: textColor),
                    decoration: const InputDecoration(
                      labelText: 'Nouveau mot de passe',
                      prefixIcon: Icon(Icons.lock_outline_rounded, color: AppColors.orange),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: confirmPasswordController,
                    obscureText: true,
                    style: TextStyle(color: textColor),
                    decoration: const InputDecoration(
                      labelText: 'Confirmer le mot de passe',
                      prefixIcon: Icon(Icons.check_circle_outline_rounded, color: AppColors.grey),
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: isLoading ? null : () => Navigator.pop(ctx),
                child: Text('Annuler', style: GoogleFonts.plusJakartaSans(color: AppColors.grey)),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.orange,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: isLoading
                    ? null
                    : () async {
                        final oldPass = oldPasswordController.text.trim();
                        final newPass = newPasswordController.text.trim();
                        final confirmPass = confirmPasswordController.text.trim();

                        if (oldPass.isEmpty || newPass.isEmpty) {
                          setDialogState(() => errorMessage = 'Veuillez remplir tous les champs.');
                          return;
                        }

                        if (newPass.length < 6) {
                          setDialogState(() => errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.');
                          return;
                        }

                        if (newPass != confirmPass) {
                          setDialogState(() => errorMessage = 'Les mots de passe ne correspondent pas.');
                          return;
                        }

                        setDialogState(() {
                          isLoading = true;
                          errorMessage = null;
                        });

                        try {
                          final res = await ApiService.changeAgentPassword(oldPass, newPass);
                          if (context.mounted) {
                            Navigator.pop(ctx);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                backgroundColor: AppColors.green,
                                content: Text(
                                  res['message'] ?? 'Mot de passe modifié avec succès ! L\'organisateur a été notifié.',
                                  style: GoogleFonts.plusJakartaSans(color: Colors.white, fontWeight: FontWeight.bold),
                                ),
                              ),
                            );
                          }
                        } catch (e) {
                          setDialogState(() {
                            isLoading = false;
                            errorMessage = e.toString().replaceAll('Exception: ', '');
                          });
                        }
                      },
                child: isLoading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : Text(
                        'Valider',
                        style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold),
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}
