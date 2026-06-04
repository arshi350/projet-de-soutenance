import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import EventHeader from '../../components/dashboard/event/manageEvent/event_header';
import Overview from './eventPages/Overview';
import Invites from './eventPages/Invites';
import Invitations from './eventPages/Invitations';
import QRCodes from './eventPages/QRCodes';
import Templates from './eventPages/Templates';
import Parametres from './eventPages/Parametres';
import { useGetUserEvents } from '../../hooks/useEvent';
import { useAuthContext } from '../../context/AuthContext';
import { Personnalisation } from './eventPages/personnalisation';

const tabs = [
  { id: 'overview', label: "Vue d'ensemble" },
  { id: 'invites', label: 'Invités' },
  { id: 'invitations', label: 'Invitations' },
  { id: 'qrcodes', label: 'QR Codes' },
  { id: 'templates', label: 'Templates' },
  { id: 'personalisations', label: 'Personnalisation' },
  { id: 'parametres', label: 'Paramètres' }
];

const getTabIdFromParam = (tabParam) => {
  if (!tabParam) return 'overview';
  return tabs.some((tab) => tab.id === tabParam) ? tabParam : 'overview';
};

export function EventsManage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { eventId } = useParams();
  const { user, token } = useAuthContext();
  const { events, loading } = useGetUserEvents(user?._id || user?.id, token, true);
  const [eventInfo, setEventInfo] = useState(null);

  const activeTabId = useMemo(
    () => getTabIdFromParam(searchParams.get('tab')),
    [searchParams]
  );

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
      case 'invites':
        return <Invites eventInfo={eventInfo} />;
      case 'invitations':
        return <Invitations eventInfo={eventInfo} />;
      case 'qrcodes':
        return <QRCodes eventInfo={eventInfo} />;
      case 'templates':
        return <Templates eventInfo={eventInfo} />;
        case 'personalisations':
        return <Personnalisation eventInfo={eventInfo} />;
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
 