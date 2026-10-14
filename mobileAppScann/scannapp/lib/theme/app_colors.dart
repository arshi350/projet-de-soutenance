
// lib/theme/app_colors.dart
import 'package:flutter/material.dart';

class AppColors {
  // Charte Graphique Impérative ARSHI EVENT
  static const orange = Color(0xFFFF5005);
  static const orangeLight = Color(0xFFFF7338);
  static const orangeGlow = Color(0x4DFF5005);
  
  static const blue = Color(0xFF0B1727); // Bleu profond secondaire
  static const blueLight = Color(0xFF1A2C4B); // Surface d'autorité / header
  static const blueAccent = Color(0xFF2563EB);
  
  // États
  static const green = Color(0xFF10B981); // Émeraude validation / succès
  static const red = Color(0xFFEF4444);
  static const warning = Color(0xFFF59E0B);
  static const gold = Color(0xFFEFB810); // Accents Or VIP / Exclusif

  // Neutres & Surfaces
  static const background = Color(0xFF080F1A); // Fond sombre cinématographique
  static const cardBackground = Color(0xFF0F172A); // Carte anthracite
  static const surfaceDark = Color(0xFF1E293B);
  static const borderSubtle = Color(0xFF1E293B);
  
  static const white = Color(0xFFFFFFFF);
  static const black = Color(0xFF0B1727);
  static const grey = Color(0xFF94A3B8); // Texte secondaire lisible
  static const greyLight = Color(0xFF334155); // Bordures & séparateurs
  static const greyBackground = Color(0xFF172131); // Fond de conteneur

  // Spécifiques scan
  static const cameraBackground = Color(0xFF080F1A);

  // Méthodes d'adaptation dynamique Clair / Sombre
  static bool isDarkMode(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark;

  static Color getBg(BuildContext context) =>
      isDarkMode(context) ? background : const Color(0xFFF4F6F9);

  static Color getCardBg(BuildContext context) =>
      isDarkMode(context) ? cardBackground : Colors.white;

  static Color getTextPrimary(BuildContext context) =>
      isDarkMode(context) ? white : blue;

  static Color getTextSecondary(BuildContext context) =>
      isDarkMode(context) ? grey : const Color(0xFF64748B);

  static Color getBorder(BuildContext context) =>
      isDarkMode(context)
          ? white.withValues(alpha: 0.1)
          : const Color(0xFFE2E8F0);

  static Color getSubtleBg(BuildContext context) =>
      isDarkMode(context) ? surfaceDark : const Color(0xFFF1F5F9);
}

extension AppThemeContext on BuildContext {
  bool get isDarkMode => Theme.of(this).brightness == Brightness.dark;
  Color get bg => AppColors.getBg(this);
  Color get cardBg => AppColors.getCardBg(this);
  Color get textPrimary => AppColors.getTextPrimary(this);
  Color get textSecondary => AppColors.getTextSecondary(this);
  Color get borderColor => AppColors.getBorder(this);
  Color get subtleBg => AppColors.getSubtleBg(this);
}
