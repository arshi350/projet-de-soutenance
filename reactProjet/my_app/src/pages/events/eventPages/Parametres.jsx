import React from 'react';
import Event_parameter from '../../../components/dashboard/event/manageEvent/event_parametter';

export const Parametres = ({ eventInfo }) => {
  return (
    <section className="pt-6 pb-12 font-sans text-left">
      <div className="max-w-7xl mx-auto px-6 space-y-6">
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#FF5005] block">
            Supervision Technique
          </span>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Paramètres & Règles d'Accès
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Configurez les quotas, les horaires, les contrôles de billets et les informations de l'événement.
          </p>
        </div>

        <Event_parameter eventInfo={eventInfo} />
      </div>
    </section>
  );
};

export default Parametres;
