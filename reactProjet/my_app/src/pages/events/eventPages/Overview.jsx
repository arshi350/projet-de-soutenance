import React from 'react';
import EventStats from '../../../components/dashboard/event/manageEvent/vue_d_Ensemble/stats';
import EventAnalytics from '../../../components/dashboard/event/manageEvent/vue_d_Ensemble/EventAnalytics';
import EventActivityAndActions from '../../../components/dashboard/event/manageEvent/vue_d_Ensemble/EventActivityAndActions';

const Overview = ({ eventInfo }) => (
  <section className="pt-6 pb-12 ">
    <EventStats eventInfo={eventInfo ?? {}} />
    <EventAnalytics />
    <EventActivityAndActions />
  </section>
);

export default Overview;
