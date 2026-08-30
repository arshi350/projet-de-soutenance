import React from 'react';
import { useParams } from 'react-router-dom';
import InvitationState from '../../../components/dashboard/event/manageEvent/invitations/invitationState';

const Invitations = ({ eventInfo }) => {
  const { eventId } = useParams();

  return (
    <section className="pt-6 pb-12">
      <InvitationState eventInfo={eventInfo} eventId={eventId} />
    </section>
  );
};

export default Invitations;
