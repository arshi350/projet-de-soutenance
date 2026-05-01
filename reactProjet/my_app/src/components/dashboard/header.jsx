
import React, { useState } from 'react';
import { Search, Bell, HelpCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const navItemsList = [
  { name: 'Accueil', key: 'home' },
  { name: "Vue d'ensemble", key: 'vue' },
  { name: 'Événement', key: 'evenement' },
  { name: 'Template', key: 'template' },
  { name: 'Paramètres', key: 'parametres' },
];

const Header = ({ activeSection, onSectionChange, onAvatarClick }) => {
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState('');

  const handleNavClick = (item) => {
    if (item.key === 'home') {
      navigate('/');
    } else {
      onSectionChange(item.key);
    }
  };

  return (
    <header className="flex items-center justify-between px-8 py-3 bg-white border-b border-gray-100 shadow-sm">
      {/* Logo Section */}
      <div className="flex items-center gap-1">
        <span className="text-2xl font-black tracking-tight text-gray-700">ARSHI</span>
        <span className="text-2xl font-black tracking-tight text-[#FF5005]">EVENT</span>
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-8 ml-10">
        {navItemsList.map((item) => (
          <div
            key={item.key}
            className="relative py-2 cursor-pointer"
            onClick={() => handleNavClick(item)}
          >
            <span
              className={`text-sm font-medium ${
                activeSection === item.key ? 'text-[#FF5005]' : 'text-gray-700 hover:text-[#FF5005] transition-colors duration-300'
              }`}
            >
              {item.name}
            </span>
            {activeSection === item.key && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF5005] rounded-full" />
            )}
          </div>
        ))}
      </nav>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute z-10 left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un événement..."
            className="w-[100%] pl-10 pr-4 py-2 bg-slate-100 border border-gray-200 focus:scale-105 focus:border-[#FF5005] transition duration-300 rounded-full text-sm focus:outline-none placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-6">
        <button className="bg-gradient-to-r from-[#FF5005] to-[#FF5005]/90 hover:bg-[#FC8F34]/90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
          Créer un événement
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200" />

        {/* Icons & Profile */}
        <div className="flex items-center gap-4 text-slate-400">
          <div className="relative">
            <button
              className="hover:text-slate-600 cursor-pointer transition-colors"
              onMouseEnter={() => setTooltip('Notifications')}
              onMouseLeave={() => setTooltip('')}
            >
              <Bell size={20} />
            </button>
            {tooltip === 'Notifications' && (
              <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-10 whitespace-nowrap" style={{ bottom: '-2.2rem' }}>
                Notifications
              </span>
            )}
          </div>
          <div className="relative">
            <button
              className="hover:text-slate-600 cursor-pointer transition-colors"
              onMouseEnter={() => setTooltip('Aide')}
              onMouseLeave={() => setTooltip('')}
            >
              <HelpCircle size={20} />
            </button>
            {tooltip === 'Aide' && (
              <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-10 whitespace-nowrap" style={{ bottom: '-2.2rem' }}>
                Aide
              </span>
            )}
          </div>
          <div className="relative">
            <div
              className="ml-2 w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-slate-800 flex items-center justify-center cursor-pointer"
              onClick={onAvatarClick}
              onMouseEnter={() => setTooltip('Profil')}
              onMouseLeave={() => setTooltip('')}
            >
              {/* Avatar placeholder */}
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
            {tooltip === 'Profil' && (
              <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-10 whitespace-nowrap" style={{ bottom: '-2.2rem' }}>
                Profil
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;