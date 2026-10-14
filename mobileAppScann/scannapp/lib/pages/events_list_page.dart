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
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _loadUserEvents();
      }
    });
  }

  Future<void> _loadUserEvents() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final eventProvider = Provider.of<EventProvider>(context, listen: false);

    final userId = authProvider.userId;
    final token = authProvider.token;

    if (token != null) {
      ApiService.setAuthToken(token);
    }

    if (authProvider.isAgent) {
      try {
        await authProvider.fetchMyAgentEvent();
      } catch (e) {
        debugPrint('Erreur chargement événement agent: $e');
      }
      return;
    }

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

  void _onEventSelected(EventModel event) async {
    final result = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => EventAccessModal(event: event),
    );

    if (result == true) {
      setState(() {
        _currentTab = NavItem.scanner;
      });
    }
  }

  void _onTabSelected(NavItem item) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    if (item == NavItem.home) {
      setState(() {
        _currentTab = NavItem.home;
      });
      return;
    }

    if (!authProvider.isEventConnected) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.red,
          duration: const Duration(seconds: 4),
          content: Text(
            'Accès verrouillé : Veuillez d\'abord vous connecter à l\'événement en saisissant le code d\'accès.',
            style: GoogleFonts.plusJakartaSans(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
          ),
          action: authProvider.currentEvent != null
              ? SnackBarAction(
                  label: 'SAISIR CODE',
                  textColor: Colors.white,
                  onPressed: () {
                    _onEventSelected(authProvider.currentEvent!);
                  },
                )
              : null,
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

    String appBarTitle = authProvider.isAgent ? 'Portail Agent de Scan' : 'Mes événements';
    if (_currentTab != NavItem.home && authProvider.hasEventSelected) {
      appBarTitle = authProvider.currentEvent?.name ?? 'Titre';
    }

    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.background : const Color(0xFFF4F6F9),
      appBar: CustomAppBar(
        title: appBarTitle,
        showBackButton: false,
        action: _currentTab == NavItem.home
            ? IconButton(
                icon: Icon(
                  Icons.settings_outlined,
                  color: isDark ? AppColors.white : AppColors.blue,
                ),
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
    if (authProvider.isAgent && _currentTab == NavItem.home) {
      return _buildAgentEventsView(authProvider);
    }

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

  Widget _buildAgentEventsView(AuthProvider authProvider) {
    final event = authProvider.currentEvent;
    final isLoading = authProvider.isAgentEventLoading;
    final agentError = authProvider.agentEventError;

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.cardBackground : Colors.white;
    final textColor = isDark ? AppColors.white : AppColors.blue;
    final subtextColor = isDark ? AppColors.grey : const Color(0xFF64748B);
    final cardBorder = isDark
        ? AppColors.white.withValues(alpha: 0.1)
        : const Color(0xFFE2E8F0);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner Agent
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.orange.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: AppColors.orange.withValues(alpha: 0.4),
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: const BoxDecoration(
                    color: AppColors.orange,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.shield_outlined,
                    color: Colors.white,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'ESPACE AGENT DE SCAN',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: AppColors.orange,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Vous êtes connecté avec votre compte Agent.',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 13,
                          color: textColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'VOTRE ÉVÉNEMENT ASSIGNÉ',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: subtextColor,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 14),

          // ÉTAT 1 : Chargement en cours
          if (isLoading)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: cardBorder),
              ),
              child: Column(
                children: [
                  const CircularProgressIndicator(color: AppColors.orange),
                  const SizedBox(height: 16),
                  Text(
                    'Chargement de votre événement...',
                    style: GoogleFonts.plusJakartaSans(
                      color: textColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            )

          // ÉTAT 2 : Erreur ou aucun événement trouvé
          else if (event == null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.red.withValues(alpha: 0.3)),
              ),
              child: Column(
                children: [
                  Icon(
                    agentError != null && agentError.contains('Erreur')
                        ? Icons.error_outline_rounded
                        : Icons.event_busy_rounded,
                    size: 48,
                    color: agentError != null && agentError.contains('Erreur')
                        ? AppColors.red
                        : AppColors.orange,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    agentError != null && agentError.contains('Erreur')
                        ? 'Erreur de chargement'
                        : 'Aucun événement assigné',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: textColor,
                    ),
                  ),
                  if (agentError != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      agentError,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 13,
                        color: subtextColor,
                      ),
                    ),
                  ],
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      onPressed: () async {
                        await authProvider.fetchMyAgentEvent();
                      },
                      icon: const Icon(Icons.refresh_rounded, size: 18),
                      label: Text(
                        'RÉESSAYER',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.orange,
                        foregroundColor: AppColors.white,
                        elevation: 2,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            )

          // ÉTAT 3 : Événement chargé avec succès
          else
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: AppColors.orange.withValues(alpha: 0.3),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.orange.withValues(alpha: 0.1),
                    blurRadius: 20,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: authProvider.isEventConnected
                              ? AppColors.green.withValues(alpha: 0.2)
                              : AppColors.orange.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          authProvider.isEventConnected ? 'ÉVÉNEMENT CONNECTÉ (ACTIF)' : 'ACCÈS VERROUILLÉ',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: authProvider.isEventConnected ? AppColors.green : AppColors.orange,
                          ),
                        ),
                      ),
                      Icon(
                        authProvider.isEventConnected ? Icons.verified_rounded : Icons.lock_outline_rounded,
                        color: authProvider.isEventConnected ? AppColors.green : AppColors.orange,
                        size: 22,
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    event.name,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: textColor,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(Icons.calendar_today_rounded, size: 16, color: subtextColor),
                      const SizedBox(width: 8),
                      Text(
                        event.formattedDate,
                        style: GoogleFonts.plusJakartaSans(fontSize: 13, color: subtextColor),
                      ),
                      const SizedBox(width: 16),
                      Icon(Icons.access_time_rounded, size: 16, color: subtextColor),
                      const SizedBox(width: 8),
                      Text(
                        event.time,
                        style: GoogleFonts.plusJakartaSans(fontSize: 13, color: subtextColor),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.location_on_outlined, size: 16, color: subtextColor),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          event.location,
                          style: GoogleFonts.plusJakartaSans(fontSize: 13, color: subtextColor),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // BOUTON PRINCIPAL (SE CONNECTER OU ACCÉDER AU SCANNER)
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        if (authProvider.isEventConnected) {
                          setState(() {
                            _currentTab = NavItem.scanner;
                          });
                        } else {
                          _onEventSelected(event);
                        }
                      },
                      icon: Icon(
                        authProvider.isEventConnected
                            ? Icons.qr_code_scanner_rounded
                            : Icons.lock_open_rounded,
                        size: 20,
                      ),
                      label: Text(
                        authProvider.isEventConnected
                            ? 'ACCÉDER À L\'INTERFACE DE SCAN'
                            : 'SE CONNECTER À L\'ÉVÉNEMENT',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: authProvider.isEventConnected ? AppColors.green : AppColors.orange,
                        foregroundColor: AppColors.white,
                        elevation: 4,
                        shadowColor: authProvider.isEventConnected ? AppColors.green : AppColors.orangeGlow,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  if (!authProvider.isEventConnected)
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isDark
                            ? AppColors.white.withValues(alpha: 0.05)
                            : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isDark
                              ? AppColors.white.withValues(alpha: 0.08)
                              : const Color(0xFFE2E8F0),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.info_outline_rounded, size: 18, color: subtextColor),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'Entrez le code d\'événement pour déverrouiller l\'accès au scanner, la liste des invités et les statistiques.',
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 11,
                                color: subtextColor,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
        ],
      ),
    );
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
                      Builder(builder: (context) {
                        final isDarkList = Theme.of(context).brightness == Brightness.dark;
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: isDarkList
                                ? AppColors.greyLight.withValues(alpha: 0.3)
                                : const Color(0xFFE2E8F0),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            '${eventProvider.events!.length}',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: isDarkList ? AppColors.grey : AppColors.blue,
                            ),
                          ),
                        );
                      }),
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
                          Builder(builder: (context) {
                            final isDarkList = Theme.of(context).brightness == Brightness.dark;
                            return Text(
                              'Erreur lors du chargement des événements',
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: isDarkList ? AppColors.white : AppColors.blue,
                              ),
                            );
                          }),
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
                            Builder(builder: (context) {
                              final isDarkList = Theme.of(context).brightness == Brightness.dark;
                              return Text(
                                'Aucun événement disponible',
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 17,
                                  fontWeight: FontWeight.bold,
                                  color: isDarkList ? AppColors.white : AppColors.blue,
                                ),
                              );
                            }),
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

