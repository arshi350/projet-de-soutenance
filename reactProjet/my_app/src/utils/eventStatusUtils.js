
import { useGetUserEvents } from "../hooks/useEvent";


const { events, loading, error, total, refetch } = useGetUserEvents(
    user?.id,
);


export const calculateEventStatus = (event) => {
  const now = new Date();
  
  // Récupérer les dates de début et fin
  const startDate = new Date(`${events.DateDebut}T${events.heureDebut || '00:00'}`);
  const endDate = new Date(`${events.DateFin}T${events.heureFin || '23:59'}`);
  
  // Comparer les dates
  if (now < startDate) {
    return 'en attente';
  } else if (now >= startDate && now <= endDate) {
    return 'en cours';
  } else {
    return 'termine';
  }
};
