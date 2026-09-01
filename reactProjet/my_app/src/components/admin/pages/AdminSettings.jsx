import React, { useState, useEffect } from 'react';
import { Settings, Shield, Percent, Mail, Server, Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPlatformSettingsApi, updatePlatformSettingsApi } from '../../../services/adminSettingsService';

const AdminSettings = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    siteName: 'ARSHI EVENT',
    supportEmail: 'support@arshievent.com',
    commissionRate: 5.0,
    currency: 'FCFA',
    maintenanceMode: false,
    autoApproveEvents: true,
    whatsappNotifications: true
  });

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const res = await getPlatformSettingsApi(token);
        if (res?.settings) {
          setFormData(res.settings);
        }
      } catch (_) {}
      finally { setLoading(false); }
    };
    if (token) loadSettings();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      await updatePlatformSettingsApi(formData, token);
      setSuccessMessage('Paramètres enregistrés avec succès !');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 p-6 md:p-10 font-sans text-slate-900 max-w-5xl mx-auto text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5005]">
            Configuration Système
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 mt-0.5">
            Paramètres Plateforme
          </h1>
          <p className="text-xs text-gray-400 mt-1">Configurez les taux de commission, les règles d'approbation et la sécurité globale.</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-[#FF5005] hover:bg-[#e04400] text-white px-5 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-md shadow-orange-500/20 cursor-pointer disabled:opacity-50"
        >
          {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
          <span>Enregistrer les modifications</span>
        </button>
      </div>

      {successMessage && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} /> {successMessage}
        </motion.div>
      )}

      {errorMessage && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle size={16} /> {errorMessage}
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 pb-3">
        {[
          { id: 'general', label: 'Général', icon: <Settings size={16} /> },
          { id: 'commission', label: 'Commissions & Tarifs', icon: <Percent size={16} /> },
          { id: 'notifications', label: 'Communications', icon: <Mail size={16} /> },
          { id: 'security', label: 'Sécurité & Serveur', icon: <Shield size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gray-900 text-white shadow-xs'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
        
        {activeTab === 'general' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-2">Nom de la Plateforme</label>
              <input
                type="text"
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-[#FF5005] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-2">Email Support & Contact</label>
              <input
                type="email"
                name="supportEmail"
                value={formData.supportEmail}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-[#FF5005] outline-none transition-all"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <p className="text-xs font-extrabold text-gray-900">Approbation Automatique des Événements</p>
                <p className="text-[11px] text-gray-400">Publier les nouveaux événements sans modération préalable.</p>
              </div>
              <input
                type="checkbox"
                name="autoApproveEvents"
                checked={formData.autoApproveEvents}
                onChange={handleChange}
                className="w-5 h-5 accent-[#FF5005] rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {activeTab === 'commission' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-2">Taux de Commission Plateforme (%)</label>
              <input
                type="number"
                step="0.1"
                name="commissionRate"
                value={formData.commissionRate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-[#FF5005] outline-none transition-all"
              />
              <p className="text-[11px] text-gray-400 mt-1">Pourcentage prélevé sur la vente des billets publics.</p>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-2">Devise Système</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-[#FF5005] outline-none transition-all"
              >
                <option value="FCFA">FCFA (Franc CFA)</option>
                <option value="EUR">EUR (€ Euro)</option>
                <option value="USD">USD ($ Dollar US)</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <p className="text-xs font-extrabold text-gray-900">Relances WhatsApp Automatiques</p>
                <p className="text-[11px] text-gray-400">Envoyer des confirmations de billets par WhatsApp API.</p>
              </div>
              <input
                type="checkbox"
                name="whatsappNotifications"
                checked={formData.whatsappNotifications}
                onChange={handleChange}
                className="w-5 h-5 accent-[#FF5005] rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-2xl border border-red-100">
              <div>
                <p className="text-xs font-extrabold text-red-900">Mode Maintenance Général</p>
                <p className="text-[11px] text-red-600">Restreindre temporairement l'accès à la plateforme.</p>
              </div>
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={formData.maintenanceMode}
                onChange={handleChange}
                className="w-5 h-5 accent-red-600 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

      </form>

    </div>
  );
};

export default AdminSettings;
