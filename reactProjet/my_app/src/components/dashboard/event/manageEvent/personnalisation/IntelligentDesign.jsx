import React, { useState } from 'react';
import { 
  Sparkles, User, Palette, Type, QrCode, Image, 
  Plus, Download, Send, Check, ChevronRight, RefreshCw, SendHorizontal 
} from 'lucide-react';

export default function IntelligentDesign() {
  const [chatInput, setChatInput] = useState('Peux-tu mettre le nom de l\'invité en bleu et agrandir le QR code de 20% ?');

  return (
    <div className="px-60 font flex flex-col font-sans">
      
      {/* --- SOUS-HEADER DE NAVIGATION (BREADCRUMB) --- */}
      <div className="bg-white px-8 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
          <span>Templates</span>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span>Minuit Doré</span>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="text-[#017EF7]">Personnalisation</span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
            IA en ligne
          </span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
            <RefreshCw className="w-3 h-3 text-gray-400" />
            <span>Changer de template</span>
          </button>
        </div>
      </div>

      {/* --- ZONE PRINCIPALE DE TRAVAIL --- */}
      <div className="p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Titre Absolu pour la section gauche */}
        <div className="lg:col-span-12 -mb-4">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Conception Intelligente</h1>
        </div>

        {/* --- COLONNE GAUCHE : PREVIEW DU TICKET (5/12) --- */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-[380px] bg-white rounded-[32px] p-6 shadow-xl border border-gray-100/60 flex flex-col justify-between min-h-[580px] relative overflow-hidden group">
            
            {/* Visuel Arrière-plan Imbriqué (Style Minuit Doré) */}
            <div className="absolute top-0 left-0 right-0 h-[62%] bg-slate-950 overflow-hidden rounded-t-[32px]">
              {/* Image de fond réaliste avec faisceaux dorés */}
              <img 
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80" 
                alt="Minuit Doré Background" 
                className="w-full h-full object-cover opacity-80 scale-105"
              />
              {/* Overlay dégradé doux pour fusionner vers le blanc en bas */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
            </div>

            {/* Contenu textuel sur l'image */}
            <div className="relative z-10 text-white pt-28 px-2 flex flex-col justify-end flex-1 pb-4">
              <span className="text-[9px] font-black tracking-widest text-orange-400/90 uppercase bg-black/20 backdrop-blur-md px-2 py-0.5 rounded w-max mb-1">
                BILLET PREMIUM
              </span>
              <h2 className="text-3xl font-black tracking-tight text-white uppercase drop-shadow-sm">
                Minuit Doré
              </h2>
              <p className="text-[11px] font-bold text-gray-300 tracking-wide mt-1">
                Soirée de Gala & Exposition
              </p>
            </div>

            {/* Section Infos Inférieures (Sur fond blanc) */}
            <div className="relative z-10 bg-white pt-4 px-2 space-y-8">
              
              {/* Grille Date & Lieu */}
              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Date</span>
                  <p className="text-xs font-black text-gray-800">24 JUIN 2024</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Lieu</span>
                  <p className="text-xs font-black text-gray-800 tracking-tight">GRAND PALAIS</p>
                </div>
              </div>

              {/* Bloc Nom Invité & QR Code */}
              <div className="flex items-end justify-between pt-2">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Nom de l'invité</span>
                  {/* Modifié dynamiquement en bleu suite à la demande IA */}
                  <p className="text-sm font-black text-[#017EF7] tracking-wide uppercase">
                    Julien Dupont
                  </p>
                </div>
                
                {/* QR Code Stylisé avec conteneur doux */}
                <div className="p-2 bg-gray-50 border border-gray-100 rounded-xl shadow-sm transition-transform group-hover:scale-105 duration-300">
                  <QrCode className="w-10 h-10 text-gray-800 stroke-[1.5]" />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* --- COLONNE DROITE : ASSISTANT DESIGN IA (7/12) --- */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[580px]">
          
          {/* Header de l'Assistant */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
            <div className="p-2.5 bg-[#017EF7] text-white rounded-xl shadow-sm shadow-blue-100">
              <Sparkles className="w-5 h-5 fill-white/10" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-800">Assistant Design IA</h3>
              <p className="text-[11px] font-medium text-gray-400">Prêt pour vos modifications</p>
            </div>
          </div>

          {/* Fil de discussion (Messages) */}
          <div className="flex-1 overflow-y-auto py-6 space-y-4 max-h-[340px] pr-1">
            
            {/* Message 1 : Assistant */}
            <div className="flex items-start gap-3 max-w-[85%]">
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <div className="bg-gray-50 border border-gray-100 text-xs font-medium text-gray-700 p-3.5 rounded-2xl rounded-tl-none leading-relaxed">
                Bonjour Julien ! J'ai appliqué le thème "Minuit Doré". Souhaitez-vous ajuster la couleur dominante ou ajouter un logo partenaire ?
              </div>
            </div>

            {/* Message 2 : Utilisateur */}
            <div className="flex items-start gap-3 max-w-[85%] ml-auto flex-row-reverse">
              <div className="w-7 h-7 rounded-full bg-[#017EF7] flex items-center justify-center text-white shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="bg-[#017EF7] text-white text-xs font-semibold p-3.5 rounded-2xl rounded-tr-none leading-relaxed shadow-sm">
                Peux-tu mettre le nom de l'invité en bleu et agrandir le QR code de 20% ?
              </div>
            </div>

            {/* Message 3 : Assistant avec les pilules de confirmation */}
            <div className="flex items-start gap-3 max-w-[85%]">
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <div className="space-y-2 w-full">
                <div className="bg-gray-50 border border-gray-100 text-xs font-medium text-gray-700 p-3.5 rounded-2xl rounded-tl-none leading-relaxed">
                  C'est fait ! J'ai mis à jour le style du nom et les dimensions du QR Code.
                </div>
                
                {/* Badges de confirmation d'action */}
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/60">
                    <Check className="w-3 h-3 stroke-[3]" />
                    Couleur mise à jour
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/60">
                    <Check className="w-3 h-3 stroke-[3]" />
                    QR Code redimensionné
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Outils d'ajustements rapides & Input intelligent */}
          <div className="space-y-4 pt-4 border-t border-gray-50">
            
            {/* Puces d'ajustements rapides */}
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-[11px] font-bold text-gray-600 shadow-sm transition-all">
                <Palette className="w-3.5 h-3.5 text-orange-400" /> <span>Couleur</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-[11px] font-bold text-gray-600 shadow-sm transition-all">
                <Type className="w-3.5 h-3.5 text-amber-500" /> <span>Titre</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-[11px] font-bold text-gray-600 shadow-sm transition-all">
                <QrCode className="w-3.5 h-3.5 text-slate-700" /> <span>QR Code</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-[11px] font-bold text-gray-600 shadow-sm transition-all">
                <Plus className="w-3.5 h-3.5 text-gray-500" /> <span>Logo</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-[11px] font-bold text-gray-600 shadow-sm transition-all">
                <Image className="w-3.5 h-3.5 text-emerald-500" /> <span>Illustration</span>
              </button>
            </div>

            {/* Input d'édition textuel avec bouton IA */}
            <div className="relative flex items-center">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Décrivez vos modifications..."
                className="w-full pl-4 pr-12 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#017EF7]/20 focus:border-[#017EF7] transition-all"
              />
              <button className="absolute right-2 p-2 bg-[#017EF7] hover:bg-blue-600 text-white rounded-lg shadow-md transition-all flex items-center justify-center">
                <SendHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* --- BARRE D'ACTION INFÉRIEURE FIXE --- */}
      <div className="bg-white border-t border-gray-100 px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-bold text-gray-600 shadow-sm transition-all bg-white">
          <Download className="w-4 h-4 text-gray-400" />
          <span>Télécharger PDF</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 transition-all bg-white">
            <Send className="w-4 h-4 text-gray-400" />
            <span>Envoyer</span>
          </button>
          
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2.5 bg-[#017EF7] hover:bg-blue-600 text-white text-xs font-black rounded-xl shadow-md shadow-blue-100 transition-all">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Valider</span>
          </button>
        </div>
      </div>

    </div>
  );
}