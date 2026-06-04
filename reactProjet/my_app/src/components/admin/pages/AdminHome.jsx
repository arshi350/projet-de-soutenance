import React from 'react';

const AdminHome = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900 mb-3">Accueil administrateur</h1>
      <p className="text-sm text-slate-600">
        Cette page affiche un aperçu rapide et les principaux raccourcis pour l'administration.
      </p>
    </div>
  );
};

export default AdminHome;
