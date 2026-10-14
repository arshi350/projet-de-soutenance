// lib/pages/statistics_page_content.dart
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../models/event_model.dart';
import '../providers/guest_provider.dart';
import '../services/api_service.dart';
import '../theme/app_colors.dart';
import 'package:fl_chart/fl_chart.dart';

class StatisticsPageContent extends StatefulWidget {
  final EventModel event;

  const StatisticsPageContent({super.key, required this.event});

  @override
  State<StatisticsPageContent> createState() => _StatisticsPageContentState();
}

class _StatisticsPageContentState extends State<StatisticsPageContent> {
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _scanStats;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _loadData();
      }
    });
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final guestProvider = Provider.of<GuestProvider>(context, listen: false);
      await guestProvider.fetchGuests(widget.event.id);

      try {
        final stats = await ApiService.getScanStats(widget.event.id);
        if (mounted && stats['success'] == true) {
          _scanStats = stats;
        }
      } catch (e) {
        debugPrint('Scan stats API fallback: $e');
      }
    } catch (e) {
      if (mounted) {
        _error = e.toString().replaceAll('Exception: ', '');
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  List<String> _getTimelineLabels() {
    if (_scanStats != null && _scanStats!['timeline'] is List) {
      final List tl = _scanStats!['timeline'] as List;
      if (tl.isNotEmpty) {
        return tl.map((item) {
          final t = (item['time'] ?? '').toString();
          return t.replaceAll('h00', 'h');
        }).toList();
      }
    }
    return ['18h', '19h', '20h', '21h', '22h'];
  }

  List<FlSpot> _getTimelineSpots() {
    if (_scanStats != null && _scanStats!['timeline'] is List) {
      final List tl = _scanStats!['timeline'] as List;
      if (tl.isNotEmpty) {
        return tl.asMap().entries.map((entry) {
          final count = (entry.value['presence'] as num?)?.toDouble() ?? 0.0;
          return FlSpot(entry.key.toDouble(), count);
        }).toList();
      }
    }

    // Calcul dynamique de secours basé sur les heures réelles des invités scannés
    final guests = Provider.of<GuestProvider>(context, listen: false).guests ?? [];
    final scanned = guests.where((g) => g.isScanned || g.isPresent).toList();
    if (scanned.isEmpty) {
      return const [
        FlSpot(0, 0),
        FlSpot(1, 0),
        FlSpot(2, 0),
        FlSpot(3, 0),
        FlSpot(4, 0),
      ];
    }

    final Map<int, int> countsByHour = {};
    for (final g in scanned) {
      int hour = 20;
      if (g.scanTime != null && g.scanTime!.contains(':')) {
        final parts = g.scanTime!.split(':');
        hour = int.tryParse(parts[0]) ?? 20;
      }
      countsByHour[hour] = (countsByHour[hour] ?? 0) + 1;
    }

    final baseHours = [18, 19, 20, 21, 22];
    return baseHours.asMap().entries.map((e) {
      final h = e.value;
      final val = (countsByHour[h] ?? 0).toDouble();
      return FlSpot(e.key.toDouble(), val);
    }).toList();
  }

  String _getPeakHourDisplay() {
    final spots = _getTimelineSpots();
    final labels = _getTimelineLabels();
    if (spots.isEmpty) return 'Aucune donnée';

    double maxVal = 0;
    int maxIdx = 0;
    for (int i = 0; i < spots.length; i++) {
      if (spots[i].y > maxVal) {
        maxVal = spots[i].y;
        maxIdx = i;
      }
    }

    if (maxVal <= 0) return 'Aucun scan enregistré';
    final label = maxIdx < labels.length ? labels[maxIdx] : 'Heure inconnue';
    return '$label (${maxVal.toInt()} scans)';
  }

  @override
  Widget build(BuildContext context) {
    final guestProvider = Provider.of<GuestProvider>(context);
    final guests = guestProvider.guests;
    final totalGuests = guests?.length ?? widget.event.totalGuests;
    final scannedGuests = guestProvider.scannedGuests;
    final waitingGuests = max(0, totalGuests - scannedGuests);
    final attendanceRate = totalGuests > 0 ? scannedGuests / totalGuests : 0.0;

    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppColors.orange));
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline_rounded, size: 48, color: AppColors.red),
              const SizedBox(height: 12),
              Text(
                'Erreur lors du chargement des statistiques :\n$_error',
                style: GoogleFonts.plusJakartaSans(fontSize: 14, color: AppColors.red),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: _loadData,
                icon: const Icon(Icons.refresh_rounded, size: 18),
                label: const Text('Réessayer'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.orange,
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),
        ),
      );
    }

    final spots = _getTimelineSpots();
    final labels = _getTimelineLabels();
    final maxVal = spots.map((s) => s.y).fold(0.0, (a, b) => b > a ? b : a);
    final chartMaxY = (maxVal * 1.3).clamp(5.0, 10000.0);

    final categoryDist = _scanStats?['categoryDistribution'] as List<dynamic>?;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.cardBackground : Colors.white;
    final textColor = isDark ? AppColors.white : AppColors.blue;
    final subtextColor = isDark ? AppColors.grey : const Color(0xFF64748B);
    final borderColor = isDark ? AppColors.white.withValues(alpha: 0.1) : const Color(0xFFE2E8F0);
    final subtleBorder = isDark ? AppColors.white.withValues(alpha: 0.08) : const Color(0xFFE2E8F0);

    return RefreshIndicator(
      color: AppColors.orange,
      backgroundColor: cardBg,
      onRefresh: _loadData,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // En-tête événement
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    widget.event.name,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: textColor,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.blueLight : const Color(0xFFE2E8F0),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.show_chart_rounded, size: 18, color: AppColors.orange),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              'Métriques d\'assiduité en temps réel (synchronisé BD)',
              style: GoogleFonts.plusJakartaSans(fontSize: 12, color: subtextColor),
            ),
            const SizedBox(height: 20),

            // Cartes statistiques principales
            Row(
              children: [
                _buildStatCard('TOTAL INVITÉS', '$totalGuests', textColor, cardBg, borderColor, subtextColor, isDark),
                const SizedBox(width: 10),
                _buildStatCard('PRÉSENTS', '$scannedGuests', AppColors.green, cardBg, borderColor, subtextColor, isDark),
                const SizedBox(width: 10),
                _buildStatCard('EN ATTENTE', '$waitingGuests', AppColors.warning, cardBg, borderColor, subtextColor, isDark),
              ],
            ),
            const SizedBox(height: 16),

            // Répartition par catégorie si disponible
            if (categoryDist != null && categoryDist.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: subtleBorder),
                  boxShadow: [
                    BoxShadow(
                      color: isDark ? Colors.black26 : Colors.black.withValues(alpha: 0.04),
                      blurRadius: 10,
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'RÉPARTITION PAR CATÉGORIE',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: AppColors.orange,
                        letterSpacing: 1,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: categoryDist.map((cat) {
                        final name = cat['name'] ?? 'Catégorie';
                        final total = cat['total'] ?? 0;
                        final scanned = cat['scanned'] ?? 0;
                        return Expanded(
                          child: Container(
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: isDark ? AppColors.blueLight.withValues(alpha: 0.4) : const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: subtleBorder),
                            ),
                            child: Column(
                              children: [
                                Text(
                                  name.toString().toUpperCase(),
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: textColor,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '$scanned / $total',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.orange,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Graphique d'évolution horaire réel
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: borderColor,
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: isDark ? Colors.black.withValues(alpha: 0.3) : Colors.black.withValues(alpha: 0.05),
                    blurRadius: 15,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'ÉVOLUTION HORAIRE DES SCANS',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: AppColors.orange,
                          letterSpacing: 1,
                        ),
                      ),
                      Text(
                        'Données MongoDB',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 10,
                          color: AppColors.green,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    height: 200,
                    child: LineChart(
                      LineChartData(
                        minY: 0,
                        maxY: chartMaxY,
                        gridData: FlGridData(
                          show: true,
                          drawVerticalLine: false,
                          getDrawingHorizontalLine: (value) => FlLine(
                            color: isDark ? AppColors.white.withValues(alpha: 0.05) : const Color(0xFFE2E8F0),
                            strokeWidth: 1,
                          ),
                        ),
                        titlesData: FlTitlesData(
                          leftTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                          bottomTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              getTitlesWidget: (value, meta) {
                                final idx = value.toInt();
                                if (idx >= 0 && idx < labels.length) {
                                  return Padding(
                                    padding: const EdgeInsets.only(top: 8.0),
                                    child: Text(
                                      labels[idx],
                                      style: GoogleFonts.plusJakartaSans(
                                        fontSize: 11,
                                        color: subtextColor,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  );
                                }
                                return const Text('');
                              },
                              reservedSize: 30,
                            ),
                          ),
                          rightTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                          topTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                        ),
                        borderData: FlBorderData(show: false),
                        lineBarsData: [
                          LineChartBarData(
                            spots: spots,
                            isCurved: true,
                            color: AppColors.orange,
                            barWidth: 3.5,
                            belowBarData: BarAreaData(
                              show: true,
                              gradient: LinearGradient(
                                colors: [
                                  AppColors.orange.withValues(alpha: 0.35),
                                  AppColors.orange.withValues(alpha: 0.0),
                                ],
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                              ),
                            ),
                            dotData: FlDotData(
                              show: true,
                              getDotPainter: (spot, percent, barData, index) =>
                                  FlDotCirclePainter(
                                radius: 3,
                                color: AppColors.orange,
                                strokeWidth: 1.5,
                                strokeColor: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.orange.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '$scannedGuests scan${scannedGuests > 1 ? 's' : ''} validé${scannedGuests > 1 ? 's' : ''}',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 12,
                          color: AppColors.orange,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Statistiques détaillées réelles
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: borderColor,
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: isDark ? Colors.black.withValues(alpha: 0.3) : Colors.black.withValues(alpha: 0.05),
                    blurRadius: 15,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  _buildDetailRow('Heure de pointe réelle', _getPeakHourDisplay(), subtextColor, textColor),
                  Divider(color: subtleBorder, height: 24),
                  _buildDetailRow(
                    'Taux de présence effectif',
                    '${(attendanceRate * 100).toInt()}%',
                    subtextColor,
                    textColor,
                  ),
                  Divider(color: subtleBorder, height: 24),
                  _buildDetailRow(
                    'Restants à contrôler',
                    '$waitingGuests invité${waitingGuests > 1 ? 's' : ''}',
                    subtextColor,
                    textColor,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(
    String label, 
    String value, 
    Color valueColor, 
    Color bgCol, 
    Color borderCol, 
    Color labelCol,
    bool isDark,
  ) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: bgCol,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: borderCol,
          ),
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black.withValues(alpha: 0.2) : Colors.black.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Text(
              label,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: labelCol,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              value,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: valueColor,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, Color labelCol, Color valCol) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.plusJakartaSans(fontSize: 13, color: labelCol),
        ),
        Text(
          value,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: valCol,
          ),
        ),
      ],
    );
  }
}
