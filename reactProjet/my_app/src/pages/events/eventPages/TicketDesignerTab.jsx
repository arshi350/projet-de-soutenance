import React from 'react';
import { TicketDesignerAI } from '../../../components/dashboard/event/public/TicketDesignerAI';
import { PublicTicketShareLink } from '../../../components/dashboard/event/public/PublicTicketShareLink';
import { useParams } from 'react-router-dom';

const TicketDesignerTab = ({ eventInfo }) => {
  const { eventId } = useParams();
  const title = eventInfo?.titre || eventInfo?.title || 'Mon Événement';

  return (
    <section className="pt-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Module de Génération et Partage du Lien de Vente des Billets */}
      <PublicTicketShareLink eventId={eventId} eventTitle={title} />

      {/* Module de Configuration des Catégories et Design IA des Billets */}
      <TicketDesignerAI eventId={eventId} eventTitle={title} eventInfo={eventInfo} />
      
    </section>
  );
};

export default TicketDesignerTab;
