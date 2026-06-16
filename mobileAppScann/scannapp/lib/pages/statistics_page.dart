// lib/pages/statistics_page.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/event_model.dart';
import '../models/guest_model.dart';
import '../providers/auth_provider.dart';
import '../providers/guest_provider.dart';
import '../services/api_service.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/bottom_nav_bar.dart' show BottomNavBar, NavItem;
import '../theme/app_colors.dart';
import 'package:fl_chart/fl_chart.dart';

class StatisticsPage extends StatefulWidget {
  final EventModel event;

  const StatisticsPage({super.key, required this.event});

  @override
  State<StatisticsPage> createState() => _StatisticsPageState();
}

class _StatisticsPageState extends State<StatisticsPage> {
  bool _isLoading = true;
  String? _error;
  List<GuestModel>? _guests;
  Map<String, dynamic>? _userStats;

  @override
  void initState() {
    super.initState();
    _loadStatistics();
  }

  Future<void> _loadStatistics() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final guestProvider = Provider.of<GuestProvider>(context, listen: false);

    try {
      await guestProvider.fetchGuests(widget.event.id);
      _guests = guestProvider.guests;

      if (authProvider.userId != null) {
        final response = await ApiService.getUserStats(authProvider.userId!);
        _userStats = response['stats'] as Map<String, dynamic>? ?? {};
      }
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  int get totalGuests => _guests?.length ?? widget.event.totalGuests;
  int get scannedGuests =>
      _guests?.where((g) => g.status == 'present').length ??
      widget.event.scannedGuests;
  int get absentGuests => totalGuests - scannedGuests;
  double get attendanceRate =>
      totalGuests > 0 ? scannedGuests / totalGuests : 0;

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: const CustomAppBar(
          title: 'Statistiques',
          showBackButton: true,
        ),
        body: const Center(child: CircularProgressIndicator()),
        bottomNavigationBar: BottomNavBar(
          currentItem: NavItem.stats,
          onItemSelected: (item) {
            if (item == NavItem.home) Navigator.pop(context);
          },
        ),
      );
    }

    if (_error != null) {
      return Scaffold(
        appBar: const CustomAppBar(
          title: 'Statistiques',
          showBackButton: true,
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'Erreur lors du chargement des statistiques : $_error',
              style: const TextStyle(fontSize: 14, color: AppColors.red),
              textAlign: TextAlign.center,
            ),
          ),
        ),
        bottomNavigationBar: BottomNavBar(
          currentItem: NavItem.stats,
          onItemSelected: (item) {
            if (item == NavItem.home) Navigator.pop(context);
          },
        ),
      );
    }

    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Statistiques',
        showBackButton: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
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
            Text(
              "Dernière mise à jour : ${DateTime.now().hour.toString().padLeft(2, '0')}:${DateTime.now().minute.toString().padLeft(2, '0')}",
              style: const TextStyle(fontSize: 12, color: AppColors.grey),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                _buildStatCard('INVITÉS', '$totalGuests'),
                const SizedBox(width: 12),
                _buildStatCard('PRÉSENTS', '$scannedGuests'),
                const SizedBox(width: 12),
                _buildStatCard('ATTENTE', '$absentGuests'),
              ],
            ),
            const SizedBox(height: 24),
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
                        gridData: FlGridData(show: false),
                        titlesData: FlTitlesData(
                          leftTitles: AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                          bottomTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              getTitlesWidget: (value, meta) {
                                const hours = [
                                  '19h',
                                  '20h',
                                  '21h',
                                  '22h',
                                  '23h'
                                ];
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
                          rightTitles: AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                          topTitles: AxisTitles(
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
                            dotData: FlDotData(show: false),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Center(
                    child: Text(
                      '$scannedGuests entrées',
                      style: TextStyle(
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
                  _buildDetailRow('Taux de complétion',
                      '${(attendanceRate * 100).toInt()}%'),
                  const Divider(),
                  _buildDetailRow('Temps moyen / scan', '3.2s'),
                ],
              ),
            ),
            if (_userStats != null && _userStats!.isNotEmpty) ...[
              const SizedBox(height: 24),
              Text(
                'Statistiques globales',
                style:
                    const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              _buildDetailRow(
                  'Événements totaux', '${_userStats!['totalEvents'] ?? '-'}'),
              const Divider(),
              _buildDetailRow(
                  'Événements actifs', '${_userStats!['activeEvents'] ?? '-'}'),
              const Divider(),
              _buildDetailRow(
                  'Invités totaux', '${_userStats!['totalInvites'] ?? '-'}'),
            ],
          ],
        ),
      ),
      bottomNavigationBar: BottomNavBar(
        currentItem: NavItem.stats,
        onItemSelected: (item) {
          if (item == NavItem.home) Navigator.pop(context);
        },
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
