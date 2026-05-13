
import React, { useState } from 'react';
import { 
  Search, Palette, Type, Layout, Info, Image as ImageIcon, 
  Globe, Sparkles, Wand2, Check, Smartphone, Moon, Layers,
  ChevronRight, Send, Save
} from 'lucide-react';

const Template = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('TECH - MODERNE');

  const templates = [
    { id: 1, title: 'GALA 2025', style: 'ÉLÉGANT', color: 'from-amber-900 to-black', textColor: 'text-amber-200', img: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=300' },
    { id: 2, title: 'TECH 2025', style: 'MODERNE', color: 'from-blue-600 to-blue-900', isNew: true, img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=300' },
    { id: 3, title: 'AFTERWORK', style: 'DÉTENDU', color: 'from-orange-400 to-orange-600', img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=300' },
    { id: 4, title: 'WEBINAR', style: 'SIMPLE', color: 'bg-white', textColor: 'text-slate-800', border: 'border-slate-200', img: 'https://images.unsplash.com/photo-1591115765373-520b7a21769b?auto=format&fit=crop&q=80&w=300' },
    { id: 5, title: 'PREMIUM', style: 'LUXE', color: 'from-slate-800 to-slate-950', gold: true, img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=300' },
    { id: 6, title: 'FESTIF', style: 'COLORÉ', color: 'from-purple-500 via-pink-500 to-orange-400', img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=300' },
    { id: 7, title: 'CORPORATE', style: 'SOBRE', color: 'from-slate-700 to-slate-900', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=300' },
    { id: 8, title: 'MINIMAL', style: 'CHIC', color: 'bg-slate-50', textColor: 'text-slate-400', img: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=300' },
  ];

  const customizationItems = [
    { icon: <Palette size={18} />, label: 'Couleurs' },
    { icon: <Type size={18} />, label: 'Typographie' },
    { icon: <Layout size={18} />, label: 'Mise en page' },
    { icon: <Info size={18} />, label: 'Informations' },
    { icon: <ImageIcon size={18} />, label: 'Médias' },
    { icon: <Globe size={18} />, label: 'Langues' },
  ];

  return (
    <div id='template' className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 lg:p-8">
      {/* Search Header */}
      <div className="max-w-7xl mx-auto flex justify-end mb-8">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un template..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT & CENTER CONTENT */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Main Title */}
          <section>
            <h1 className="text-3xl font-bold mb-2">Bibliothèque d'Invitations</h1>
            <p className="text-slate-500">Gérez et personnalisez les invitations pour votre événement de prestige.</p>
            
            {/* Template Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {templates.map((t) => (
                <div key={t.id} className="group cursor-pointer">
                  <div className={`relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border ${t.border || 'border-transparent'} transition-transform hover:scale-[1.02]`}>
                    <img src={t.img} alt={t.title} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${t.color} flex flex-col items-center justify-center p-4 text-center`}>
                      {t.isNew && <span className="absolute top-3 right-3 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg animate-pulse">NEW</span>}
                      <h3 className={`text-sm font-bold tracking-wider ${t.textColor || 'text-white'}`}>{t.title}</h3>
                      <div className="h-px w-8 bg-current opacity-30 my-2"></div>
                      <p className={`text-[10px] opacity-70 ${t.textColor || 'text-white'}`}>{t.style}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-bold text-slate-800">{t.title.split(' ')[0]} - <span className="text-slate-400 font-medium">{t.style}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Advanced Customization */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-orange-500">
                <Layers size={20} />
              </div>
              <h2 className="text-xl font-bold">Personnalisation Avancée</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {customizationItems.map((item, idx) => (
                <button key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 group-hover:text-blue-500 transition-colors">{item.icon}</span>
                    <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT SIDEBAR (AI Assistant) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-8">
            
            {/* AI Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <Sparkles size={20} fill="currentColor" className="opacity-20" />
              </div>
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  Assistant IA <span className="text-slate-300 font-normal">-</span> <span className="text-slate-400 font-medium">Modération</span>
                </h2>
              </div>
            </div>

            {/* Selected Info */}
            <div className="mb-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Template Actuel</p>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">TECH - MODERNE</h4>
                    <p className="text-[10px] text-slate-400">Dernier ajout : il y a 2h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Preview Card */}
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl mb-8 group">
              <img 
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=500" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Preview"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-blue-600/40 via-transparent to-blue-900/90 flex flex-col items-center justify-center p-8 text-center text-white">
                <div className="mb-auto">
                  <h2 className="text-4xl font-black tracking-tighter mb-1">GALA TECH 2025</h2>
                  <p className="text-[10px] tracking-[0.3em] uppercase opacity-80 font-bold">Innovation & Excellence</p>
                </div>
                <div className="mt-auto space-y-4">
                  <div className="flex flex-col items-center">
                    <div className="h-px w-12 bg-white/40 mb-4"></div>
                    <p className="text-xs font-bold">15 MAI 2025</p>
                    <p className="text-[10px] opacity-60 uppercase">Palais des Congrès, Paris</p>
                  </div>
                </div>
              </div>
            </div>

            {/* IA Prompt Input */}
            <div className="mb-8">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                    Prompt IA
                    <Wand2 size={12} className="text-blue-500" />
                </p>
                <div className="relative">
                    <textarea 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 min-h-[80px] resize-none"
                        defaultValue="Rends ce template plus moderne avec des couleurs tech"
                    />
                    <button className="absolute bottom-3 right-3 p-1.5 bg-blue-600 text-white rounded-lg shadow-lg">
                        <Check size={14} />
                    </button>
                </div>
            </div>

            {/* Options Switches */}
            <div className="space-y-3 mb-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Options rapides</p>
                <div className="flex flex-wrap gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold border border-blue-100">
                        <Check size={12} /> Améliorer texte
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold border border-blue-100">
                        <Check size={12} /> Palette couleurs
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[10px] font-bold border border-slate-100">
                        <Smartphone size={12} /> Mobile
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[10px] font-bold border border-slate-100">
                        <Moon size={12} /> Version sombre
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[10px] font-bold border border-slate-100">
                        <Layers size={12} /> 3 variantes
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-orange-200 active:scale-[0.98]">
                    Appliquer les changements
                </button>
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-xs transition-all active:scale-[0.98]">
                        <Save size={14} /> Enregistrer
                    </button>
                    <button className="flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 rounded-2xl text-xs transition-all active:scale-[0.98]">
                        <Send size={14} /> Tester envoi
                    </button>
                </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Template;
