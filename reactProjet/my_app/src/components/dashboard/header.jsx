import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, HelpCircle, Plus, Zap, BellIcon, XIcon, CheckCircleIcon, TrashIcon, Trash2Icon, BellOffIcon, LayoutDashboard, Calendar, Settings } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import EventForm from './event/eventForm';
import { useAuthContext } from '../../context/AuthContext.jsx';
import {
  getUserNotifications,
  markAllNotificationsRead,
  deleteNotification,
  deleteNotifications,
  deleteAllNotifications
} from '../../services/notificationService';

const navItemsList = [
  { name: 'Accueil', key: 'home' },
  { name: "Vue d'ensemble", key: 'vue' },
  { name: 'Événements', key: 'evenement' },
  { name: 'Paramètres', key: 'parametres' },
];

const Header = ({ activeSection, onSectionChange, onAvatarClick }) => {
  const navigate = useNavigate();
  const { user, token } = useAuthContext();
  const [tooltip, setTooltip] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [displayedNotifications, setDisplayedNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { eventId: routeEventId } = useParams();
  
  const markAllRead = async () => {
    const userId = user?._id || user?.id;
    if (!userId || !token) return;

    try {
      await markAllNotificationsRead(userId, token);
      setNotifications((prev) => prev.map((notification) => ({
        ...notification,
        isRead: true,
      })));
      setNotificationCount(0);
    } catch (error) {
      console.error('Impossible de marquer les notifications lues', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    const userId = user?._id || user?.id;
    if (!userId || !token) return;

    try {
      await deleteNotification(notificationId, userId, token);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      setSelectedNotifications((prev) => prev.filter((id) => id !== notificationId));
      setNotificationCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Impossible de supprimer la notification', error);
    }
  };

  const handleDeleteAllNotifications = async () => {
    const userId = user?._id || user?.id;
    if (!userId || !token) return;

    try {
      await deleteAllNotifications(userId, token);
      setNotifications([]);
      setSelectedNotifications([]);
      setNotificationCount(0);
    } catch (error) {
      console.error('Impossible de supprimer toutes les notifications', error);
    }
  };

  const handleNavClick = (item) => {
    if (item.key === 'home') {
      navigate('/');
    } else {
      navigate(`/dashboard/${item.key}`);
      if (onSectionChange) {
        onSectionChange(item.key);
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    let intervalId;

    const fetchNotifications = async () => {
      const userId = user?._id || user?.id;
      if (!userId) return;
      try {
        const list = await getUserNotifications(userId, token);
        if (!mounted) return;
        let shown = list;
        if (routeEventId) {
          shown = list.filter((n) => {
            try {
              return n.referenceType === 'event' && String(n.referenceId) === String(routeEventId);
            } catch (e) {
              return false;
            }
          });
        }

        const unreadCount = shown.filter((n) => n.isRead !== true).length;
        setNotificationCount(unreadCount);
        setNotifications(list);
        setDisplayedNotifications(shown);
      } catch (error) {
        console.error('Impossible de charger les notifications', error);
      }
    };

    fetchNotifications();
    intervalId = setInterval(fetchNotifications, 30000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [user, token, routeEventId]);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 border-b border-gray-200/80 shadow-xs font-sans">
      <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between gap-5">
        
        {/* LOGO */}
        <div 
          onClick={() => handleNavClick({ key: 'home' })}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF5005] to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
            <Zap size={16} className="fill-white" />
          </div>
          <div className="flex items-center text-base font-black tracking-tight text-gray-900">
            <span>ARSHI</span>
            <span className="text-[#FF5005] ml-0.5">EVENT</span>
          </div>
        </div>

        {/* NAVIGATION TABS WITH GLIDING INDICATOR */}
        <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 p-1 rounded-full border border-gray-200/60">
          {navItemsList.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item)}
                className={`relative px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
                  isActive ? 'text-[#FF5005]' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-white rounded-full shadow-sm"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <span className="relative z-10">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* SEARCH BAR */}
        <div className="flex-1 max-w-xs relative hidden lg:block">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
            isSearchFocused ? 'text-[#FF5005]' : 'text-gray-400'
          }`} />
          <input
            type="text"
            placeholder="Rechercher..."
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`w-full pl-9 pr-4 py-2 bg-gray-100/80 border rounded-full text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all ${
              isSearchFocused ? 'border-[#FF5005] ring-2 ring-[#FF5005]/15' : 'border-gray-200/80'
            }`}
          />
        </div>

        {/* ACTIONS & PROFILE */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* CTA Create Event */}
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -4px rgba(255, 80, 5, 0.35)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/dashboard/evenement/create')}
            className="bg-[#FF5005] hover:bg-[#ff6220] text-white px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-orange-500/25 cursor-pointer transition-all"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Créer</span>
          </motion.button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition cursor-pointer relative"
            >
              <Bell size={18} />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FF5005] text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700">Notifications</span>
                    <button 
                      onClick={markAllRead}
                      className="text-[10px] font-bold text-[#FF5005] hover:underline cursor-pointer"
                    >
                      Tout marquer comme lu
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {displayedNotifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-400">
                        Aucune nouvelle notification
                      </div>
                    ) : (
                      displayedNotifications.map((notif) => (
                        <div key={notif._id} className={`p-3.5 hover:bg-gray-50 transition text-left ${notif.isRead ? 'opacity-70' : 'bg-orange-50/20'}`}>
                          <div className="flex justify-between items-start">
                            <h5 className="text-xs font-bold text-gray-900">{notif.title}</h5>
                            <button 
                              onClick={() => handleDeleteNotification(notif._id)}
                              className="text-gray-300 hover:text-red-500 transition"
                            >
                              <XIcon size={12} />
                            </button>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Avatar */}
          <div 
            onClick={onAvatarClick}
            className="w-8 h-8 rounded-full bg-[#0B1727] text-white font-bold flex items-center justify-center text-xs border border-gray-200 shadow-sm cursor-pointer hover:scale-105 transition-transform"
          >
            {user?.first_name ? user.first_name[0].toUpperCase() : 'A'}
          </div>

        </div>

      </div>

    </header>
  );
};

export default Header;