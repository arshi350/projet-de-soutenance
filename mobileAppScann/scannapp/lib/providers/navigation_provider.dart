import 'package:flutter/material.dart';
import '../widgets/bottom_nav_bar.dart';
import '../models/event_model.dart';

class NavigationProvider extends ChangeNotifier {
  NavItem _currentItem = NavItem.home;
  EventModel? _selectedEvent;

  NavItem get currentItem => _currentItem;
  EventModel? get selectedEvent => _selectedEvent;

  void setCurrentItem(NavItem item) {
    _currentItem = item;
    notifyListeners();
  }

  void setSelectedEvent(EventModel? event) {
    _selectedEvent = event;
    notifyListeners();
  }

  void resetToHome() {
    _currentItem = NavItem.home;
    _selectedEvent = null;
    notifyListeners();
  }
}
