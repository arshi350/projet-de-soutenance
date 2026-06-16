// lib/pages/statistics_page_content.dart
import 'package:flutter/material.dart';
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
    _loadGuests();
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
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            'Erreur lors du chargement des statistiques : $_error',
            style: const TextStyle(fontSize: 14, color: AppColors.red),
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
          // En-tête
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                widget.event.name,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.greyBackground,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.lock_outline,
                    size: 16, color: AppColors.grey),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Dernière mise à jour : 19h42',
            style: TextStyle(fontSize: 12, color: AppColors.grey),
          ),
          const SizedBox(height: 20),

          // Cartes statistiques
          Row(
            children: [
              _buildStatCard('INVITÉS', '$totalGuests'),
              const SizedBox(width: 12),
              _buildStatCard('PRÉSENTS', '$scannedGuests'),
              const SizedBox(width: 12),
              _buildStatCard('ATTENTE', '${totalGuests - scannedGuests}'),
            ],
          ),
          const SizedBox(height: 24),

          // Graphique d'évolution
          Container(
            padding: const EdgeInsets.all(16),
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'ÉVOLUTION DES PRÉSENCES',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  height: 200,
                  child: LineChart(
                    LineChartData(
                      gridData: const FlGridData(show: false),
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
                                return Text(
                                  hours[value.toInt()],
                                  style: const TextStyle(
                                      fontSize: 11, color: AppColors.grey),
                                );
                              }
                              return const Text('');
                            },
                            reservedSize: 30,
                          ),
                        ),
                        rightTitles: const  AxisTitles(
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
                          barWidth: 3,
                          belowBarData: BarAreaData(
                            show: true,
                            color: AppColors.orange.withOpacity(0.1),
                          ),
                          dotData: const FlDotData(show: false),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                const Center(
                  child: Text(
                    '245 entrées',
                    style:  TextStyle(
                      fontSize: 12,
                      color: AppColors.orange,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Statistiques détaillées
          Container(
            padding: const EdgeInsets.all(16),
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
                _buildDetailRow('Heure de pointe', '20h15'),
                const Divider(),
                _buildDetailRow(
                    'Taux de complétion', '${(attendanceRate * 100).toInt()}%'),
                const Divider(),
                _buildDetailRow('Temps moyen / scan', '3.2s'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
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
            Text(
              label,
              style: const TextStyle(fontSize: 11, color: AppColors.grey),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(fontSize: 14, color: AppColors.grey)),
          Text(
            value,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}
