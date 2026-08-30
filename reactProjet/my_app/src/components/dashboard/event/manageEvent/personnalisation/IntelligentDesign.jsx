// IntelligentDesign.jsx - Studio de Personnalisation avec Analyse Visuelle & Retouche d'Image Gemini
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAIChat } from '../../../../../hooks/useAIChat';
import { useUploadTemplateImage } from '../../../../../hooks/useTemplates';
import { useAuthContext } from '../../../../../context/AuthContext';
import { 
  Sparkles, Download, Send, Check, ChevronRight, RefreshCw, 
  RotateCcw, Copy, Loader2, AlertCircle, 
  Crown, Database, LayoutTemplate, ArrowRight, Image as ImageIcon,
  Eraser, Wand2, Eye, QrCode, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IntelligentDesign({ template, templateLoading, templateError, onTemplateChange, eventInfo }) {
  const { token } = useAuthContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [chatInput, setChatInput] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  
  // Hook de conversation et analyse visuelle IA Gemini
  const { messages, sendMessage: sendAIMessage, resetSession, isLoading: isAILoading, isOnline } = useAIChat(
    template?.id ? `template_${template.id}` : 'studio_global'
  );

  const messagesEndRef = useRef(null);

  const [ticketData, setTicketData] = useState({
    guestName: 'Alexandre Martin',
    guestNameColor: '#FF5005',
    qrCodeSize: 40,
    title: eventInfo?.titre || eventInfo?.title || 'Invitation Officielle',
    subtitle: 'VIP PRIVILÈGE',
    date: eventInfo?.DateDebut ? new Date(eventInfo.DateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '10 mai - 19h00',
    location: eventInfo?.lieu || 'Palais des Congrès',
    backgroundColor: 'from-[#0B1727] to-slate-900',
    accentColor: '#FF5005',
    isTextRemoved: false
  });

  const [committedTicketData, setCommittedTicketData] = useState(ticketData);
  const [actionLogs, setActionLogs] = useState([]);
  const [generatedPreviewImage, setGeneratedPreviewImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Upload d'image personnalisée
  const { uploadImage, loading: uploadLoading } = useUploadTemplateImage();
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);

  // Auto-scroll vers le bas lors de l'arrivée d'un message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAILoading]);

  // Navigation vers l'onglet Templates
  const handleGoToTemplates = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', 'templates');
      return next;
    });
  };

  // Initialisation du template lorsqu'il est présent
  useEffect(() => {
    if (!template) return;

    const base = {
      guestName: template.defaultGuestName || template.guestName || 'Alexandre Martin',
      guestNameColor: template.guestNameColor || '#FF5005',
      qrCodeSize: template.qrCodeSize || 40,
      title: template.titre || template.title || eventInfo?.titre || 'Invitation',
      subtitle: template.description || template.subtitle || 'VIP MEMBER ⭐',
      date: template.date || '10 mai - 19h00',
      location: template.location || 'Palais Brongniart',
      backgroundColor: template.backgroundColor || 'from-[#0B1727] to-slate-900',
      accentColor: template.accentColor || '#FF5005',
      isTextRemoved: false
    };

    setCommittedTicketData(base);
    setTicketData(base);
    
    if (template.generatedImage) {
      setGeneratedPreviewImage(template.generatedImage);
    }
  }, [template, eventInfo]);

  const displayedImage = generatedPreviewImage || localPreviewUrl || uploadedImageUrl || template?.image;

  const addActionLog = (text, type = 'success') => {
    const log = { id: Date.now(), text, type };
    setActionLogs(prev => [...prev, log]);
    setTimeout(() => setActionLogs(prev => prev.filter(l => l.id !== log.id)), 4000);
  };

  const handleCopyMessage = (msgId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    addActionLog('Texte copié dans le presse-papier !', 'success');
    setTimeout(() => setCopiedMessageId(null), 2500);
  };

  // Envoi avec analyse multimodale et retouche d'image
  const handleSendMessage = async (textToSend) => {
    const prompt = (textToSend || chatInput).trim();
    if (!prompt || isAILoading) return;

    setChatInput('');
    
    // Image source du template à analyser
    const imageToAnalyze = displayedImage || template?.image || template?.imageUrl || null;

    addActionLog('Analyse visuelle et retouche IA en cours...', 'info');

    const result = await sendAIMessage(prompt, imageToAnalyze, committedTicketData);

    if (result) {
      if (result.modifications) {
        setCommittedTicketData(prev => {
          const updated = {
            ...prev,
            title: result.modifications.title || prev.title,
            subtitle: result.modifications.subtitle || prev.subtitle,
            guestNameColor: result.modifications.guestNameColor || prev.guestNameColor,
            accentColor: result.modifications.accentColor || prev.accentColor,
            qrCodeSize: result.modifications.qrCodeSize || prev.qrCodeSize,
            isTextRemoved: result.modifications.isTextRemoved ?? prev.isTextRemoved
          };
          setTicketData(updated);
          return updated;
        });

        if (result.modifications.isTextRemoved) {
          addActionLog('Textes localisés et supprimés de l\'image', 'success');
        } else {
          addActionLog('Design et styles ajustés par l\'IA', 'success');
        }
      }

      if (result.generatedImage) {
        setGeneratedPreviewImage(result.generatedImage);
      }
    }
  };

  const downloadDesign = () => {
    if (displayedImage) {
      const link = document.createElement('a');
      link.href = displayedImage;
      link.download = `design-invitation-${Date.now()}.png`;
      link.click();
      addActionLog('Téléchargement démarré', 'success');
    } else {
      addActionLog("Aucune image à télécharger", 'error');
    }
  };

  // Composant TicketPreview
  const TicketPreview = () => {
    if (!template || !template.id) {
      return (
        <div className="bg-white rounded-3xl p-8 shadow-xs border border-gray-200/80 flex flex-col items-center justify-center text-center min-h-[460px] space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FF5005] shadow-xs">
            <LayoutTemplate className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-sm">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">
              Aucun modèle sélectionné
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Sélectionnez un gabarit d'invitation pour activer le studio de retouche et l'analyse visuelle multimodale.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleGoToTemplates}
            className="px-6 py-3 bg-[#FF5005] hover:bg-[#ff6220] text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/25 transition flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <LayoutTemplate className="w-4 h-4" />
            <span>Choisir un modèle</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* MODÈLE ORIGINAL */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80">
          <h3 className="text-[10px] font-extrabold text-gray-400 mb-3 uppercase tracking-widest">Modèle Source</h3>
          <div className="text-center">
            {(() => {
              const originalImage = template?.image || template?.imageUrl ||
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80';
              return (
                <div className="relative w-full rounded-2xl overflow-hidden mb-3 bg-gray-100 border border-gray-200/60">
                  <img 
                    src={originalImage} 
                    alt={template?.title || 'Template'} 
                    className='w-full h-auto object-contain' 
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
              );
            })()}
            <p className="text-xs text-gray-500 font-semibold">{committedTicketData.title}<br />{committedTicketData.date}</p>
          </div>
        </div>

        {/* MODÈLE RETOUCHÉ PAR L'IA */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Rendu Retouché par l'IA</h3>
              {committedTicketData.isTextRemoved && (
                <span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                  <Eraser className="w-3 h-3" />
                  Texte supprimé
                </span>
              )}
            </div>
            <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
              <Check className="w-3 h-3" />
              Retouche active
            </span>
          </div>
          <div className="text-center">
            {(() => {
              const originalImage = template?.image || template?.imageUrl ||
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80';
              const modifiedImage = generatedPreviewImage || localPreviewUrl || uploadedImageUrl || originalImage;

              return (
                <>
                  <div className="relative w-full rounded-2xl overflow-hidden mb-3 bg-[#0B1727] shadow-lg border border-gray-800">
                    <img 
                      src={modifiedImage} 
                      alt="Aperçu modifié par l'IA" 
                      className='w-full h-auto object-contain rounded-2xl'
                      onError={(e) => {
                        e.target.src = originalImage;
                      }}
                    />
                  </div>
                  
                  <p className="font-black text-gray-900 text-base" style={{ color: committedTicketData.guestNameColor }}>
                    {committedTicketData.guestName || 'Alexandre Martin'}
                  </p>
                  <p className="text-xs font-bold mt-0.5 text-[#EFB810]">
                    {committedTicketData.subtitle || 'VIP MEMBER ⭐'}
                  </p>
                </>
              );
            })()}

            <p className="text-xs text-gray-400 mt-2 font-medium">{committedTicketData.title}<br />{committedTicketData.date}</p>
            {displayedImage && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  onClick={downloadDesign}
                  className="text-xs text-[#FF5005] hover:underline cursor-pointer font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Télécharger le visuel HD
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-left text-slate-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200/80 px-6 py-4">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-1">
            <span>Accueil</span>
            <ChevronRight className="w-3 h-3" />
            <button onClick={handleGoToTemplates} className="hover:text-gray-600 cursor-pointer">Templates</button>
            <ChevronRight className="w-3 h-3" />
            <span>{template?.titre || template?.title || 'Modèle'}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#FF5005] font-bold">Studio Retouche IA</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Studio de Retouche & Vision IA</h1>
          <p className="text-xs text-gray-400 mt-0.5">L'IA analyse l'image de votre template, localise les calques et applique vos consignes sur-mesure.</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Colonne gauche - Templates */}
          <div>
            <TicketPreview />
          </div>

          {/* Colonne droite - Chat IA Retouche */}
          <div className="space-y-5">
            
            {/* BOÎTE DE CHAT IA */}
            <div className="bg-white rounded-3xl shadow-xs border border-gray-200/80 overflow-hidden flex flex-col h-[580px]">
              
              {/* En-tête du chat */}
              <div className="px-5 py-3.5 border-b border-gray-100 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#FF5005]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-2">
                      Copilote Créatif & Vision
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        {isOnline ? 'Actif' : 'Hors ligne'}
                      </span>
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetSession}
                  disabled={isAILoading}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                  title="Réinitialiser la session"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Zone des messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30 text-xs">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.type === 'assistant' && (
                      <div className="max-w-[88%] group relative">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-extrabold text-[#FF5005]">COPILOTE CRÉATIF</span>
                        </div>
                        <div className={`bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-xs border ${
                          message.isError ? 'border-red-200 bg-red-50 text-red-700' : 'border-gray-200/80 text-gray-800'
                        }`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          
                          {message.detectedTexts && message.detectedTexts.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-gray-100">
                              <p className="text-[10px] font-bold text-gray-400 mb-1 flex items-center gap-1">
                                <Search size={11} />
                                <span>Textes détectés :</span>
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {message.detectedTexts.map((txt, idx) => (
                                  <span key={idx} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-mono">
                                    "{txt}"
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {message.type === 'user' && (
                      <div className="max-w-[85%]">
                        <div className="flex items-center justify-end gap-2 mb-1">
                          <span className="text-[10px] font-extrabold text-gray-400">VOUS</span>
                        </div>
                        <div className="bg-[#0B1727] rounded-2xl rounded-tr-none px-4 py-3 shadow-xs text-white">
                          <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isAILoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%]">
                      <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-xs border border-gray-200 flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-bold">Analyse multimodale et retouche en cours...</span>
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-[#FF5005] rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-[#FF5005] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-[#FF5005] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              <div className="px-4 py-2.5 border-t border-gray-100 bg-white">
                <div className="flex flex-wrap gap-1.5">
                  <button 
                    onClick={() => handleSendMessage('Supprime tout le texte sur cette image pour laisser le fond vierge')} 
                    className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#FF5005] rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Eraser className="w-3 h-3" />
                    <span>Supprimer les textes</span>
                  </button>
                  <button 
                    onClick={() => handleSendMessage('Adopte une finition dorée et luxueuse')} 
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-[#EFB810]" />
                    <span>Finition Or Royal</span>
                  </button>
                  <button 
                    onClick={() => handleSendMessage('Agrandis le QR code pour un scan fluide')} 
                    className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <QrCode className="w-3 h-3 text-gray-500" />
                    <span>Agrandir QR Code</span>
                  </button>
                </div>
              </div>

              {/* Saisie */}
              <div className="p-3.5 border-t border-gray-100 bg-white">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="relative flex items-center"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ex: supprime les textes sur l'affiche, passe les titres en or..."
                    className="w-full px-4 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF5005] transition font-medium"
                    disabled={isAILoading}
                  />
                  <button 
                    type="submit" 
                    disabled={!chatInput.trim() || isAILoading} 
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#FF5005] disabled:opacity-40 text-white rounded-lg transition hover:bg-[#ff6220] cursor-pointer"
                    title="Envoyer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>

            {/* APPLIQUER LES CHANGEMENTS */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (JSON.stringify(committedTicketData) !== JSON.stringify(ticketData)) {
                  setCommittedTicketData(ticketData);
                  addActionLog('Modifications appliquées au design', 'success');
                } else {
                  addActionLog('Modifications enregistrées', 'success');
                }
              }}
              className="w-full py-3 bg-white border-2 border-[#FF5005] text-[#FF5005] font-black rounded-xl hover:bg-orange-50 transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-xs shadow-xs"
            >
              <Check className="w-4 h-4" />
              Appliquer les Changements
            </motion.button>

            {/* ENREGISTRER DANS LES FAVORIS */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              disabled={isSaving || isAILoading}
              onClick={async () => {
                const imgToSave = displayedImage || template?.image || generatedPreviewImage;
                if (!imgToSave) {
                  addActionLog("Veuillez d'abord choisir un template", "error");
                  return;
                }
                try {
                  setIsSaving(true);
                  const { saveFavoriteTemplate } = await import('../../../../../services/rsvpService');
                  await saveFavoriteTemplate({
                    eventId: template?.eventId || template?._id || eventInfo?._id || null,
                    titre: ticketData.title || template?.titre || "Billet Personnalisé IA",
                    imageUrl: imgToSave,
                    prompt: chatInput || "Billet personnalisé par IA",
                    metadata: {
                      theme: "modern-luxury",
                      palette: [ticketData.guestNameColor, ticketData.accentColor],
                      aspectRatio: "16:9",
                      sourceModel: "GEMINI_VISION_RETOUCH"
                    }
                  }, token);
                  addActionLog("Modèle enregistré dans vos favoris !", "success");
                } catch (err) {
                  console.error("Erreur favori:", err);
                  addActionLog("Erreur lors de l'enregistrement", "error");
                } finally {
                  setIsSaving(false);
                }
              }}
              className="w-full py-3 bg-amber-50 border border-amber-300 text-amber-800 font-extrabold rounded-xl hover:bg-amber-100 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs uppercase tracking-wider text-xs"
            >
              <Crown className="w-4 h-4 text-[#EFB810]" />
              <span>{isSaving ? "Enregistrement..." : "Enregistrer dans mes Favoris"}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}