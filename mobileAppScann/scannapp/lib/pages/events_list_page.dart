import 'package:arshievent_scan/models/event_model.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/event_provider.dart';
import '../services/api_service.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/bottom_nav_bar.dart' show BottomNavBar, NavItem;
import '../widgets/event_card.dart';
import '../theme/app_colors.dart';
import 'event_access_modal.dart';
import 'guests_list_page.dart';
import 'settings_page.dart';
import 'scan_page_body_content.dart';
import 'guests_list_page_content.dart';
import 'statistics_page.dart';
import 'statistics_page_content.dart';

class EventsListPage extends StatefulWidget {
  const EventsListPage({super.key});

  @override
  State<EventsListPage> createState() => _EventsListPageState();
}

class _EventsListPageState extends State<EventsListPage> {
  bool isOffline = false;
  NavItem _currentTab = NavItem.home;

  @override
  void initState() {
    super.initState();
    _loadUserEvents();
  }

  Future<void> _loadUserEvents() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final eventProvider = Provider.of<EventProvider>(context, listen: false);

    final userId = authProvider.userId;
    final token = authProvider.token;

    if (userId == null) {
      await authProvider.initializeAuth();
      final newUserId = authProvider.userId;
      final newToken = authProvider.token;

      if (newUserId != null && newToken != null) {
        ApiService.setAuthToken(newToken);
        try {
          await eventProvider.fetchUserEvents(newUserId);
        } on AuthException catch (_) {
          await authProvider.logout();
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                    'Session expirée ou invalide. Veuillez vous reconnecter.'),
              ),
            );
          }
          return;
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                  'Erreur: Utilisateur non trouvé. Veuillez vous reconnecter.'),
            ),
          );
        }
      }
    } else {
      ApiService.setAuthToken(token);
      try {
        await eventProvider.fetchUserEvents(userId);
      } on AuthException catch (_) {
        await authProvider.logout();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                  'Session expirée ou invalide. Veuillez vous reconnecter.'),
            ),
          );
        }
      }
    }
  }

  void _onEventSelected(EventModel event) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => EventAccessModal(event: event),
    );
  }

  void _onTabSelected(NavItem item) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    if (item == NavItem.home) {
      setState(() {
        _currentTab = NavItem.home;
      });
      return;
    }

    if (!authProvider.hasEventSelected) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            item == NavItem.scanner
                ? 'Sélectionnez un événement pour scanner'
                : item == NavItem.guests
                    ? 'Sélectionnez un événement pour voir les invités'
                    : 'Sélectionnez un événement pour voir les statistiques',
          ),
        ),
      );
      return;
    }

    setState(() {
      _currentTab = item;
    });
  }

  @override
  Widget build(BuildContext context) {
    final eventProvider = Provider.of<EventProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);

    String appBarTitle = 'Mes événements';
    if (_currentTab != NavItem.home && authProvider.hasEventSelected) {
      appBarTitle = authProvider.currentEvent?.name ?? 'Titre';
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: CustomAppBar(
        title: appBarTitle,
        showBackButton: false,
        action: _currentTab == NavItem.home
            ? IconButton(
                icon: const Icon(Icons.settings_outlined, color: AppColors.white),
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const SettingsPage()),
                ),
              )
            : null,
      ),
      body: _buildCurrentBody(eventProvider, authProvider),
      bottomNavigationBar: BottomNavBar(
        currentItem: _currentTab,
        onItemSelected: _onTabSelected,
      ),
    );
  }

  Widget _buildCurrentBody(
      EventProvider eventProvider, AuthProvider authProvider) {
    switch (_currentTab) {
      case NavItem.home:
        return _buildEventsList(eventProvider);
      case NavItem.scanner:
        if (authProvider.hasEventSelected) {
          return ScanPageBodyContent(event: authProvider.currentEvent!);
        }
        return _buildEventsList(eventProvider);
      case NavItem.guests:
        if (authProvider.hasEventSelected) {
          return GuestsListPageContent(event: authProvider.currentEvent!);
        }
        return _buildEventsList(eventProvider);
      case NavItem.stats:
        if (authProvider.hasEventSelected) {
          return StatisticsPageContent(event: authProvider.currentEvent!);
        }
        return _buildEventsList(eventProvider);
    }
  }

  Widget _buildEventsList(EventProvider eventProvider) {
    return Column(
      children: [
        if (isOffline)
          Container(
            width: double.infinity,
            margin: const EdgeInsets.all(12),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.warning.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: AppColors.warning.withValues(alpha: 0.4),
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.wifi_off_rounded, size: 18, color: AppColors.warning),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'MODE HORS-LIGNE – SYNCHRONISATION EN ATTENTE',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: AppColors.warning,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ],
            ),
          ),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'ÉVÉNEMENTS ACTIFS',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: AppColors.orange,
                        letterSpacing: 1.2,
                      ),
                    ),
                    if (eventProvider.events != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.greyLight.withValues(alpha: 0.3),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '${eventProvider.events!.length}',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: AppColors.grey,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 14),
                if (eventProvider.isLoading)
                  const Expanded(
                    child: Center(
                      child: CircularProgressIndicator(color: AppColors.orange),
                    ),
                  ),
                if (eventProvider.error != null)
                  Expanded(
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.error_outline_rounded,
                            size: 64,
                            color: AppColors.warning.withValues(alpha: 0.5),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Erreur lors du chargement des événements',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppColors.white,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            child: Text(
                              '${eventProvider.error}',
                              textAlign: TextAlign.center,
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 13,
                                color: AppColors.grey,
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton.icon(
                            onPressed: _loadUserEvents,
                            icon: const Icon(Icons.refresh_rounded, size: 18),
                            label: const Text('Réessayer'),
                          ),
                        ],
                      ),
                    ),
                  ),
                if (!eventProvider.isLoading && eventProvider.error == null)
                  if (eventProvider.events == null ||
                      eventProvider.events!.isEmpty)
                    Expanded(
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.event_available_rounded,
                              size: 64,
                              color: AppColors.grey.withValues(alpha: 0.4),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Aucun événement disponible',
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 17,
                                fontWeight: FontWeight.bold,
                                color: AppColors.white,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Vos événements créés s\'afficheront automatiquement ici',
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 13,
                                color: AppColors.grey,
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    Expanded(
                      child: ListView.builder(
                        itemCount: eventProvider.events!.length,
                        padding: const EdgeInsets.only(bottom: 24),
                        itemBuilder: (context, index) {
                          final event = eventProvider.events![index];
                          return EventCard(
                            event: event,
                            onScanPressed: () => _onEventSelected(event),
                            onGuestsPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => GuestsListPage(event: event),
                                ),
                              );
                            },
                            onStatsPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => StatisticsPage(event: event),
                                ),
                              );
                            },
                          );
                        },
                      ),
                    ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

