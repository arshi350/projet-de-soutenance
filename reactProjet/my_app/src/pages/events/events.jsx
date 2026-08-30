import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import EventHeader from '../../components/dashboard/event/manageEvent/event_header';
import Overview from './eventPages/Overview';
import Invites from './eventPages/Invites';
import Invitations from './eventPages/Invitations';
import Parametres from './eventPages/Parametres';
import { useGetUserEvents } from '../../hooks/useEvent';
import { useAuthContext } from '../../context/AuthContext';
import TicketDesignerTab from './eventPages/TicketDesignerTab';
import MarketingCampaigns from './eventPages/MarketingCampaigns';
import PollsTab from './eventPages/PollsTab';
import RemindersTab from './eventPages/RemindersTab';
import FeedbackTab from './eventPages/FeedbackTab';
import SalesAnalyticsTab from './eventPages/SalesAnalyticsTab';

// Onglets pour événements privés
const PRIVATE_TABS = [
  { id: 'overview', label: "Vue d'ensemble" },
  { id: 'invites', label: 'Invités' },
  { id: 'invitations', label: 'Invitations' },
  { id: 'polls', label: 'Sondages Pré-Événement' },
  { id: 'reminders', label: 'Relances IA' },
  { id: 'feedback', label: 'Feedback Post-Event' },
  { id: 'parametres', label: 'Paramètres' },
];

// Onglets pour événements publics (avec billetterie et suivi des ventes)
const PUBLIC_TABS = [
  { id: 'overview', label: "Vue d'ensemble" },
  { id: 'ventes', label: 'Ventes & Revenus' },
  { id: 'billetterie', label: 'Billetterie' },
  { id: 'marketing', label: 'Campagnes Marketing IA' },
  { id: 'invites', label: 'Participants / Billets' },
  { id: 'polls', label: 'Sondages Pré-Événement' },
  { id: 'feedback', label: 'Feedback & Avis IA' },
  { id: 'parametres', label: 'Paramètres' },
];

export function EventsManage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { eventId } = useParams();
  const { user, token } = useAuthContext();
  const { events, loading } = useGetUserEvents(user?._id || user?.id, token, true);
  const [eventInfo, setEventInfo] = useState(null);

  const isPublic = eventInfo?.eventType === 'public';

  const tabs = useMemo(() => {
    return isPublic ? PUBLIC_TABS : PRIVATE_TABS;
  }, [isPublic]);

  const activeTabId = useMemo(() => {
    const tabParam = searchParams.get('tab');
    if (!tabParam) return 'overview';
    return tabs.some((tab) => tab.id === tabParam) ? tabParam : 'overview';
  }, [searchParams, tabs]);

  useEffect(() => {
    if (!eventId) return;

    const stored = sessionStorage.getItem(`manageEvent_${eventId}`);
    if (stored) {
      try {
        setEventInfo(JSON.parse(stored));
        return;
      } catch {
        sessionStorage.removeItem(`manageEvent_${eventId}`);
      }
    }

    if (!loading && events.length > 0) {
      const existing = events.find((event) => event._id === eventId || event.id === eventId);
      if (existing) {
        setEventInfo(existing);
      }
    }
  }, [eventId, events, loading]);

  const eventTitle = eventInfo?.titre || eventInfo?.title || eventInfo?.name || 'Événement';
  const eventStatus = eventInfo?.status || eventInfo?.statut || eventInfo?.state || 'Statut inconnu';

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId }, { replace: true });
  };

  const renderSection = () => {
    switch (activeTabId) {
      case 'overview':
        return <Overview eventInfo={eventInfo} />;
      case 'ventes':
        return <SalesAnalyticsTab eventInfo={eventInfo} />;
      case 'marketing':
        return <MarketingCampaigns eventInfo={eventInfo} />;
      case 'invites':
        return <Invites eventInfo={eventInfo} />;
      case 'billetterie':
        return <TicketDesignerTab eventInfo={eventInfo} />;
      case 'invitations':
        return <Invitations eventInfo={eventInfo} />;
      case 'polls':
        return <PollsTab eventInfo={eventInfo} />;
      case 'reminders':
        return <RemindersTab eventInfo={eventInfo} />;
      case 'feedback':
        return <FeedbackTab eventInfo={eventInfo} />;
      case 'parametres':
        return <Parametres eventInfo={eventInfo} />;
      default:
        return <Overview eventInfo={eventInfo} />;
    }
  };

  return (
    <div className="">
      <section className="sticky top-0 z-30 bg-white">
        <EventHeader
          activeTabId={activeTabId}
          tabs={tabs}
          onTabChange={handleTabChange}
          eventTitle={eventTitle}
          eventStatus={eventStatus}
        />
      </section>
      {renderSection()}
    </div>
  );
}