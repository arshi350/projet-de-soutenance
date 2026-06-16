import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, Edit2, Trash2, Eye, 
  Users, Pencil, FileImage, AlignLeft, Sparkles, Save, Plus, ChevronDown, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { 
  useGetAllTemplates, 
  useCreateTemplate, 
  useUpdateTemplate, 
  useDeleteTemplate, 
  useUploadTemplateImage 
} from '../../../hooks/useTemplates';

// Variants d'animation pour les conteneurs
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { duration: 0.2 }
  }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const cardVariants = {
  hover: {
    y: -8,
    scale: 1.02,
    transition: { type: "spring", stiffness: 400, damping: 17 }
  },
  tap: { scale: 0.98 }
};

const Templates = () => {
  // --- HOOKS TEMPLATE ---
  const { templates, loading, error, refetch: refetchTemplates } = useGetAllTemplates();
  const { createTemplate } = useCreateTemplate();
  const { updateTemplate } = useUpdateTemplate();
  const { deleteTemplate } = useDeleteTemplate();
  const { uploadImage } = useUploadTemplateImage();

  // --- ÉTATS ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategorie, setSelectedCategorie] = useState("Tous");
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    image: "",
    titre: "",
    description: "",
    categorie: 'classique'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsPerPage = 6;

  // --- FILTRAGE DYNAMIQUE ---
  const filteredTemplates = useMemo(() => {
    return templates.filter(tmpl => {
      const matchesSearch = tmpl.titre.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategorie = selectedCategorie === "Tous" || tmpl.categorie === selectedCategorie;
      return matchesSearch && matchesCategorie;
    });
  }, [templates, searchQuery, selectedCategorie]);

  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / itemsPerPage));
  const paginatedTemplates = filteredTemplates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategorie]);

  useEffect(() => {
    setLastRefresh(new Date());
    const interval = setInterval(async () => {
      await refetchTemplates();
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchTemplates]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchTemplates();
    setLastRefresh(new Date());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // --- ACTIONS CRUD ---
  const openAddModal = () => {
    setEditingTemplate(null);
    setFormData({
      titre: "",
      image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&fit=crop",
      description: "",
      categorie: 'classique'
    });
    setFormModalOpen(true);
  };

  const openEditModal = (template, e) => {
    e.stopPropagation();
    setEditingTemplate(template);
    setFormData({
      titre: template.titre,
      image: template.image,
      description: template.description,
      categorie: template.categorie || 'classique'
    });
    setFormModalOpen(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Voulez-vous vraiment supprimer ce template ?")) return;
    try {
      await deleteTemplate(id);
      await refetchTemplates();
    } catch (err) {
      console.error('Erreur lors de la suppression du template :', err);
      alert('Impossible de supprimer le template.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = formData.image || '';
      if (formData.file) {
        imageUrl = await uploadImage(formData.file);
      }

      const payload = {
        image: imageUrl,
        titre: formData.titre,
        description: formData.description,
        categorie: formData.categorie,
      };

      if (editingTemplate) {
        const templateId = editingTemplate._id || editingTemplate.id;
        await updateTemplate(templateId, payload);
      } else {
        await createTemplate(payload);
      }

      await refetchTemplates();
      setFormModalOpen(false);
      setEditingTemplate(null);
    } catch (err) {
      console.error('Erreur lors de l\'upload ou sauvegarde du template :', err);
      alert('Erreur lors de l\'upload de l\'image ou de l\'enregistrement du template.');
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gray-100 lg:px-55 p-6 md:p-8 font-sans text-slate-800"
    >
      {/* --- HEADER --- */}
      <motion.header 
        variants={itemVariants}
        className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full mb-2 inline-block"
          >
            {templates.length} TEMPLATES DISPONIBLES
          </motion.span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bibliothèque de templates</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez, filtrez et ajustez les styles visuels mis à disposition des utilisateurs.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-md transition-all shrink-0"
          >
            <Plus size={18} /> Ajouter un template
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shrink-0"
          >
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: 0.5, ease: "linear" }}
            >
              <RefreshCw size={18} />
            </motion.div>
            Rafraîchir
          </motion.button>
        </div>
      </motion.header>

      {/* --- CONTROLS SECTION (SEARCH & FILTERS) --- */}
      <motion.div 
        variants={itemVariants}
        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5 mb-8"
      >
        {/* Search Input row */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <motion.input 
            whileFocus={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
            type="text" 
            placeholder="Rechercher un modèle de template..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Filters: Catégorie */}
        <div className="pt-2 border-t border-slate-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <label className="text-[10px] font-black tracking-wider text-gray-400 uppercase block mb-2.5">Catégorie</label>
            <motion.div 
              animate={{ opacity: 1 }}
              className="text-xs text-slate-500"
            >
              Dernière actualisation : {lastRefresh ? lastRefresh.toLocaleTimeString() : '...' }
            </motion.div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Tous", "vip", "classique"].map(val => (
              <FilterPill key={val} active={selectedCategorie === val} label={val} onClick={() => setSelectedCategorie(val)} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* --- TEMPLATES GRID CONTROLLER --- */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full bg-white border border-slate-200 rounded-3xl p-12 text-center text-gray-500"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-4"
              >
                <RefreshCw size={32} className="text-blue-500" />
              </motion.div>
              <p>Chargement des templates...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full bg-white border border-slate-200 rounded-3xl p-12 text-center text-red-500"
            >
              <p>Erreur de chargement des templates.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium"
              >
                Réessayer
              </motion.button>
            </motion.div>
          ) : paginatedTemplates.length > 0 ? (
            paginatedTemplates.map((tmpl, index) => (
              <TemplateCard
                key={tmpl._id || tmpl.id}
                template={tmpl}
                index={index}
                onPreview={setPreviewTemplate}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="col-span-full bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center text-gray-400"
            >
              <p>Aucun modèle ne correspond aux filtres de sélection appliqués.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <div className="text-sm text-slate-600">Page {currentPage} sur {totalPages}</div>
          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-50"
            >
              Précédent
            </motion.button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = index + 1;
              } else if (currentPage <= 3) {
                pageNumber = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + index;
              } else {
                pageNumber = currentPage - 2 + index;
              }
              
              return (
                <motion.button
                  key={pageNumber}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-3 py-2 rounded-xl border transition-all ${
                    pageNumber === currentPage 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {pageNumber}
                </motion.button>
              );
            })}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-50"
            >
              Suivant
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* --- MODAL 1: LARGE PREVIEW MODAL --- */}
      <AnimatePresence>
        {previewTemplate && (
          <>
            <motion.div
              key="overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-sm"
              onClick={() => setPreviewTemplate(null)}
            />
            <motion.div
              key="modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh]">
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setPreviewTemplate(null)}
                  className="absolute top-4 right-4 z-10 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full transition-colors"
                >
                  <X size={18} />
                </motion.button>
                
                {/* Viewport Side */}
                <div className="md:w-3/5 bg-slate-900 flex items-center justify-center overflow-hidden">
                  <motion.img 
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 20 }}
                    src={previewTemplate.image} 
                    alt={previewTemplate.titre} 
                    className="w-full h-full object-contain max-h-[50vh] md:max-h-[80vh]" 
                  />
                </div>

                {/* Config Specs Side */}
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="md:w-2/5 p-6 flex flex-col justify-between bg-white"
                >
                  <div>
                    <div className="flex gap-1.5 mb-2">
                      {previewTemplate.isPremium && (
                        <span className="bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">Premium</span>
                      )}
                      {previewTemplate.isNew && (
                        <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">New</span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-4">{previewTemplate.titre}</h3>

                    <div className="space-y-3.5 border-t border-slate-100 pt-4 text-sm font-semibold text-slate-600">
                      <div className="">{previewTemplate.description}</div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-400"/> 
                        Téléchargements : <span className="text-slate-900 ml-auto">{previewTemplate.downloads} fois</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Catégorie: <span className="uppercase ml-2">{previewTemplate.categorie}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-2">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => { setPreviewTemplate(null); openEditModal(previewTemplate, e); }}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                    >
                      Éditer les métadonnées
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- MODAL 2: FORM MODAL (ADD / EDIT) --- */}
      <AnimatePresence>
        {formModalOpen && (
          <>
            <motion.div
              key="form-overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-sm"
              onClick={() => setFormModalOpen(false)}
            />
            <motion.div
              key="form-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setFormModalOpen(false)} 
                  className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-all duration-200"
                >
                  <X size={20} />
                </motion.button>
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    {editingTemplate ? "Modifier le template" : "Ajouter un nouveau template"}
                  </h3>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: 48 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mt-2"
                  />
                </div>

                <motion.form 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  onSubmit={handleFormSubmit} 
                  className="space-y-5"
                >
                  {/* Titre */}
                  <div className="group">
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5 uppercase tracking-wider">
                      Titre du modèle
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required 
                        value={formData.titre}
                        onChange={(e) => setFormData({...formData, titre: e.target.value})}
                        className="w-full border border-slate-200 py-2.5 pl-4 pr-10 rounded-xl text-sm outline-none transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-slate-50/50 hover:bg-white"
                        placeholder="Ex: Cyber Neon"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Pencil size={14} className="text-slate-300" />
                      </div>
                    </div>
                  </div>

                  {/* Image */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5 uppercase tracking-wider">
                      Image descriptive
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        id="file-upload"
                        onChange={(e) => setFormData({...formData, file: e.target.files ? e.target.files[0] : null})}
                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200 cursor-pointer"
                      />
                    </div>
                    {formData.file && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg"
                      >
                        <CheckCircle2 size={14} />
                        <span>{formData.file.name}</span>
                      </motion.div>
                    )}
                    {!formData.file && formData.image && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                        <FileImage size={14} />
                        <span className="truncate">{formData.image}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5 uppercase tracking-wider">
                      Description
                    </label>
                    <div className="relative">
                      <textarea
                        required 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none h-28 bg-slate-50/50 hover:bg-white"
                        placeholder="Courte description du template..."
                      />
                      <AlignLeft size={14} className="absolute bottom-3 right-3 text-slate-300 pointer-events-none" />
                    </div>
                    <div className="text-right text-xs text-slate-400 mt-1">
                      {formData.description.length} caractères
                    </div>
                  </div>

                  {/* Catégorie */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5 uppercase tracking-wider">
                      Catégorie
                    </label>
                    <div className="relative">
                      <select 
                        value={formData.categorie} 
                        onChange={(e) => setFormData({...formData, categorie: e.target.value})}
                        className="w-full border border-slate-200 py-2.5 px-4 rounded-xl text-sm bg-slate-50/50 hover:bg-white outline-none transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none"
                      >
                        <option value="classique">Classique</option>
                        <option value="vip">VIP</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown size={16} className="text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Bouton submit */}
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {editingTemplate ? (
                      <span className="flex items-center justify-center gap-2">
                        <Save size={18} />
                        Enregistrer les modifications
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Plus size={18} />
                        Créer le modèle
                      </span>
                    )}
                  </motion.button>
                </motion.form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- COMPOSANT CARTE TEMPLATE AVEC ANIMATIONS ---
const TemplateCard = ({ template, index, onPreview, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      variants={itemVariants}
      custom={index}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      variants={{
        hover: { y: -8, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 17 } },
        tap: { scale: 0.98 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm relative flex flex-col justify-between cursor-pointer"
      onClick={() => onPreview(template)}
    >
      {/* Image & Badges Zone */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-slate-100">
        <motion.img 
          initial={{ scale: 1 }}
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
          src={template.image} 
          alt={template.titre} 
          className="w-full h-full object-cover"
        />
        
        {/* Upper Left Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {template.isPremium && (
            <motion.span 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-slate-900/90 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider"
            >
              Premium
            </motion.span>
          )}
          {template.isNew && (
            <motion.span 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider"
            >
              New
            </motion.span>
          )}
        </div>

        {/* Hover Admin Actions HUD */}
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 flex items-center justify-center gap-2"
            >
              <motion.button 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ delay: 0.05 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(template);
                }}
                className="p-2.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl transition-all"
                title="Agrandir l'aperçu"
              >
                <Eye size={16} />
              </motion.button>
              <motion.button 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ delay: 0.1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(template, e);
                }}
                className="p-2.5 bg-white hover:bg-slate-100 text-blue-600 rounded-xl transition-all"
                title="Modifier"
              >
                <Edit2 size={16} />
              </motion.button>
              <motion.button 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ delay: 0.15 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(template._id || template.id, e);
                }}
                className="p-2.5 bg-white hover:bg-red-50 text-red-600 rounded-xl transition-all"
                title="Supprimer"
              >
                <Trash2 size={16} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Data Meta details row */}
      <div>
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-slate-800 text-base">{template.titre}</h3>
          <div className="flex items-center gap-1 text-gray-400 font-bold text-xs">
            <Users size={13} /> {template.downloads || 0}
          </div>
        </div>

        {/* Description & Category */}
        <div className="mt-2 text-sm text-gray-600">
          <p className="line-clamp-2">{template.description}</p>
          <div className="mt-2 text-xs font-bold text-gray-500">
            Catégorie: <span className="ml-2 uppercase">{template.categorie}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- SUB COMPONENT FOR FILTERS ---
const FilterPill = ({ label, active, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
      active 
        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
    }`}
  >
    {label}
  </motion.button>
);

export default Templates;