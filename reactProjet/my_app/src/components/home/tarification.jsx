import React from 'react';
import { 
  Check, 
  Calendar, 
  QrCode, 
  Mail, 
  Clock, 
  FileDown, 
  Users, 
  Zap, 
  Bot, 
  ScanLine, 
  BarChart3, 
  ShieldCheck, 
  Cloud, 
  UserPlus, 
  Settings,
  Star
} from 'lucide-react';

const PricingCard = ({ 
  title, 
  price, 
  features, 
  buttonText, 
  isPopular, 
  type,
  badgeColor,
  iconColor 
}) => {
  const isPremium = type === 'premium';
  
  return (
    <div className={`relative flex flex-col p-8 rounded-3xl transition-all duration-300 ${
      isPremium 
      ? 'bg-orange-500 text-white scale-105 shadow-2xl z-10' 
      : 'bg-white text-gray-600 border border-gray-100 shadow-lg'
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-md flex items-center gap-1">
          <Star size={14} className="text-orange-500 fill-orange-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500">Populaire</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg ${badgeColor}`}>
          {title}
        </span>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-5xl font-bold">{price}</span>
          {price !== "Sur devis" && <span className="text-sm opacity-80">/ mois</span>}
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-4 mb-10 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-sm font-medium">
            <span className={isPremium ? 'text-white' : iconColor}>
              {feature.icon}
            </span>
            <span className={isPremium ? 'opacity-100' : 'text-gray-500'}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* Button */}
      <button className={`w-full py-4 rounded-xl font-bold transition-all hover:scale-105 transition duration-300 cursor-pointer ${
        isPremium 
        ? 'bg-white text-orange-500 hover:bg-gray-100 shadow-lg' 
        : type === 'entreprise'
          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
          : 'bg-white text-blue-500 border-2 border-blue-500 hover:bg-blue-50'
      }`}>
        {buttonText}
      </button>
      
      {isPremium && (
        <p className="text-[10px] text-center mt-4 opacity-80">
          Sans engagement • Résiliable à tout moment
        </p>
      )}
    </div>
  );
};

export default function Tarification() {
  return (
    <section className="py-20 relative z-10 px-6 bg-gray-100 overflow-hidden">
      <div className="w-[82%] mx-auto">
        {/* Title Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Une tarification <span className="text-orange-950/40">tr</span><span className="text-orange-400">ansp</span><span className="text-orange-950/40">arente.</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Organisez vos événements Gala Tech 2025 avec l'intelligence éditoriale. 
            Des solutions adaptées de la start-up à la multinationale.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 items-center">
          
          {/* Standard */}
          <PricingCard 
            title="Standard"
            price="0 €"
            badgeColor="bg-blue-100 text-blue-600"
            iconColor="text-green-500"
            buttonText="Commencer gratuitement"
            features={[
              { icon: <Check size={16}/>, text: "Jusqu'à 100 invités" },
              { icon: <Calendar size={16}/>, text: "3 événements" },
              { icon: <QrCode size={16}/>, text: "QR basique" },
              { icon: <Mail size={16}/>, text: "Invitations par email" },
              { icon: <Clock size={16}/>, text: "Support 48h" },
              { icon: <FileDown size={16}/>, text: "Export CSV" },
            ]}
          />

          {/* Premium */}
          <PricingCard 
            title="Premium"
            price="49 €"
            type="premium"
            isPopular={true}
            badgeColor="bg-orange-400 text-white"
            buttonText="Choisir Premium"
            features={[
              { icon: <Users size={16}/>, text: "Invités/événements illimités" },
              { icon: <QrCode size={16}/>, text: "QR personnalisé" },
              { icon: <Bot size={16}/>, text: "Modèles IA" },
              { icon: <Zap size={16}/>, text: "Automatisation complète" },
              { icon: <ScanLine size={16}/>, text: "Scanner en temps réel" },
              { icon: <BarChart3 size={16}/>, text: "Analyses avancées" },
              { icon: <ShieldCheck size={16}/>, text: "Support prioritaire 24/7" },
              { icon: <Settings size={16}/>, text: "API/Webhooks" },
            ]}
          />

          {/* Entreprise */}
          <PricingCard 
            title="Entreprise"
            price="Sur devis"
            type="entreprise"
            badgeColor="bg-orange-100 text-orange-600"
            iconColor="text-blue-500"
            buttonText="Contacter les ventes"
            features={[
              { icon: <Check size={16} className="text-blue-500"/>, text: "Toutes les fonctionnalités Premium" },
              { icon: <UserPlus size={16}/>, text: "Multi-utilisateur" },
              { icon: <ShieldCheck size={16}/>, text: "Authentification SSO" },
              { icon: <ShieldCheck size={16}/>, text: "Support SLA dédié" },
              { icon: <Cloud size={16}/>, text: "Hébergement privé" },
              { icon: <Users size={16}/>, text: "Formation d'équipe" },
              { icon: <Settings size={16}/>, text: "Personnalisation complète" },
            ]}
          />

        </div>
      </div>
    </section>
  );
}