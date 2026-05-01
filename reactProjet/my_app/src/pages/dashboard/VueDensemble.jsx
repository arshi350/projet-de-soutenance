import React from 'react';
import DashboardStats from '../../components/dashboard/overview/stats';
import ActivitySection from '../../components/dashboard/overview/ActivitySection';
import LocationBanner from '../../components/dashboard/overview/locationBanner';

const VueDensemble = () => (
  <div className="p-8">
    <DashboardStats />
    <ActivitySection />
    <LocationBanner />
  </div>
);

export default VueDensemble;
