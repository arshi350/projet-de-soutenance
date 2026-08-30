import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  QrCode, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { downloadSalesCSV } from '../../../../../services/salesService';
import toast from 'react-hot-toast';

export default function SalesTransactionList({ 
  transactions = [], 
  eventId, 
  eventTitle, 
  token,
  onRefresh 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isExporting, setIsExporting] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Extraction unique des catégories
  const categoriesList = useMemo(() => {
    const set = new Set();
    transactions.forEach(t => {
      if (t.categoryName) set.add(t.categoryName);
    });
    return Array.from(set);
  }, [transactions]);

  // Filtrage et recherche
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Filtre catégorie
      if (selectedCategory !== 'ALL' && t.categoryName !== selectedCategory) {
        return false;
      }
      // Filtre statut
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'scanned' && t.status !== 'scanned') return false;
        if (selectedStatus === 'valid' && t.status !== 'valid') return false;
        if (selectedStatus === 'cancelled' && t.status !== 'cancelled') return false;
      }
      // Recherche textuelle
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchName = (t.buyerName || '').toLowerCase().includes(query);
        const matchEmail = (t.buyerEmail || '').toLowerCase().includes(query);
        const matchTicket = (t.ticketNumber || '').toLowerCase().includes(query);
        const matchRef = (t.paymentReference || '').toLowerCase().includes(query);
        return matchName || matchEmail || matchTicket || matchRef;
      }
      return true;
    });
  }, [transactions, selectedCategory, selectedStatus, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, page]);

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      await downloadSalesCSV(eventId, token, eventTitle);
      toast.success("Rapport CSV des ventes téléchargé avec succès !");
    } catch (err) {
      toast.error("Erreur lors du téléchargement du fichier CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scanned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Entrée Validée
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Annulé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Billet Actif
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* En-tête avec titre et bouton Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
            Liste des Billets Vendus & Transactions
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
              {filteredTransactions.length} résultat(s)
            </span>
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Registre officiel et contrôle de l'ensemble des acheteurs
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-2xl transition"
              title="Rafraîchir les données"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={isExporting || transactions.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            {isExporting ? 'Export en cours...' : 'Exporter en CSV'}
          </button>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Champ de recherche */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher par nom, email, n° de billet ou transaction..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Filtre Catégorie */}
        <div className="sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-bold"
          >
            <option value="ALL">Toutes les catégories</option>
            {categoriesList.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Filtre Statut */}
        <div className="sm:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-bold"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="valid">Billet Actif</option>
            <option value="scanned">Entrée Validée (Scan)</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
      </div>

      {/* Tableau des ventes */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-4">Billet & Réf</th>
              <th className="py-3.5 px-4">Acheteur / Titulaire</th>
              <th className="py-3.5 px-4">Catégorie</th>
              <th className="py-3.5 px-4">Montant</th>
              <th className="py-3.5 px-4">Date d'Achat</th>
              <th className="py-3.5 px-4">Statut d'Entrée</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-1">
                    <p className="font-bold text-slate-700">Aucune transaction trouvée</p>
                    <p className="text-[11px] text-slate-400">
                      Modifiez vos critères de recherche ou attendez les premières ventes de l'événement.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((t, idx) => {
                const dateFormatted = t.createdAt 
                  ? new Date(t.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                  : 'N/A';
                
                return (
                  <tr key={t.id || idx} className="hover:bg-slate-50/70 transition-colors">
                    {/* Billet & Réf */}
                    <td className="py-3 px-4 font-mono">
                      <div className="font-black text-slate-900">{t.ticketNumber}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        {t.paymentReference ? `Réf: ${t.paymentReference}` : 'Paiement direct'}
                      </div>
                    </td>

                    {/* Acheteur */}
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{t.buyerName}</span>
                      </div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{t.buyerEmail}</span>
                      </div>
                      {t.buyerPhone && (
                        <div className="text-slate-400 text-[10px] flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span>{t.buyerPhone}</span>
                        </div>
                      )}
                    </td>

                    {/* Catégorie */}
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                        {t.categoryName}
                      </span>
                    </td>

                    {/* Montant */}
                    <td className="py-3 px-4 font-mono">
                      <span className="font-black text-emerald-600 text-sm">
                        {Number(t.totalAmount || t.unitPrice || 0).toLocaleString('fr-FR')} FCFA
                      </span>
                    </td>

                    {/* Date d'achat */}
                    <td className="py-3 px-4 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{dateFormatted}</span>
                      </div>
                    </td>

                    {/* Statut d'entrée */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {getStatusBadge(t.status)}
                        {t.scannedAt && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Scanné à {new Date(t.scannedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
          <div>
            Affichage de <strong className="text-slate-800">{(page - 1) * itemsPerPage + 1}</strong> à <strong className="text-slate-800">{Math.min(page * itemsPerPage, filteredTransactions.length)}</strong> sur <strong className="text-slate-800">{filteredTransactions.length}</strong> billets
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl text-slate-700 font-bold transition"
            >
              Précédent
            </button>
            <span className="px-3 py-1.5 font-bold text-slate-800">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl text-slate-700 font-bold transition"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
