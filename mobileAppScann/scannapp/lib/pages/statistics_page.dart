// lib/pages/statistics_page.dart
import 'dart:math';
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
  Map<String, dynamic>? _scanStats;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _loadStatistics();
      }
    });
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
        try {
          final response = await ApiService.getUserStats(authProvider.userId!);
          _userStats = response['stats'] as Map<String, dynamic>? ?? {};
        } catch (e) {
          debugPrint('User stats error: $e');
        }
      }

      try {
        final scanStatsRes = await ApiService.getScanStats(widget.event.id);
        if (scanStatsRes['success'] == true) {
          _scanStats = scanStatsRes;
        }
      } catch (e) {
        debugPrint('Scan stats error: $e');
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
      _guests?.where((g) => g.status == 'present' || g.isScanned).length ??
      widget.event.scannedGuests;
  int get absentGuests => max(0, totalGuests - scannedGuests);
  double get attendanceRate =>
      totalGuests > 0 ? scannedGuests / totalGuests : 0;

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

    final scanned = (_guests ?? []).where((g) => g.isScanned || g.isPresent).toList();
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
    if (_isLoading) {
      return const Scaffold(
        appBar: CustomAppBar(
          title: 'Statistiques',
          showBackButton: true,
        ),
        body: Center(child: CircularProgressIndicator(color: AppColors.orange)),
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
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline_rounded, size: 48, color: AppColors.red),
                const SizedBox(height: 12),
                Text(
                  'Erreur lors du chargement des statistiques :\n$_error',
                  style: const TextStyle(fontSize: 14, color: AppColors.red),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: _loadStatistics,
                  icon: const Icon(Icons.refresh_rounded),
                  label: const Text('Réessayer'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final spots = _getTimelineSpots();
    final labels = _getTimelineLabels();
    final maxVal = spots.map((s) => s.y).fold(0.0, (a, b) => b > a ? b : a);
    final chartMaxY = (maxVal * 1.3).clamp(5.0, 10000.0);

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.cardBackground : Colors.white;
    final textColor = isDark ? AppColors.white : AppColors.blue;
    final subtextColor = isDark ? AppColors.grey : const Color(0xFF64748B);
    final borderColor = isDark ? AppColors.white.withValues(alpha: 0.08) : const Color(0xFFE2E8F0);

    return Scaffold(
      backgroundColor: isDark ? AppColors.background : const Color(0xFFF4F6F9),
      appBar: const CustomAppBar(
        title: 'Statistiques',
        showBackButton: true,
      ),
      body: RefreshIndicator(
        color: AppColors.orange,
        backgroundColor: cardBg,
        onRefresh: _loadStatistics,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      widget.event.name,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: textColor,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.green.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'Live MongoDB',
                      style: TextStyle(fontSize: 11, color: AppColors.green, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                "Dernière synchronisation : ${DateTime.now().hour.toString().padLeft(2, '0')}:${DateTime.now().minute.toString().padLeft(2, '0')}",
                style: TextStyle(fontSize: 12, color: subtextColor),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  _buildStatCard('INVITÉS', '$totalGuests', textColor, cardBg, borderColor, subtextColor),
                  const SizedBox(width: 12),
                  _buildStatCard('PRÉSENTS', '$scannedGuests', AppColors.green, cardBg, borderColor, subtextColor),
                  const SizedBox(width: 12),
                  _buildStatCard('ATTENTE', '$absentGuests', AppColors.warning, cardBg, borderColor, subtextColor),
                ],
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: borderColor),
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
                    const Text(
                      'ÉVOLUTION HORAIRE DES PRÉSENCES',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: AppColors.orange,
                        letterSpacing: 1,
                      ),
                    ),
                    const SizedBox(height: 20),
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
                              color: isDark
                                  ? AppColors.white.withValues(alpha: 0.05)
                                  : const Color(0xFFE2E8F0),
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
                                    return Text(
                                      labels[idx],
                                      style: TextStyle(
                                          fontSize: 11, color: subtextColor),
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
                                color: AppColors.orange.withValues(alpha: 0.2),
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
                    const SizedBox(height: 8),
                    Center(
                      child: Text(
                        '$scannedGuests entrée${scannedGuests > 1 ? 's' : ''} enregistrée${scannedGuests > 1 ? 's' : ''}',
                        style: const TextStyle(
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
                  color: cardBg,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: borderColor),
                  boxShadow: [
                    BoxShadow(
                      color: isDark ? Colors.black26 : Colors.black.withValues(alpha: 0.04),
                      blurRadius: 10,
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    _buildDetailRow('Heure de pointe réelle', _getPeakHourDisplay(), subtextColor, textColor),
                    Divider(color: borderColor),
                    _buildDetailRow('Taux de complétion',
                        '${(attendanceRate * 100).toInt()}%', subtextColor, textColor),
                    Divider(color: borderColor),
                    _buildDetailRow('Restants à contrôler', '$absentGuests personnes', subtextColor, textColor),
                  ],
                ),
              ),
              if (_userStats != null && _userStats!.isNotEmpty) ...[
                const SizedBox(height: 24),
                Text(
                  'Statistiques globales du compte',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: textColor),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: cardBg,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: borderColor),
                    boxShadow: [
                      BoxShadow(
                        color: isDark ? Colors.black26 : Colors.black.withValues(alpha: 0.04),
                        blurRadius: 10,
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      _buildDetailRow(
                          'Événements totaux', '${_userStats!['totalEvents'] ?? '-'}', subtextColor, textColor),
                      Divider(color: borderColor),
                      _buildDetailRow(
                          'Événements actifs', '${_userStats!['activeEvents'] ?? '-'}', subtextColor, textColor),
                      Divider(color: borderColor),
                      _buildDetailRow(
                          'Invités totaux', '${_userStats!['totalInvites'] ?? '-'}', subtextColor, textColor),
                    ],
                  ),
                ),
              ],
            ],
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

  Widget _buildStatCard(
    String label, 
    String value, 
    Color color,
    Color bgCol,
    Color borderCol,
    Color labelCol,
  ) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: bgCol,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: borderCol),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: TextStyle(fontSize: 11, color: labelCol),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, Color labelCol, Color valCol) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: TextStyle(fontSize: 13, color: labelCol)),
          Text(
            value,
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: valCol),
          ),
        ],
      ),
    );
  }
}
