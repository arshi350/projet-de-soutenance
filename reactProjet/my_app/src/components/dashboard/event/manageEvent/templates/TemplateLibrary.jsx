import React, { useState, useMemo, useEffect } from 'react';
import { Users, ArrowUpDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetAllTemplates } from '../../../../../hooks/useTemplates';

const SORT_OPTIONS = ['Plus récents', 'Popularité'];

export default function TemplateLibrary() {
  const [selectedAmbiance, setSelectedAmbiance] = useState(null);
  const [selectedCouleur, setSelectedCouleur] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { templates: dbTemplates, loading, error } = useGetAllTemplates();

  const templates = useMemo(
    () =>
      dbTemplates.map((template, index) => {
        const title = template.titre || template.title || `Template ${index + 1}`;
        const description = template.description || '';
        const category = template.categorie || 'classique';
        const derivedAmbiance = category === 'vip' ? 'Élégant' : 'Minimaliste';
        const derivedCouleur = category === 'vip' ? 'Chaud' : 'Neutre';
        const derivedTag = category === 'vip' ? 'Professionnel' : 'Festif';

        return {
          ...template,
          id: template.id || template._id || `${title}-${index}`,
          title,
          ambiance: template.ambiance || derivedAmbiance,
          couleur: template.couleur || derivedCouleur,
          tag: template.tag || derivedTag,
          uses: template.downloads != null ? String(template.downloads) : '0',
          isPremium: category === 'vip',
          isNew: template.isNew ?? false,
          image:
            template.image ||
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
          subtext: description ? description.substring(0, 60) : 'Template disponible',
        };
      }),
    [dbTemplates]
  );

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesAmbiance = !selectedAmbiance || template.ambiance === selectedAmbiance;
      const matchesCouleur = !selectedCouleur || template.couleur === selectedCouleur;
      const matchesTag = !selectedTag || template.tag === selectedTag;
      return matchesAmbiance && matchesCouleur && matchesTag;
    });
  }, [templates, selectedAmbiance, selectedCouleur, selectedTag]);

  const sortedTemplates = useMemo(() => {
    const sorted = [...filteredTemplates];
    if (sortBy === 'Plus récents') {
      return sorted.sort(
        (a, b) => new Date(b.createdAt || b.updatedAt || Date.now()) - new Date(a.createdAt || a.updatedAt || Date.now())
      );
    }
    if (sortBy === 'Popularité') {
      return sorted.sort((a, b) => Number(b.downloads || 0) - Number(a.downloads || 0));
    }
    return sorted;
  }, [filteredTemplates, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedTemplates.length / itemsPerPage));
  const paginatedTemplates = sortedTemplates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedAmbiance, selectedCouleur, selectedTag, sortBy]);

  const cycleSort = () => {
    const nextIndex = (SORT_OPTIONS.indexOf(sortBy) + 1) % SORT_OPTIONS.length;
    setSortBy(SORT_OPTIONS[nextIndex]);
  };

  const navigate = useNavigate();
  const location = useLocation();

  const handleChooseTemplate = (templateId) => {
    const params = new URLSearchParams(location.search);
    params.set('tab', 'personalisations');
    params.set('templateId', templateId);
    navigate({ pathname: location.pathname, search: `?${params.toString()}` });
  };

  return (
    <div className='px-60 font p-8 font-sans'>
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8'>
        <div className='space-y-2'>
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-blue-50 text-[#017EF7] uppercase'>
            <span className='w-1 h-1 rounded-full bg-[#017EF7] mr-1.5' />
            {filteredTemplates.length} Templates Disponibles
          </span>
          <h1 className='text-3xl font-bold text-gray-800 tracking-tight'>Bibliothèque de templates</h1>
          <p className='text-xs text-gray-400 max-w-xl leading-relaxed'>
            Choisissez un style, l'IA s'occupe du reste. Personnalisez chaque détail pour créer une expérience mémorable.
          </p>
        </div>

        <div className='relative shrink-0'>
          <button
            type='button'
            onClick={cycleSort}
            className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all'
          >
            <ArrowUpDown className='w-3.5 h-3.5 text-gray-400' />
            <span>{sortBy}</span>
          </button>
        </div>
      </div>

      <div className='space-y-4 flex flex-wrap justify-around mb-8 pb-6 border-b border-gray-100'>
        <div className='flex flex-col items-center gap-x-4 gap-y-2'>
          <span className='text-[10px] font-bold text-gray-400 uppercase tracking-wider w-20'>Ambiances</span>
          <div className='flex flex-wrap gap-2'>
            {['Élégant', 'Dynamique', 'Minimaliste'].map((item) => (
              <button
                key={item}
                onClick={() => setSelectedAmbiance(selectedAmbiance === item ? null : item)}
                className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all ${selectedAmbiance === item ? 'bg-[#017EF7] border-[#017EF7] text-white shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className='flex flex-col items-center gap-x-4 gap-y-2'>
          <span className='text-[10px] font-black text-gray-400 uppercase tracking-wider w-20'>Couleurs</span>
          <div className='flex flex-wrap gap-2'>
            {['Froid', 'Chaud', 'Neutre'].map((item) => (
              <button
                key={item}
                onClick={() => setSelectedCouleur(selectedCouleur === item ? null : item)}
                className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all ${selectedCouleur === item ? 'bg-[#017EF7] border-[#017EF7] text-white shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className='flex flex-col items-center gap-x-4 gap-y-2'>
          <span className='text-[10px] font-black text-gray-400 uppercase tracking-wider w-20'>Tags</span>
          <div className='flex flex-wrap gap-2'>
            {['Festif', 'Professionnel'].map((item) => (
              <button
                key={item}
                onClick={() => setSelectedTag(selectedTag === item ? null : item)}
                className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all ${selectedTag === item ? 'bg-[#017EF7] border-[#017EF7] text-white shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {loading ? (
          <div className='col-span-full bg-white rounded-3xl border border-gray-200 p-12 text-center text-slate-500'>Chargement des templates...</div>
        ) : error ? (
          <div className='col-span-full bg-white rounded-3xl border border-red-200 p-12 text-center text-red-600'>Erreur lors du chargement des templates.</div>
        ) : paginatedTemplates.length > 0 ? (
          paginatedTemplates.map((template) => (
            <div
              key={template.id}
              className='bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 flex flex-col justify-between group hover:shadow-md transition-all duration-200'
            >
              <div className='relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-gray-900'>
                <img
                  src={template.image}
                  alt={template.title}
                  className='w-full h-full object-cover opacity-90 group-hover:scale-102 transition-transform duration-300'
                />
                {template.isPremium && (
                  <span className='absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-gray-800 text-[9px] font-black px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wider'>
                    PREMIUM
                  </span>
                )}
                {template.isNew && (
                  <span className='absolute bottom-3 left-3 bg-[#10B981] text-white text-[9px] font-black px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wider'>
                    NEW
                  </span>
                )}
              </div>

              <div className='space-y-1 px-1 mb-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-sm font-black text-gray-800'>{template.title}</h3>
                  <div className='flex items-center gap-1 text-gray-400 text-[11px] font-bold'>
                    <Users className='w-3.5 h-3.5' />
                    <span>{template.uses}</span>
                  </div>
                </div>
                <p className='text-[10px] font-medium text-gray-400 capitalize tracking-wide'>{template.subtext}</p>
              </div>

                      <button
                        type='button'
                        onClick={() => handleChooseTemplate(template.id)}
                        className='w-full bg-gradient-to-r from-[#EF5D02] to-[#FF7B2A] hover:from-[#FF7B2A] hover:to-[#EF5D02] text-white text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-colors duration-150 flex items-center justify-center gap-2'
                      >
                        <span>Choisir ce template</span>
                      </button>
              
            </div>
          ))
        ) : (
          <div className='col-span-full bg-white rounded-3xl border border-gray-200 p-12 text-center text-slate-500'>Aucun template ne correspond aux filtres.</div>
        )}
      </div>

      {totalPages > 1 && !loading && !error && (
        <div className='mt-6 flex flex-col sm:flex-row items-center justify-between gap-3'>
          <div className='text-sm text-slate-600'>Page {currentPage} sur {totalPages}</div>
          <div className='flex flex-wrap items-center gap-2'>
            <button
              type='button'
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className='px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-50'
            >Précédent</button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type='button'
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-xl border ${page === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
              >{page}</button>
            ))}
            <button
              type='button'
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className='px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-50'
            >Suivant</button>
          </div>
        </div>
      )}
    </div>
  );
}
