const xlsx = require('xlsx');
const path = require('path');

const guests = [
  {
    Nom: 'Dupont',
    Prénom: 'Jean-Marc',
    Email: 'jean.dupont@example.com',
    Téléphone: '690123456',
    Statut: 'VIP'
  },
  {
    Nom: 'Kuate',
    Prénom: 'Marie-Claire',
    Email: 'marie.kuate@example.com',
    Téléphone: '670987654',
    Statut: 'Classique'
  },
  {
    Nom: 'Tchinda',
    Prénom: 'Patrick',
    Email: 'patrick.tchinda@example.com',
    Téléphone: '695443322',
    Statut: 'VIP'
  },
  {
    Nom: 'Nguefack',
    Prénom: 'Sandrine',
    Email: 'sandrine.nguefack@example.com',
    Téléphone: '650112233',
    Statut: 'Classique'
  },
  {
    Nom: 'Kamga',
    Prénom: 'Arthur',
    Email: 'arthur.kamga@example.com',
    Téléphone: '699887766',
    Statut: 'VIP'
  },
  {
    Nom: 'Fotso',
    Prénom: 'Diane',
    Email: 'diane.fotso@example.com',
    Téléphone: '677223344',
    Statut: 'Classique'
  },
  {
    Nom: 'Fokam',
    Prénom: 'Alain',
    Email: 'alain.fokam@example.com',
    Téléphone: '691234567',
    Statut: 'VIP'
  },
  {
    Nom: 'Mbianda',
    Prénom: 'Estelle',
    Email: 'estelle.mbianda@example.com',
    Téléphone: '652334455',
    Statut: 'Classique'
  },
  {
    Nom: 'Kenmogne',
    Prénom: 'Fabrice',
    Email: 'fabrice.kenmogne@example.com',
    Téléphone: '698765432',
    Statut: 'Classique'
  },
  {
    Nom: 'Talla',
    Prénom: 'Valérie',
    Email: 'valerie.talla@example.com',
    Téléphone: '675123987',
    Statut: 'VIP'
  }
];

// Créer le classeur Excel
const worksheet = xlsx.utils.json_to_sheet(guests);

// Ajuster la largeur des colonnes
worksheet['!cols'] = [
  { wch: 18 }, // Nom
  { wch: 20 }, // Prénom
  { wch: 32 }, // Email
  { wch: 18 }, // Téléphone
  { wch: 14 }  // Statut
];

const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, 'Invités');

// Enregistrer à la racine du projet
const outputPath1 = path.join(__dirname, '..', 'Liste_10_Invites.xlsx');
const outputPath2 = path.join(__dirname, '..', 'invites_10.xlsx');

xlsx.writeFile(workbook, outputPath1);
xlsx.writeFile(workbook, outputPath2);

console.log('✅ Fichier Excel généré avec succès dans :', outputPath1);
