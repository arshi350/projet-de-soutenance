import React, { useState } from "react";
import Header from "../../components/dashboard/header";
import VueDensemble from "./VueDensemble";
import Evenement from "./Evenement";
import Template from "./Template";
import Parametres from "./Parametres";
import { useAuthContext } from "../../context/AuthContext";

export function Dashboard() {
  const [activeSection, setActiveSection] = useState("vue");
  const [showProfile, setShowProfile] = useState(false);

  const { user, isAuthenticated, logout } = useAuthContext();

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setShowProfile(false);
  };

  const handleAvatarClick = () => {
    setShowProfile((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
  };

  let SectionComponent = null;
  if (activeSection === "vue") SectionComponent = <VueDensemble />;
  if (activeSection === "evenement") SectionComponent = <Evenement />;
  if (activeSection === "template") SectionComponent = <Template />;
  if (activeSection === "parametres") SectionComponent = <Parametres />;

  return (
    <div className="font">
      <div className="sticky top-0 z-10">
        <Header
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          onAvatarClick={handleAvatarClick}
        />
        {showProfile && (
          <div className="absolute right-8 top-20 z-20 w-64 bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col items-center animate-fade-in">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="User"
              className="w-16 h-16 rounded-full mb-2"
            />
            <div className="text-lg font-semibold text-gray-800">{user.first_name}</div>
            <div className="text-sm text-gray-500 mb-4">{user.email}</div>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        )}
      </div>
      <div className="relative z-0">{SectionComponent}</div>
    </div>
  );
}