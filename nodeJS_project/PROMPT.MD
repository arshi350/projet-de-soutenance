Tu es un Architecte Full-Stack Senior et Lead AI Engineer. Tu conçois des solutions SaaS événementielles modernes et scalables (Stack : Node.js/Express, MongoDB, React, Gemini AI).

### 🎯 OBJECTIF DU PROJET
Concevoir et implémenter 3 modules majeurs pour la gestion d'événements :
1. **Module de Sondages Interactifs** (Avant & Pendant l'événement).
2. **Moteur de Relances & Rappels Automatisés par IA** (Avant l'événement).
3. **Questionnaire de Feedback & Analyse Post-Événement par IA** (Après l'événement).

---

### 📦 1. MODULE DE SONDAGES INTERACTIFS (POLLS & SURVEYS)

#### A. Espace Organisateur (Dashboard Web)
- **Création de sondages** :
  - Types de questions : Choix unique, choix multiple, notation par étoiles (1-5), texte libre.
  - Déclenchement : Sondage pré-événement (ex: préférences de repas, thèmes préférés) ou sondage en direct.
  - Paramètres : Sondage anonyme ou nominatif, affichage des résultats en direct aux participants (oui/non), date de clôture automatique.
- **Visualisation & Analytics** :
  - Graphiques de répartition en temps réel (camemberts, barres de progression).
  - Taux de participation, export des données en CSV/Excel.

#### B. Espace Invité / Participant (Mobile-First / Page Web Dédiée)
- Interface sans friction (accessible via un lien unique sécurisé avec token ou QR Code, sans obligation de créer un compte).
- Composants de vote animés avec micro-interactions et confirmation instantanée.
- Affichage des tendances/résultats en direct si autorisé par l'organisateur.

---

### 🤖 2. MOTEUR DE RELANCES & RAPPELS AUTOMATISÉS PAR IA

#### A. Logique Métier & Déclencheurs Automatiques (Cron Jobs / Agenda)
- **Séquences de relance configurables** :
  - *Relance RSVP* : Relance des invités n'ayant pas encore répondu (ex: J-10, J-5 avant la clôture).
  - *Rappels d'approche* : Rappel aux participants confirmés (ex: J-3, J-1, H-2 avec QR Code d'accès rapide et lien Google Maps/Waze).
  - *Sélecteur de canal* : Email (Brevo/Resend), SMS, ou WhatsApp.

#### B. Générateur & Personnalisateur de Messages IA (Gemini API)
- **Copilote IA de Rédaction** :
  - L'organisateur choisit le ton souhaité (*Professionnel, Festif, Urgent, Chaleureux, VIP*).
  - L'IA génère l'objet et le corps du message en injectant les variables dynamiques (`{{nom_invite}}`, `{{nom_evenement}}`, `{{date}}`, `{{lieu}}`, `{{lien_billet}}`).
  - Détection automatique des désistements ou demandes d'assistance via analyse NLP des réponses.

---

### 📊 3. FEEDBACK & ANALYSE POST-ÉVÉNEMENT PILOTÉE PAR IA

#### A. Collecte d'Avis (Questionnaire Post-Événement)
- Envoi automatique du formulaire de satisfaction (ex: 2 heures après la fin de l'événement ou le lendemain matin à 10h).
- Questions clés :
  - Score global de satisfaction (CSAT / NPS de 1 à 10).
  - Évaluation par critères (Organisation, Accueil, Ambiance, Contenu/Restauration).
  - Questions ouvertes : *"Qu'avez-vous le plus apprécié ?"*, *"Quels points devraient être améliorés ?"*.

#### B. Moteur d'Analyse Post-Événement par IA
- **Agrégation et Traitement des Données** :
  - **Sentiment Analysis** : Détection de la polarité globale (Positif, Neutre, Négatif).
  - **Synthèse Exécutive IA** : Résumé clair en 3 à 5 paragraphes des retours de l'audience.
  - **Points Forts vs Axes d'Amélioration** : Extraction automatique des forces majeures et des axes de progrès prioritaires pour les prochaines éditions.
  - **Recommandations Stratégiques Actionnables** formulées par l'IA pour l'organisateur.
- **Rapport Exportable** : Génération d'un résumé PDF exécutif téléchargeable en un clic.

---

### 🛠️ ARCHITECTURE TECHNIQUE & LIVRABLES ATTENDUS

1. **Modèles de Données MongoDB (Mongoose)** :
   - `Poll` / `PollVote` (Gestion des questions, options et votes).
   - `ReminderRule` / `ReminderLog` (Planification des relances et historique d'envois).
   - `PostEventFeedback` & `PostEventAnalysis` (Réponses individuelles et rapport IA consolidé).
2. **API Backend (Routes, Contrôleurs & Services)** :
   - Architecture en couches strictes (*Routes -> Middlewares -> Controllers -> Services*).
   - Service d'intégration IA sécurisé avec gestion des erreurs, rate limiting et fallback.
   - Validation stricte des entrées (Zod / Joi ou Mongoose validation).
3. **Composants Frontend (React + Tailwind CSS)** :
   - UI responsive, ergonomique, moderne (Dark/Light mode, badges d'état, loaders, animations fluides Framer Motion).
   - Gestion d'état claire et réactivité temps réel.