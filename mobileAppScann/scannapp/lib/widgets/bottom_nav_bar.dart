
// lib/widgets/bottom_nav_bar.dart
import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

enum NavItem { home, scanner, guests, stats }

class BottomNavBar extends StatelessWidget {
  final NavItem currentItem;
  final Function(NavItem) onItemSelected;

  const BottomNavBar({
    super.key,
    required this.currentItem,
    required this.onItemSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      decoration: BoxDecoration(
        color: AppColors.blueLight.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: AppColors.white.withValues(alpha: 0.12),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
          BoxShadow(
            color: AppColors.orange.withValues(alpha: 0.05),
            blurRadius: 15,
            spreadRadius: 2,
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(
                icon: Icons.home_outlined,
                selectedIcon: Icons.home_rounded,
                label: 'Accueil',
                item: NavItem.home,
              ),
              _buildNavItem(
                icon: Icons.qr_code_scanner_outlined,
                selectedIcon: Icons.qr_code_scanner_rounded,
                label: 'Scanner',
                item: NavItem.scanner,
              ),
              _buildNavItem(
                icon: Icons.people_outline_rounded,
                selectedIcon: Icons.people_rounded,
                label: 'Invités',
                item: NavItem.guests,
              ),
              _buildNavItem(
                icon: Icons.bar_chart_outlined,
                selectedIcon: Icons.bar_chart_rounded,
                label: 'Stats',
                item: NavItem.stats,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required IconData selectedIcon,
    required String label,
    required NavItem item,
  }) {
    final isSelected = currentItem == item;

    return GestureDetector(
      onTap: () => onItemSelected(item),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOutCubic,
        padding: EdgeInsets.symmetric(
          horizontal: isSelected ? 16 : 12,
          vertical: 8,
        ),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.orange
              : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.orange.withValues(alpha: 0.4),
                    blurRadius: 12,
                    offset: const Offset(0, 3),
                  ),
                ]
              : [],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isSelected ? selectedIcon : icon,
              color: isSelected ? AppColors.white : AppColors.grey,
              size: 22,
            ),
            if (isSelected) ...[
              const SizedBox(width: 8),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.white,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.3,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}