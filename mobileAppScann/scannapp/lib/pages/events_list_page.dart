import 'package:arshievent_scan/models/event_model.dart';
import 'package:flutter/material.dart';
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

    // Récupérer l'ID de l'utilisateur connecté
    final userId = authProvider.userId;
    final token = authProvider.token;

    if (userId == null) {
      // Si userId est null, essayer de le restaurer depuis le stockage
      await authProvider.initializeAuth();
      final newUserId = authProvider.userId;
      final newToken = authProvider.token;

      if (newUserId != null && newToken != null) {
        // Assurer que le token est défini dans ApiService
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
        // Afficher un message d'erreur
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
      // Assurer que le token est défini dans ApiService
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

    // Si aucun événement sélectionné, afficher un message
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

    // Changer l'onglet actif sans naviguer
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
      appBar: CustomAppBar(
        title: appBarTitle,
        showBackButton: false,
        action: _currentTab == NavItem.home
            ? IconButton(
                icon: const Icon(Icons.settings_outlined),
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
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: AppColors.warning.withOpacity(0.1),
            child: const Row(
              children: [
                Icon(Icons.wifi_off, size: 16, color: AppColors.warning),
                SizedBox(width: 8),
                Text(
                  'MODE HORS-LIGNE – SYNCHRONISATION EN ATTENTE',
                  style: TextStyle(fontSize: 12, color: AppColors.warning),
                ),
              ],
            ),
          ),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Vos événements',
                  style: TextStyle(fontSize: 14, color: AppColors.grey),
                ),
                const SizedBox(height: 16),
                if (eventProvider.isLoading)
                  const Center(child: CircularProgressIndicator()),
                if (eventProvider.error != null)
                  Expanded(
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.error_outline,
                            size: 64,
                            color: AppColors.warning.withOpacity(0.3),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Erreur lors du chargement des événements',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: AppColors.grey,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Text(
                              '${eventProvider.error}',
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 12,
                                color: AppColors.grey,
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton(
                            onPressed: _loadUserEvents,
                            child: const Text('Réessayer'),
                          ),
                        ],
                      ),
                    ),
                  ),
                if (!eventProvider.isLoading && eventProvider.error == null)
                  if (eventProvider.events == null ||
                      eventProvider.events!.isEmpty)
                    Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.event_note_outlined,
                            size: 64,
                            color: AppColors.grey.withOpacity(0.3),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Aucun événement',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                              color: AppColors.grey,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Créez un événement pour commencer',
                            style: TextStyle(
                              fontSize: 13,
                              color: AppColors.grey.withOpacity(0.7),
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    Expanded(
                      child: ListView.builder(
                        itemCount: eventProvider.events!.length,
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
