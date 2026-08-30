# 🚀 WORKFLOW D'IMPLÉMENTATION DES FONCTIONNALITÉS IA (GOOGLE GEMINI)

> **Projet** : Plateforme de Billetterie & Gestion d'Événements Intelligente  
> **Modèle d'IA** : Google Gemini (Gemini 1.5 Flash / 2.0 Flash)  
> **Clé API** : `process.env.GEMINI_API_KEY` (Déjà configurée dans `nodeJS_project/.env`)  
> **Date de création** : 10 Août 2026

---


## 📐 Architecture Technique

```
┌────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                     │
│  - Boutons "✨ Générer avec l'IA" (Modaux interactifs)  │
│  - Widget Concierge WhatsApp / Chatbot                 │
│  - Insights Prédictifs & Graphiques d'Affluence        │
└───────────────────────────┬────────────────────────────┘
                            │ (Requêtes Axios sécurisées)
                            ▼
┌────────────────────────────────────────────────────────┐
│                BACKEND (Node.js/Express)               │
│  - Routes : routes/aiRoutes.js                         │
│  - Contrôleur : controller/ai/aiController.js          │
│  - Service Central : services/geminiService.js         │
└───────────────────────────┬────────────────────────────┘
                            │ (SDK @google/generative-ai)
                            ▼
┌────────────────────────────────────────────────────────┐
│              GOOGLE GEMINI 1.5/2.0 FLASH               │
│  - Réponses structurées JSON                           │
│  - Latence < 800ms                                     │
│  - 100% Gratuit (Free Tier Studio)                    │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ ÉTAPE 1 : Service Centralisé Gemini (`services/geminiService.js`)

Créer un service réutilisable unique gérant toutes les requêtes d'IA avec gestion d'erreurs et validation JSON stricte :

```javascript
// nodeJS_project/services/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * 1. Rédacteur d'Invitations IA
 */
async function generateInvitationText({ eventTitle, eventType, guestName, guestStatus, tone, additionalDetails }) {
  const prompt = `Tu es un expert en communication événementielle de luxe et protocolaire.
Rédige un texte d'invitation personnalisé pour :
- Événement : ${eventTitle} (Type: ${eventType})
- Invité : ${guestName} (${guestStatus === 'vip' ? 'Accès VIP Privilégié' : 'Invité Officiel'})
- Ton souhaité : ${tone || 'Élégant et chaleureux'}
- Détails complémentaires : ${additionalDetails || 'Aucun'}

Réponds UNIQUEMENT au format JSON strict avec les clés suivantes :
{
  "subject": "Objet percutant et professionnel",
  "shortMessage": "Message court pour SMS / WhatsApp (max 160 caractères)",
  "fullInvitation": "Texte complet d'invitation pour l'email"
}`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
}

/**
 * 2. Concierge / Assistant Virtuel WhatsApp (RSVP Chatbot)
 */
async function processConciergeMessage({ incomingMessage, guestName, eventDetails, conversationHistory }) {
  const prompt = `Tu es le concierge virtuel officiel de l'événement "${eventDetails.titre}".
Détails de l'événement : Date: ${eventDetails.date}, Heure: ${eventDetails.heure}, Lieu: ${eventDetails.lieu}, Dress Code: ${eventDetails.dressCode || 'Tenue correcte exigée'}.
Invité : ${guestName}.

Message de l'invité : "${incomingMessage}"
Historique récent : ${JSON.stringify(conversationHistory || [])}

Instructions :
1. Réponds poliment, de façon chaleureuse et concise.
2. Si l'invité confirme ou refuse sa présence, identifie son intention.

Réponds au format JSON strict :
{
  "replyMessage": "Ta réponse à envoyer à l'invité",
  "detectedRsvpAction": "CONFIRM" | "DECLINE" | "NONE",
  "guestCount": 1
}`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
}

/**
 * 3. Générateur de Campagne Marketing pour Événements Publics
 */
async function generateEventMarketingCampaign({ eventTitle, category, artists, targetAudience, keyPoints }) {
  const prompt = `Génère une stratégie de communication complète pour promouvoir l'événement public "${eventTitle}" (${category}).
Artistes/Intervenants : ${artists || 'À l'affiche'}
Public cible : ${targetAudience || 'Grand public'}
Points forts : ${keyPoints || 'Expérience unique'}

Réponds au format JSON strict :
{
  "seoDescription": "Description attractive pour la page de billetterie (150-200 mots)",
  "instagramPost": "Texte avec hashtags et emojis",
  "facebookPost": "Texte engageant avec appel à l'action",
  "emailNewsletter": "Email complet pour les abonnés avec objet"
}`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
}

/**
 * 4. Optimiseur de Plan de Table Intelligent
 */
async function optimizeTableSeating({ guestsList, tablesConfig }) {
  const prompt = `Organise le plan de table optimal pour cet événement :
Invités avec affinités : ${JSON.stringify(guestsList)}
Configuration des tables : ${JSON.stringify(tablesConfig)}

Optimise le placement pour regrouper les affinités et respecter le nombre de places par table.
Réponds au format JSON strict :
{
  "seatingPlan": [
    { "tableName": "Table 1 - Famille", "guests": ["Id1", "Id2"] }
  ],
  "notes": "Explication de la répartition"
}`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
}

module.exports = {
  generateInvitationText,
  processConciergeMessage,
  generateEventMarketingCampaign,
  optimizeTableSeating
};
```

---

## 🌐 ÉTAPE 2 : Contrôleur & Routes Backend

### 1. Routes (`nodeJS_project/routes/aiRoutes.js`)
```javascript
const express = require('express');
const router = express.Router();
const aiController = require('../controller/ai/aiController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/invitations/generate', verifyToken, aiController.generateInvitation);
router.post('/marketing/generate', verifyToken, aiController.generateMarketing);
router.post('/seating/optimize', verifyToken, aiController.optimizeSeating);
router.post('/concierge/reply', aiController.handleConciergeMessage);

module.exports = router;
```

### 2. Déclaration dans `app.js`
```javascript
const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);
```

---

## 💻 ÉTAPE 3 : Intégration Frontend React

### 1. Service API Frontend (`reactProjet/my_app/src/services/aiService.js`)
```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiGenerateInvitationWithAI = async (payload, token) => {
  const res = await axios.post(`${API_URL}/ai/invitations/generate`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const apiGenerateMarketingWithAI = async (payload, token) => {
  const res = await axios.post(`${API_URL}/ai/marketing/generate`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
```

### 2. Composant UI : Bouton "✨ Rédiger avec l'IA"
Ajouter un bouton élégant dans l'onglet Invitations (`invitationState.jsx`) et dans la création d'événement :
- Clic sur "Rédiger avec l'IA" ➡️ Ouverture d'un modal avec choix du ton (*Luxe, Festif, Familial, Professionnel*).
- L'IA pré-remplit instantanément le champ du message et l'objet de l'invitation.

---

## 📅 Roadmap d'Implémentation Pratique

| Phase | Tâche | Durée Estimée | Statut |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Création de `geminiService.js` et route `/api/ai/invitations/generate` | 15 min | Prêt à coder |
| **Phase 2** | Ajout du modal "✨ Générer avec l'IA" dans `invitationState.jsx` | 20 min | Prêt à coder |
| **Phase 3** | Générateur Marketing pour les événements publics | 20 min | Prêt à coder |
| **Phase 4** | Assistant Concierge WhatsApp / Webhook RSVP | 30 min | Optionnel |

---

## 🎯 Avantages pour la Soutenance
1. **Démonstration en Direct (Live Demo)** : Cliquer sur le bouton IA devant le jury et voir l'invitation personnalisée se générer en moins d'une seconde.
2. **Coût Zéro ($0.00)** : Tout fonctionne sur le palier gratuit Google AI Studio.
3. **Architecture Robuste** : Séparation stricte en couches (`routes` ➡️ `controllers` ➡️ `services`).
