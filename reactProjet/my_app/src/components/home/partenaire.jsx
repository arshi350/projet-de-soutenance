import React from 'react';
import { ShieldCheck, Zap, Globe, Award } from 'lucide-react';

const partners = [
  { id: 1, name: "Partner 1", icon: <ShieldCheck size={32} /> },
  { id: 2, name: "Partner 2", icon: <Zap size={32} /> },
  { id: 3, name: "Partner 3", icon: <Globe size={32} /> },
  { id: 4, name: "Partner 4", icon: <Award size={32} /> },
];

const LogosConfiance = () => {
  return (
    <section className="py-12 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="bg-blue-50/50 rounded-2xl border border-blue-100/50 p-10">
          {/* Titre */}
          <h3 className="text-center text-gray-800 text-xl font-semibold mb-10">
            Faites confiance à l'excellence
          </h3>

          {/* Grille de logos */}
          <div className="flex flex-wrap justify-around items-center gap-8 grayscale opacity-40">
            {partners.map((partner) => (
              <div 
                key={partner.id} 
                className="flex items-center justify-center p-2 hover:opacity-100 transition-opacity duration-300"
              >
                {/* Remplacement des icônes par des placeholders gris si tu n'as pas encore les images */}
                <div className="bg-gray-400 text-white p-2 rounded">
                   {partner.icon}
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