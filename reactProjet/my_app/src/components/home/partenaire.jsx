import React from 'react';
import { ShieldCheck, Zap, Globe, Award, Sparkles, Building2, Terminal, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';

const partners = [
  { id: 1, name: "TechSummit Global", icon: <Terminal size={24} />, tag: "Tech" },
  { id: 2, name: "Gala Prestige Paris", icon: <Award size={24} />, tag: "Luxe" },
  { id: 3, name: "EuroFintech Event", icon: <Zap size={24} />, tag: "Finance" },
  { id: 4, name: "World Congress Forum", icon: <Globe size={24} />, tag: "Sommet" },
  { id: 5, name: "Banque Privée & Invest", icon: <Landmark size={24} />, tag: "Institutionnel" },
  { id: 6, name: "StartUp Nation Awards", icon: <Sparkles size={24} />, tag: "Innovation" },
];

const LogosConfiance = () => {
  return (
    <section className="py-16 px-6 relative z-10 bg-[#F8FAFC] border-t border-gray-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Titre */}
        <p className="text-center text-gray-400 text-xs font-extrabold uppercase tracking-widest mb-10">
          Ils propulsent leurs événements majeurs avec <span className="text-[#FF5005]">ARSHI EVENT</span>
        </p>

        {/* Marquee Infinie */}
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="flex w-max animate-marquee gap-8 items-center py-2">
            {[...partners, ...partners, ...partners].map((partner, index) => (
              <div 
                key={`${partner.id}-${index}`} 
                className="flex items-center gap-3 bg-white px-6 py-3.5 rounded-2xl border border-gray-200/80 shadow-sm hover:border-orange-300 hover:shadow-md transition-all duration-300 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-orange-50 text-gray-500 group-hover:text-[#FF5005] flex items-center justify-center transition-colors">
                  {partner.icon}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-gray-700 group-hover:text-gray-900 transition-colors whitespace-nowrap">
                    {partner.name}
                  </div>
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {partner.tag}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default LogosConfiance;