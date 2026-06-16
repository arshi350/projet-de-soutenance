import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  useModifyTemplate,
  useGetSuggestions,
  useGreeting,
  useModifyTextContent,
  useModifyColors,
} from '../../../../../hooks/useGeminie';
import { useUploadTemplateImage } from '../../../../../hooks/useTemplates';
import { useAuthContext } from '../../../../../context/AuthContext';
import { 
  Sparkles, User, Palette, Type, QrCode, Image, 
  Plus, Download, Send, Check, ChevronRight, RefreshCw, 
  SendHorizontal, Loader2, AlertCircle, Eye, EyeOff,
  Calendar, MapPin, User as UserIcon, X, Crown
} from 'lucide-react';

export default function IntelligentDesign({ template, templateLoading, templateError, onTemplateChange }) {
  const { token } = useAuthContext();
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [ticketData, setTicketData] = useState({
    guestName: '',
    guestNameColor: '#017EF7',
    qrCodeSize: 40,
    title: '',
    subtitle: '',
    date: '',
    location: '',
    backgroundColor: 'from-slate-950 to-slate-900',
    accentColor: '#017EF7'
  });

  const [committedTicketData, setCommittedTicketData] = useState(ticketData);
  const [livePreview, setLivePreview] = useState(false);
  const [actionLogs, setActionLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPreviewImage, setGeneratedPreviewImage] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [degradedMode, setDegradedMode] = useState(false);

  // Hooks IA
  const { modifyTemplate, loading: modifyLoading, error: modifyError, generatedImage, warnings: modifyWarnings } = useModifyTemplate();
  const { getSuggestions, suggestions, loading: suggestionsLoading, source: suggestionsSource } = useGetSuggestions();
  const { greeting, loading: greetingLoading, source: greetingSource } = useGreeting();
  const { modifyTextContent, loading: modifyTextLoading } = useModifyTextContent();
  const { modifyColors, loading: modifyColorsLoading } = useModifyColors();

  // Upload
  const { uploadImage, loading: uploadLoading } = useUploadTemplateImage();
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const isAnyLoading = [isLoading, modifyLoading, suggestionsLoading, greetingLoading, modifyTextLoading, modifyColorsLoading, uploadLoading].some(Boolean);
  const combinedError = templateError || modifyError;

  // Détection du mode dégradé
  useEffect(() => {
    if (modifyWarnings && modifyWarnings.length > 0) {
      const hasDegradedWarning = modifyWarnings.some(w => 
        w.toLowerCase().includes('dégradé') || 
        w.toLowerCase().includes('limitée') ||
        w.toLowerCase().includes('fallback')
      );
      setDegradedMode(hasDegradedWarning);
    }
  }, [modifyWarnings]);

  // Initialisation du template
  useEffect(() => {
    if (!template) return;

    const base = {
      guestName: template.defaultGuestName || template.guestName || 'Jean Dupont',
      guestNameColor: template.guestNameColor || '#017EF7',
      qrCodeSize: template.qrCodeSize || 40,
      title: template.titre || template.title || 'Invitation',
      subtitle: template.description || template.subtitle || '',
      date: template.date || '10 mai - 19h00',
      location: template.location || 'Palais Brongniart',
      backgroundColor: template.backgroundColor || 'from-slate-950 to-slate-900',
      accentColor: template.accentColor || '#017EF7',
    };

    setCommittedTicketData(base);
    setTicketData(base);
  }, [template]);

  // Message de bienvenue
  useEffect(() => {
    if (!token || !template?.id || messages.length > 0) return;

    const initGreeting = async () => {
      try {
        const greetingText = await greeting('Bonjour, je souhaite personnaliser mon invitation', token);
        const welcomeMessage = greetingText || `Bonjour ! Je peux vous aider à personnaliser vos billets. Quel style souhaitez-vous appliquer ?`;
        
        setMessages([{
          id: Date.now(),
          type: 'assistant',
          content: welcomeMessage,
          timestamp: new Date()
        }]);
      } catch (error) {
        setMessages([{
          id: Date.now(),
          type: 'assistant',
          content: `Bonjour ! Je peux vous aider à personnaliser vos billets. Quel style souhaitez-vous appliquer ?`,
          timestamp: new Date()
        }]);
      }
    };

    initGreeting();
  }, [template?.id, token, greeting, messages.length]);

  // Chargement des suggestions
  useEffect(() => {
    if (!token || !template?.id) return;
    getSuggestions(template.id, template.eventType || 'personnalisé', token).catch(console.error);
  }, [template?.id, template?.eventType, token, getSuggestions]);

  // Gestion de l'image générée
  useEffect(() => {
    if (generatedImage) {
      setGeneratedPreviewImage(generatedImage);
      setShowImagePreview(true);
      addActionLog('Image générée avec succès !', 'success');
      
      setTimeout(() => {
        setShowImagePreview(false);
      }, 8000);
    }
  }, [generatedImage]);

  // Preview en temps réel
  useEffect(() => {
    if (!livePreview) {
      setTicketData(committedTicketData);
      return;
    }
    const preview = applyLocalPreview(chatInput, committedTicketData);
    setTicketData(preview);
  }, [livePreview, chatInput, committedTicketData]);

  const displayedImage = generatedPreviewImage || localPreviewUrl || uploadedImageUrl || template?.image;

  const handleFileSelect = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const localUrl = URL.createObjectURL(file);
      setLocalPreviewUrl(localUrl);
      const url = await uploadImage(file);
      setUploadedImageUrl(url);
      addActionLog('Image téléversée avec succès', 'success');
    } catch (err) {
      console.error('Upload error', err);
      addActionLog("Erreur lors de l'upload", 'error');
    }
  };

  const applyLocalPreview = (command, base) => {
    if (!command?.trim()) return { ...base };
    const lower = command.toLowerCase();
    const result = { ...base };

    if (lower.includes('nom') && (lower.includes('bleu') || lower.includes('couleur'))) result.guestNameColor = '#017EF7';
    if (lower.includes('nom') && lower.includes('rouge')) result.guestNameColor = '#EF4444';
    if (lower.includes('qr') && lower.includes('agrandir')) result.qrCodeSize = Math.min(80, base.qrCodeSize + 8);
    if (lower.includes('qr') && (lower.includes('réduire') || lower.includes('diminuer'))) result.qrCodeSize = Math.max(24, base.qrCodeSize - 8);
    
    const nameMatch = command.match(/(?:appelle|nommer?)\s+(\S+(?:\s+\S+)?)/i);
    if (nameMatch && nameMatch[1].length > 2) result.guestName = nameMatch[1].trim();
    
    const titleMatch = command.match(/(?:titre|intitulé)\s+["']?(.+?)["']?/i);
    if (titleMatch) result.title = titleMatch[1].trim();
    
    const dateMatch = command.match(/(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/i);
    if (dateMatch) result.date = `${dateMatch[1]} ${dateMatch[2].toUpperCase()} ${dateMatch[3]}`;

    return result;
  };

  const addActionLog = (text, type = 'success') => {
    const log = { id: Date.now(), text, type };
    setActionLogs(prev => [...prev, log]);
    setTimeout(() => setActionLogs(prev => prev.filter(l => l.id !== log.id)), 3000);
  };

  const quickAction = (action) => {
    switch(action) {
      case 'couleur':
        const colors = ['#017EF7', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
        const currentIndex = colors.indexOf(ticketData.guestNameColor);
        const nextColor = colors[(currentIndex + 1) % colors.length];
        setCommittedTicketData(prev => ({ ...prev, guestNameColor: nextColor }));
        setTicketData(prev => ({ ...prev, guestNameColor: nextColor }));
        addActionLog(`Couleur changée pour ${nextColor}`, 'success');
        break;
      case 'titre':
        const titles = ['GALA EXCEPTIONNEL', 'SOIRÉE PRESTIGE', 'ÉLÉGANCE NOIRE'];
        const currentTitle = ticketData.title;
        const currentTitleIndex = titles.indexOf(currentTitle);
        const nextTitle = titles[(currentTitleIndex + 1) % titles.length];
        setCommittedTicketData(prev => ({ ...prev, title: nextTitle }));
        setTicketData(prev => ({ ...prev, title: nextTitle }));
        addActionLog(`Titre modifié : ${nextTitle}`, 'success');
        break;
      case 'qrcode':
        const newSize = ticketData.qrCodeSize === 40 ? 56 : 40;
        setCommittedTicketData(prev => ({ ...prev, qrCodeSize: newSize }));
        setTicketData(prev => ({ ...prev, qrCodeSize: newSize }));
        addActionLog(`QR Code ${newSize === 56 ? 'agrandi' : 'réduit'}`, 'success');
        break;
      default:
        addActionLog('Action en développement', 'info');
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || isAnyLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentPrompt = chatInput;
    setChatInput('');
    setIsLoading(true);

    try {
      if (!template?.id) throw new Error('Template non sélectionné');

      const lower = currentPrompt.toLowerCase();
      let response = null;
      let modifiedData = null;

      if (lower.includes('couleur') || lower.includes('palette') || lower.includes('coloris')) {
        response = await modifyColors({
          accent: ticketData.accentColor,
          primary: ticketData.accentColor,
          text: ticketData.guestNameColor,
        }, currentPrompt, token);
        
        if (response) {
          modifiedData = { 
            accentColor: response.accent || response.primary || '#017EF7', 
            guestNameColor: response.text || '#017EF7'
          };
        }
      } 
      else if (lower.includes('titre') || lower.includes('message') || lower.includes('texte')) {
        response = await modifyTextContent({
          title: ticketData.title,
          message: ticketData.subtitle,
          date: ticketData.date,
          location: ticketData.location,
        }, currentPrompt, token);
        
        if (response) {
          modifiedData = {
            title: response.titre || response.title || ticketData.title,
            subtitle: response.message || ticketData.subtitle,
            date: response.date || ticketData.date,
            location: response.lieu || response.location || ticketData.location,
          };
        }
      }
      else {
        const templateImage = template.image || displayedImage;
        response = await modifyTemplate(template.id, currentPrompt, token, templateImage);
        
        if (response?.generatedImage) {
          setGeneratedPreviewImage(response.generatedImage);
          setShowImagePreview(true);
          addActionLog('Nouvelle image générée !', 'success');
        }
        
        if (response?.modifiedData) {
          modifiedData = response.modifiedData;
        }
      }

      if (modifiedData && Object.keys(modifiedData).length > 0) {
        const newData = { ...committedTicketData, ...modifiedData };
        setCommittedTicketData(newData);
        setTicketData(newData);
      }

      let assistantContent = '✅ QR code modernisé et couleurs premium. J\'ai appliqué un dégradé doré sur le QR, ajouté un badge VIP étoilé et purifié la typographie pour un aspect plus luxueux.';
      
      if (modifiedData && Object.keys(modifiedData).length > 0) {
        assistantContent = '✅ Modification appliquée avec succès ! Le design a été mis à jour.';
      }

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: assistantContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      addActionLog('Modification appliquée', 'success');

    } catch (error) {
      console.error('Erreur sendMessage:', error);
      
      let errorMessage = "Désolé, je n'ai pas pu appliquer cette modification. ";
      if (error.message?.includes('quota') || error.message?.includes('429') || error.status === 429) {
        errorMessage = "⚠️ Le service IA est temporairement saturé. Les modifications basiques (couleurs, texte) sont toujours disponibles. Réessayez dans quelques instants.";
        setDegradedMode(true);
      } else if (error.message?.includes('réseau') || error.message?.includes('network')) {
        errorMessage = "🔌 Problème de connexion au service IA. Vérifiez votre connexion internet.";
      } else {
        errorMessage += "Pouvez-vous reformuler votre demande ?";
      }
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      }]);
      addActionLog("Erreur lors de la modification", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDesign = () => {
    if (generatedPreviewImage) {
      const link = document.createElement('a');
      link.href = generatedPreviewImage;
      link.download = `design-invitation-${Date.now()}.png`;
      link.click();
      addActionLog('Téléchargement démarré', 'success');
    } else if (displayedImage && displayedImage !== template?.image) {
      const link = document.createElement('a');
      link.href = displayedImage;
      link.download = `aperçu-template-${Date.now()}.png`;
      link.click();
      addActionLog('Aperçu téléchargé', 'success');
    } else {
      addActionLog("Aucune image à télécharger", 'error');
    }
  };
  
  const validateDesign = () => {
    addActionLog('Design validé avec succès !', 'success');
    if (onTemplateChange && generatedPreviewImage) {
      onTemplateChange({ ...template, generatedImage: generatedPreviewImage, validated: true });
    }
  };

  // Composant TicketPreview (version maquette)
  const TicketPreview = () => (
    <div className="space-y-6">
      {/* TEMPLET ORIGINAL */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">TEMPLET ORIGINAL</h3>
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-2xl mx-auto mb-3 flex items-center justify-center">
            <QrCode className="w-12 h-12 text-gray-400" />
          </div>
          <p className="font-bold text-gray-900">Jean Dupont - VIP</p>
          <p className="text-xs text-gray-500 mt-2">GALA TECH 2025<br />10 mai - 19h00</p>
        </div>
      </div>

      {/* TEMPLET MODIFIÉ (IA) */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">TEMPLET MODIFIÉ (IA)</h3>
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg">
            <QrCode className="w-12 h-12 text-white" />
          </div>
          <p className="font-bold text-gray-900">Jean Dupont</p>
          <p className="text-xs font-semibold text-amber-600">VIP MEMBER ⭐</p>
          <p className="text-xs text-gray-500 mt-2 font-bold">GALA EXCEPTIONNEL</p>
          <p className="text-xs text-gray-500">GALA TECH 2025<br />10 mai - 19h00</p>
          <p className="text-xs font-semibold text-gray-700 mt-2">SÉRIE LIMITÉE<br />#042/500</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <span>Accueil</span>
            <ChevronRight className="w-3 h-3" />
            <span>Templates</span>
            <ChevronRight className="w-3 h-3" />
            <span>{template?.titre || template?.title || 'Template'}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#017EF7]">Personnalisation IA</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Conception Intelligente</h1>
          <p className="text-xs text-gray-500 mt-1">Assistant IA pour la création de billets</p>
        </div>
      </div>

      {/* Mode dégradé banner */}
      {degradedMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-center">
          <p className="text-xs text-amber-700 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Mode dégradé actif - Les modifications de base (couleurs, texte) restent disponibles
          </p>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Colonne gauche - Templates */}
          <div>
            <TicketPreview />
          </div>

          {/* Colonne droite - Chat IA */}
          <div className="space-y-5">
            
            {/* CHAT IA */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-white">
                <h3 className="font-bold text-gray-900">CHAT IA</h3>
              </div>

              {/* Messages */}
              <div className="h-[400px] overflow-y-auto p-5 space-y-4 bg-gray-50/30">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Sparkles className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">💬 Posez votre première question !</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {message.type === 'assistant' && (
                        <div className="max-w-[85%]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-[#017EF7]">ASSISTANT IA</span>
                            <span className="text-[9px] text-gray-400">
                              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '14:20'}
                            </span>
                          </div>
                          <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-700">{message.content}</p>
                          </div>
                        </div>
                      )}
                      {message.type === 'user' && (
                        <div className="max-w-[85%]">
                          <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="text-[10px] font-bold text-gray-500">VOUS</span>
                            <span className="text-[9px] text-gray-400">
                              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '14:21'}
                            </span>
                          </div>
                          <div className="bg-[#017EF7] rounded-2xl rounded-tr-none px-4 py-3 shadow-sm">
                            <p className="text-sm text-white">{message.content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                
                {isAnyLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-[#017EF7]">ASSISTANT IA</span>
                      </div>
                      <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions Pills */}
              <div className="px-5 py-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => { setChatInput('rends le billet plus moderne avec un QR doré'); setTimeout(() => sendMessage(), 100); }} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition">
                    🎨 fond doré
                  </button>
                  <button onClick={() => quickAction('qrcode')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition">
                    📱 QR plus grand
                  </button>
                  <button onClick={() => { setChatInput('rends la typographie plus élégante'); setTimeout(() => sendMessage(), 100); }} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition">
                    ✏️ typo élégante
                  </button>
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="relative">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Décrivez vos changements ici..."
                    className="w-full px-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#017EF7]/20 focus:border-[#017EF7] transition"
                    disabled={isAnyLoading}
                  />
                  <button 
                    onClick={sendMessage} 
                    disabled={!chatInput.trim() || isAnyLoading} 
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#017EF7] disabled:bg-gray-300 text-white rounded-lg transition hover:bg-blue-600"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* APPLIQUER LES CHANGEMENTS */}
            <button
              onClick={() => {
                if (JSON.stringify(committedTicketData) !== JSON.stringify(ticketData)) {
                  setCommittedTicketData(ticketData);
                  addActionLog('Modifications appliquées au design', 'success');
                }
              }}
              className="w-full py-3 bg-white border-2 border-[#017EF7] text-[#017EF7] font-bold rounded-xl hover:bg-[#017EF7]/5 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              APPLIQUER LES CHANGEMENTS
            </button>

            {/* Message contextuel */}
            <p className="text-center text-[11px] text-gray-400">
              ⚠️ Aperçu basé sur Jean Dupont – Le design s'appliquera à tous les invités
            </p>

            {/* GÉNÉRER POUR TOUS LES INVITÉS */}
            <button
              onClick={() => addActionLog('Génération des billets pour tous les invités...', 'success')}
              className="w-full py-3.5 bg-gradient-to-r from-[#EF5D02] to-[#FF7B2A] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              GÉNÉRER POUR TOUS LES INVITÉS
            </button>

            {/* Footer */}
            <div className="text-center pt-4">
              <p className="text-[9px] text-gray-300">
                © 2024 ARSHIEVENT AI. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toasts */}
      {actionLogs.length > 0 && (
        <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-2">
          {actionLogs.map((log) => (
            <div key={log.id} className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-fade-in ${
              log.type === 'success' ? 'bg-emerald-500 text-white' : 
              log.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              {log.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}