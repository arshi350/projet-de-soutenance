import { useState, useEffect } from 'react';
import { useCurrentUser } from '../../../hooks/useAuth';
import { useAddEvent } from '../../../hooks/useEvent';
import { 
  Type, FileText, Calendar, MapPin, Shapes, 
  Image as ImageIcon, Upload, LayoutList, AlertCircle,
  CheckCircle, XCircle } from 'lucide-react';

const EventForm = ({ closeModal }) => {
  const { user } = useCurrentUser();
  const userId = user?.id;
  const { addNewEvent, loading, error, success, data, reset } = useAddEvent();
  
  const initialFormdata = {
    titre: "", 
    description: '', 
    DateDebut: '', 
    DateFin: '', 
    heureDebut: '', 
    heureFin: '', 
    lieu: '', 
    categorie: '',
    coverImage: null
  };
  
  const [formData, setFormData] = useState(initialFormdata);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [touched, setTouched] = useState({});

  // Reset hook state when component unmounts
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Handle successful event creation
  useEffect(() => {
    if (success) {
      // Reset form
      setFormData(initialFormdata);
      setImagePreview(null);
      setTouched({});
      
      // Close modal after delay
      const timer = setTimeout(() => {
        closeModal();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [success, closeModal, initialFormdata]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
    
    const fieldError = validateField(fieldName, formData[fieldName]);
    if (fieldError) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldError
      }));
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'titre':
        if (!value?.trim()) return 'Le titre est requis';
        if (value.length < 3) return 'Le titre doit contenir au moins 3 caractères';
        if (value.length > 100) return 'Le titre ne doit pas dépasser 100 caractères';
        return '';
      
      case 'description':
        if (!value?.trim()) return 'La description est requise';
        if (value.length < 10) return 'La description doit contenir au moins 10 caractères';
        if (value.length > 500) return 'La description ne doit pas dépasser 500 caractères';
        return '';
      
      case 'DateDebut':
        if (!value) return 'La date de début est requise';
        return '';
      
      case 'heureDebut':
        if (!value) return 'L\'heure de début est requise';
        return '';
      
      case 'DateFin':
        if (!value) return 'La date de fin est requise';
        return '';
      
      case 'heureFin':
        if (!value) return 'L\'heure de fin est requise';
        return '';
      
      case 'lieu':
        if (!value?.trim()) return 'Le lieu est requis';
        return '';
      
      case 'categorie':
        if (!value?.trim()) return 'La catégorie est requise';
        return '';
      
      default:
        return '';
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validation
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          coverImage: 'Format non supporté. Utilisez PNG, JPG ou WEBP'
        }));
        return;
      }

      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          coverImage: 'Le fichier ne doit pas dépasser 10MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        coverImage: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear error
      setErrors(prev => ({
        ...prev,
        coverImage: ''
      }));
    }
  };

  const buildFormData = () => {
    const payload = new FormData();
    payload.append('titre', formData.titre);
    payload.append('description', formData.description);
    payload.append('DateDebut', formData.DateDebut);
    payload.append('DateFin', formData.DateFin);
    payload.append('heureDebut', formData.heureDebut);
    payload.append('heureFin', formData.heureFin);
    payload.append('lieu', formData.lieu);
    payload.append('categorie', formData.categorie);
    if (userId) payload.append('userId', userId);
    if (formData.coverImage) {
      payload.append('image', formData.coverImage);
    }
    return payload;
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate all fields
    Object.keys(formData).forEach(key => {
      if (key !== 'coverImage') {
        const fieldError = validateField(key, formData[key]);
        if (fieldError) {
          newErrors[key] = fieldError;
        }
      }
    });

    // Validate date range
    if (formData.DateDebut && formData.DateFin) {
      const start = new Date(`${formData.DateDebut} ${formData.heureDebut || '00:00'}`);
      const end = new Date(`${formData.DateFin} ${formData.heureFin || '00:00'}`);
      
      if (end <= start) {
        newErrors.DateFin = 'La date de fin doit être postérieure à la date de début';
      }
    }

    // Validate image size if present
    if (formData.coverImage && formData.coverImage.size > 10 * 1024 * 1024) {
      newErrors.coverImage = 'L\'image ne doit pas dépasser 10MB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Set all fields as touched on submit
    const allFields = Object.keys(formData);
    const touchedFields = {};
    allFields.forEach(field => {
      touchedFields[field] = true;
    });
    setTouched(touchedFields);
    
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      const formDataToSend = buildFormData();
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setErrors(prev => ({
          ...prev,
          api: 'Jeton d\'authentification introuvable',
        }));
        return;
      }
      
      // Call the addNewEvent from the hook
      await addNewEvent(formDataToSend, token);

      await closeModal(closeModal);
      
      // Success is handled by the useEffect
      
    } catch (err) {
      console.error('Erreur lors de la création:', err);
      // Error is already managed by the hook
    }
  };

  return (
    <div className="h-215 mt-15 overflow-hidden rounded-xl overflow-y-scroll bg-slate-50 p-4 md:p-8 flex justify-center items-start font">
      <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-sm p-8 border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 uppercase">
          Créer vos événements en toute simplicité
        </h1>
        
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700">
            <CheckCircle size={20} />
            <span className="font-medium">Événement créé avec succès !</span>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
            <XCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}
        {errors.api && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span className="font-medium">{errors.api}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Section: INFORMATIONS GÉNÉRALES */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#017EF7]">
              <LayoutList size={20} strokeWidth={2.5} />
              <h2 className="text-sm font-semibold tracking-wider uppercase">Informations Générales</h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="relative group">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#017EF7] transition-colors" size={20} />
                  <input 
                    type="text" 
                    name="titre"
                    value={formData.titre}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('titre')}
                    placeholder="Titre de l'événement"
                    disabled={loading || success}
                    className={`w-full bg-[#E9F5F8] border-none rounded-xl py-4 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-[#017EF7]/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.titre && touched.titre ? 'ring-2 ring-red-500' : ''
                    }`}
                  />
                </div>
                {errors.titre && touched.titre && (
                  <div className="flex items-center gap-1 mt-1 text-red-500 text-xs error-message">
                    <AlertCircle size={12} />
                    <span>{errors.titre}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="relative group">
                  <FileText className="absolute left-4 top-6 text-slate-400 group-focus-within:text-[#017EF7] transition-colors" size={20} />
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('description')}
                    placeholder="Décrivez votre événement en quelques mots..."
                    rows="4"
                    disabled={loading || success}
                    className={`w-full bg-[#E9F5F8] border-none rounded-xl py-5 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-[#017EF7]/20 outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.description && touched.description ? 'ring-2 ring-red-500' : ''
                    }`}
                  />
                </div>
                {errors.description && touched.description && (
                  <div className="flex items-center gap-1 mt-1 text-red-500 text-xs error-message">
                    <AlertCircle size={12} />
                    <span>{errors.description}</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section: CALENDRIER */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#017EF7]">
              <Calendar size={20} strokeWidth={2.5} />
              <h2 className="text-sm font-semibold tracking-wider uppercase">Calendrier</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase ml-1">Date de début</label>
                <input 
                  type="date" 
                  name="DateDebut"
                  value={formData.DateDebut}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('DateDebut')}
                  disabled={loading || success}
                  className={`w-full bg-[#E9F5F8] border-none transition duration-200 focus:ring-2 focus:ring-[#017EF7]/20 rounded-xl py-4 px-4 text-slate-700 outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.DateDebut && touched.DateDebut ? 'ring-2 ring-red-500' : ''
                  }`} 
                />
                {errors.DateDebut && touched.DateDebut && (
                  <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                    <AlertCircle size={12} />
                    <span>{errors.DateDebut}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase ml-1">Heure de début</label>
                <input 
                  type="time" 
                  name="heureDebut"
                  value={formData.heureDebut}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('heureDebut')}
                  disabled={loading || success}
                  className={`w-full bg-[#E9F5F8] border-none transition duration-200 focus:ring-2 focus:ring-[#017EF7]/20 rounded-xl py-4 px-4 text-slate-700 outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.heureDebut && touched.heureDebut ? 'ring-2 ring-red-500' : ''
                  }`} 
                />
                {errors.heureDebut && touched.heureDebut && (
                  <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                    <AlertCircle size={12} />
                    <span>{errors.heureDebut}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase ml-1">Date de fin</label>
                <input 
                  type="date" 
                  name="DateFin"
                  value={formData.DateFin}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('DateFin')}
                  disabled={loading || success}
                  className={`w-full bg-[#E9F5F8] border-none transition duration-200 focus:ring-2 focus:ring-[#017EF7]/20 rounded-xl py-4 px-4 text-slate-700 outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.DateFin && touched.DateFin ? 'ring-2 ring-red-500' : ''
                  }`} 
                />
                {errors.DateFin && touched.DateFin && (
                  <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                    <AlertCircle size={12} />
                    <span>{errors.DateFin}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase ml-1">Heure de fin</label>
                <input 
                  type="time" 
                  name="heureFin"
                  value={formData.heureFin}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('heureFin')}
                  disabled={loading || success}
                  className={`w-full bg-[#E9F5F8] border-none transition duration-200 focus:ring-2 focus:ring-[#017EF7]/20 rounded-xl py-4 px-4 text-slate-700 outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.heureFin && touched.heureFin ? 'ring-2 ring-red-500' : ''
                  }`} 
                />
                {errors.heureFin && touched.heureFin && (
                  <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                    <AlertCircle size={12} />
                    <span>{errors.heureFin}</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section: LIEU & TYPE */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#017EF7]">
              <MapPin size={20} strokeWidth={2.5} />
              <h2 className="text-sm font-semibold tracking-wider uppercase">Lieu & Type</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    name="lieu"
                    value={formData.lieu}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('lieu')}
                    placeholder="Lieu de l'événement"
                    disabled={loading || success}
                    className={`w-full bg-[#E9F5F8] border-none focus:ring-2 transition duration-200 focus:ring-[#017EF7]/20 rounded-xl py-4 pl-12 pr-4 text-slate-700 font-medium outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.lieu && touched.lieu ? 'ring-2 ring-red-500' : ''
                    }`}
                  />
                </div>
                {errors.lieu && touched.lieu && (
                  <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                    <AlertCircle size={12} />
                    <span>{errors.lieu}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="relative">
                  <Shapes className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    name="categorie"
                    value={formData.categorie}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('categorie')}
                    placeholder="Catégorie d'événement" 
                    disabled={loading || success}
                    className={`w-full bg-[#E9F5F8] border-none focus:ring-2 transition duration-200 focus:ring-[#017EF7]/20 rounded-xl py-4 pl-12 pr-4 text-slate-700 font-medium outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.categorie && touched.categorie ? 'ring-2 ring-red-500' : ''
                    }`}
                  />
                </div>
                {errors.categorie && touched.categorie && (
                  <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                    <AlertCircle size={12} />
                    <span>{errors.categorie}</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section: VISUEL DE COUVERTURE */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#017EF7]">
              <ImageIcon size={20} strokeWidth={2.5} />
              <h2 className="text-sm font-semibold tracking-wider uppercase">Visuel de couverture</h2>
            </div>

            <div>
              <input
                type="file"
                id="coverImage"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                disabled={loading || success}
                className="hidden"
              />
              
              <label 
                htmlFor="coverImage"
                className={`border-2 border-dashed rounded-[2rem] p-12 bg-white hover:border-[#017EF7]/30 transition-colors cursor-pointer group block ${
                  errors.coverImage ? 'border-red-500' : 'border-slate-200'
                } ${(loading || success) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-48 mx-auto rounded-lg object-contain"
                    />
                    <p className="text-center text-sm text-green-600 mt-2">
                      Image sélectionnée ✓
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-[#017EF7]/15 rounded-full flex items-center justify-center text-[#017EF7] group-hover:scale-110 transition-transform">
                      <Upload size={28} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Cliquez pour téléverser une image</p>
                      <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
                        PNG, JPG ou WEBP jusqu'à 10MB (1600×900px recommandé)
                      </p>
                    </div>
                  </div>
                )}
              </label>
              
              {errors.coverImage && (
                <div className="flex items-center gap-1 mt-2 text-red-500 text-xs">
                  <AlertCircle size={12} />
                  <span>{errors.coverImage}</span>
                </div>
              )}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-6 pt-4">
            <button 
              onClick={closeModal} 
              type="button" 
              disabled={loading || success}
              className="text-gray-700 hover:scale-105 bg-gray-200 px-5 py-4 rounded-xl cursor-pointer font-bold hover:bg-[#FF5005]/20 hover:text-[#FF5005] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button 
              type="submit" 
             
              disabled={loading || success}
              className="bg-[#017EF7] hover:scale-105 text-white font-bold px-10 py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Création en cours...' : success ? 'Créé avec succès !' : "Créer l'événement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;