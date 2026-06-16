// lib/widgets/event_card.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/event_model.dart';
import '../theme/app_colors.dart';
import '../providers/auth_provider.dart';

class EventCard extends StatelessWidget {
  final EventModel event;
  final VoidCallback onScanPressed;
  final VoidCallback onGuestsPressed;
  final VoidCallback onStatsPressed;

  const EventCard({
    super.key,
    required this.event,
    required this.onScanPressed,
    required this.onGuestsPressed,
    required this.onStatsPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.orange.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child:
                    const Icon(Icons.event, color: AppColors.orange, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  event.name,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.black,
                  ),
                ),
              ),
              // Show "connecte" badge when this event is the currently selected one
              Builder(builder: (context) {
                final auth = Provider.of<AuthProvider>(context);
                final bool isConnected = auth.currentEvent != null &&
                    auth.currentEvent!.id == event.id;

                if (isConnected) {
                  return Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.green.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(12),
                      border:
                          Border.all(color: AppColors.green.withOpacity(0.2)),
                    ),
                    child: const Text(
                      'connecte',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.green,
                      ),
                    ),
                  );
                }
                return const SizedBox.shrink();
              }),
              const Icon(Icons.more_horiz, color: AppColors.grey, size: 20),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.calendar_today, size: 14, color: AppColors.grey),
              const SizedBox(width: 6),
              Text(
                '${event.formattedDate}, ${event.time}',
                style: const TextStyle(fontSize: 13, color: AppColors.grey),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.location_on, size: 14, color: AppColors.grey),
              const SizedBox(width: 6),
              Text(
                event.location,
                style: const TextStyle(fontSize: 13, color: AppColors.grey),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(color: AppColors.greyLight, height: 1),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildStatItem(
                  Icons.people_outline, '${event.totalGuests} invités'),
              const SizedBox(width: 16),
              _buildStatItem(
                  Icons.qr_code_scanner, '${event.scannedGuests} scannés'),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.green.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${(event.attendanceRate * 100).toInt()}%',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.green,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: event.attendanceRate,
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
                  onPressed: onGuestsPressed,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.orange,
                    side: const BorderSide(color: AppColors.orange),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('Invités'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton(
                  onPressed: onStatsPressed,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.blue,
                    side: const BorderSide(color: AppColors.blue),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('Stats'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: onScanPressed,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.orange,
                foregroundColor: AppColors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text('Scannez les entrées →'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 14, color: AppColors.grey),
        const SizedBox(width: 4),
        Text(
          text,
          style: TextStyle(fontSize: 12, color: AppColors.grey),
        ),
      ],
    );
  }
}
