import React from 'react';
import ManageEvent from '../../../components/dashboard/event/manageEvent/ManageEvent';

const Parametres = () => (
  <section className="pt-6 pb-12">
    <div className="max-w-7xl mx-auto px-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Paramètres</h2>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <ManageEvent />
      </div>
    </div>
  </section>
);

export default Parametres;
