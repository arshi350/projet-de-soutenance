// lib/pages/statistics_page_content.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../models/event_model.dart';
import '../providers/guest_provider.dart';
import '../theme/app_colors.dart';
import 'package:fl_chart/fl_chart.dart';

class StatisticsPageContent extends StatefulWidget {
  final EventModel event;

  const StatisticsPageContent({super.key, required this.event});

  @override
  State<StatisticsPageContent> createState() => _StatisticsPageContentState();
}

class _StatisticsPageContentState extends State<StatisticsPageContent> {
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _loadGuests();
      }
    });
  }

  Future<void> _loadGuests() async {
    final guestProvider = Provider.of<GuestProvider>(context, listen: false);
    await guestProvider.fetchGuests(widget.event.id);
    if (guestProvider.error != null) {
      setState(() {
        _error = guestProvider.error;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final guestProvider = Provider.of<GuestProvider>(context);
    final guests = guestProvider.guests;
    final totalGuests = guests?.length ?? widget.event.totalGuests;
    final scannedGuests = guestProvider.scannedGuests;
    final attendanceRate = totalGuests > 0 ? scannedGuests / totalGuests : 0;

    if (guestProvider.isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppColors.orange));
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            'Erreur lors du chargement des statistiques : $_error',
            style: GoogleFonts.plusJakartaSans(fontSize: 14, color: AppColors.red),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
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
                    color: AppColors.white,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.blueLight,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.show_chart_rounded, size: 18, color: AppColors.orange),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'Métriques d\'assiduité en temps réel',
            style: GoogleFonts.plusJakartaSans(fontSize: 12, color: AppColors.grey),
          ),
          const SizedBox(height: 20),

          // Cartes statistiques
          Row(
            children: [
              _buildStatCard('TOTAL INVITÉS', '$totalGuests', AppColors.white),
              const SizedBox(width: 10),
              _buildStatCard('PRÉSENTS', '$scannedGuests', AppColors.green),
              const SizedBox(width: 10),
              _buildStatCard('EN ATTENTE', '${totalGuests - scannedGuests}', AppColors.warning),
            ],
          ),
          const SizedBox(height: 20),

          // Graphique d'évolution
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.cardBackground,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: AppColors.white.withValues(alpha: 0.1),
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'ÉVOLUTION DES PRÉSENCES',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: AppColors.orange,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  height: 200,
                  child: LineChart(
                    LineChartData(
                      gridData: FlGridData(
                        show: true,
                        drawVerticalLine: false,
                        getDrawingHorizontalLine: (value) => FlLine(
                          color: AppColors.white.withValues(alpha: 0.05),
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
                              const hours = ['19h', '20h', '21h', '22h', '23h'];
                              if (value.toInt() >= 0 &&
                                  value.toInt() < hours.length) {
                                return Padding(
                                  padding: const EdgeInsets.only(top: 8.0),
                                  child: Text(
                                    hours[value.toInt()],
                                    style: GoogleFonts.plusJakartaSans(
                                      fontSize: 11,
                                      color: AppColors.grey,
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
                          spots: const [
                            FlSpot(0, 50),
                            FlSpot(1, 120),
                            FlSpot(2, 245),
                            FlSpot(3, 280),
                            FlSpot(4, 312),
                          ],
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
                          dotData: const FlDotData(show: false),
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
                      '$scannedGuests entrées enregistrées',
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

          // Statistiques détaillées
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.cardBackground,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: AppColors.white.withValues(alpha: 0.1),
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                _buildDetailRow('Heure de pointe estimée', '20h15'),
                Divider(color: AppColors.white.withValues(alpha: 0.08), height: 24),
                _buildDetailRow(
                  'Taux de complétion',
                  '${(attendanceRate * 100).toInt()}%',
                ),
                Divider(color: AppColors.white.withValues(alpha: 0.08), height: 24),
                _buildDetailRow('Temps moyen par scan', '2.8s'),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color valueColor) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: AppColors.cardBackground,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: AppColors.white.withValues(alpha: 0.1),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.2),
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
                color: AppColors.grey,
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

  Widget _buildDetailRow(String label, String value) {
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
            color: AppColors.white,
          ),
        ),
      ],
    );
  }
}

