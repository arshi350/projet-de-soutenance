import React from 'react';
import QuickStats from '../../components/dashboard/event/QuickStats';
import EventManagement from '../../components/dashboard/event/eventManagement';
import Footer from '../../components/dashboard/event/footer';

export default function Evenement() {
  return<>
    <div id='evenement' className="p-8 ">
      <QuickStats />
      <EventManagement />
      <Footer/>
    </div>
  </>
}
