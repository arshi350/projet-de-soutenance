// testGemini.js
const mongoose = require('mongoose');
const geminiTemplateService = require('./services/geminiService');
const Template = require('./models/templates/Template');

// Configuration
const MONGODB_URI = 'mongodb://localhost:27017/mybd';

async function testGeminiRoutes() {
  try {
    // 1. Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // 2. Récupérer un template existant
    const template = await Template.findOne();
    if (!template) {
      console.log('❌ Aucun template trouvé en base');
      return;
    }
    console.log(`📝 Template trouvé : ${template.nom} (ID: ${template._id})`);

    // 3. Test modification complète
    console.log('\n🧪 TEST 1: Modification complète du template');
    try {
      const result = await geminiTemplateService.modifyTemplateWithPrompt(
        template,
        "Rends les couleurs plus chaleureuses avec des tons orangés"
      );
      console.log('✅ Réponse reçue');
      console.log('Nouvelles couleurs:', result.structure.couleurs);
      console.log('Nouveau titre:', result.structure.contenu.titre);
    } catch (err) {
      console.log('❌ Erreur:', err.message);
    }

    // 4. Test suggestions
    console.log('\n🧪 TEST 2: Génération de suggestions');
    try {
      const suggestions = await geminiTemplateService.generateTemplateSuggestions(
        template,
        'Gala'
      );
      console.log('✅ Suggestions reçues:');
      suggestions.forEach((s, i) => console.log(`   ${i+1}. ${s}`));
    } catch (err) {
      console.log('❌ Erreur:', err.message);
    }

    // 5. Test modification texte uniquement
    console.log('\n🧪 TEST 3: Modification textuelle');
    try {
      const modifiedText = await geminiTemplateService.modifyTextContent(
        template.structure.contenu,
        "Rends le message plus court et ajoute un appel à l'action urgent"
      );
      console.log('✅ Texte modifié:', modifiedText);
    } catch (err) {
      console.log('❌ Erreur:', err.message);
    }

    // 6. Test modification couleurs
    console.log('\n🧪 TEST 4: Modification des couleurs');
    try {
      const newColors = await geminiTemplateService.modifyColors(
        template.structure.couleurs,
        "Palette premium avec du doré et du bleu nuit"
      );
      console.log('✅ Nouvelles couleurs:', newColors);
    } catch (err) {
      console.log('❌ Erreur:', err.message);
    }

    console.log('\n✅ Tous les tests terminés');
    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Lancer les tests
testGeminiRoutes();