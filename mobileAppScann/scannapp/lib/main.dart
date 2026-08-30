// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/event_provider.dart';
import 'providers/guest_provider.dart';
import 'providers/scan_provider.dart';
import 'theme/app_theme.dart';
import 'pages/events_list_page.dart';
import 'pages/login_page.dart';

void main() {
  runApp(const MyApp()); 
}

class MyApp extends StatelessWidget {   
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => EventProvider()),
        ChangeNotifierProvider(create: (_) => GuestProvider()),
        ChangeNotifierProvider(create: (_) => ScanProvider()),
      ],
      child: MaterialApp(  
        title: 'ARSHIEVENT Scan',
        theme: AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,
        home: const _AppWrapper(),
      ),
    );
  }
}

/// Wrapper widget that initializes auth state before showing the app
class _AppWrapper extends StatefulWidget { 
  const _AppWrapper();

  @override
  State<_AppWrapper> createState() => _AppWrapperState();
}

class _AppWrapperState extends State<_AppWrapper> {
  late Future<void> _authInitFuture;

  @override
  void initState() {
    super.initState();
    // Initialize auth state from local storage on app startup
    _authInitFuture = context.read<AuthProvider>().initializeAuth();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<void>(
      future: _authInitFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        // After initialization, check auth state
        return Consumer<AuthProvider>(
          builder: (context, authProvider, _) {
            return authProvider.isAuthenticated
                ? const EventsListPage()
                : const LoginPage();
          },
        );
      },
    );
  }
}
