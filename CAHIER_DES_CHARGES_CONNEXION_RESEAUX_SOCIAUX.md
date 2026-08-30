# 📘 CAHIER DES CHARGES FONCTIONNEL ET TECHNIQUE (CDCF)
## Module : Association de Comptes Réseaux Sociaux & Auto-Publication IA Multi-Plateforme

---

### 1. 🎯 CONTEXTE ET OBJECTIFS DU PROJET

#### 1.1 Contexte
La plateforme dispose actuellement d'un générateur de campagnes marketing propulsé par **Google Gemini (Gemini 2.5 Flash)** capable de créer des textes captivants, slogans, publications Instagram/TikTok, posts Facebook, descriptions SEO et newsletters.
Actuellement, l'organisateur copie manuellement ces contenus pour les coller sur ses réseaux.

#### 1.2 Objectif Principal
Permettre à l'organisateur d'**associer ses comptes officiels de réseaux sociaux** (Facebook Pages, Instagram Professionnel/Créateur, TikTok, LinkedIn) à la plateforme via le protocole sécurisé **OAuth 2.0**, afin de **publier ou programmer automatiquement en 1 clic** les campagnes générées par l'IA sans quitter son tableau de bord.

---

### 2. 👥 PÉRIMÈTRE FONCTIONNEL (USER STORIES & WORKFLOWS)

```
+-----------------------------------------------------------------------------------+
|                            WORKFLOW UTILISATEUR                                    |
+-----------------------------------------------------------------------------------+
|  1. Tableau de bord -> Onglet "Paramètres / Réseaux Sociaux"                      |
|  2. Clic sur "Connecter ma Page Facebook / Instagram / TikTok"                    |
|  3. Redirection vers la mire officielle OAuth 2.0 (Meta / TikTok)                 |
|  4. Accord des permissions de publication -> Redirection vers la plateforme       |
|  5. Sélection de la Page cible (ex: "Festival Yaoundé 2026")                      |
|  6. Sur la page Marketing IA : Clic sur "Publier directement sur Instagram & FB" |
|  7. L'IA injecte le visuel de l'événement et le texte -> Confirmation en direct   |
+-----------------------------------------------------------------------------------+
```

#### 2.1 Fonctionnalités Clés
1. **Association / Déconnexion des Comptes (OAuth 2.0)** :
   - Connexion individuelle pour chaque réseau social.
   - Affichage de l'état en temps réel (*Connecté, Token Expiré, Non connecté*).
   - Gestion des permissions accordées et révocation en un clic.
2. **Sélecteur de Comptes & Pages Cibles** :
   - Un utilisateur Meta peut posséder plusieurs Pages Facebook ou comptes Instagram Business : il choisit sur quelle Page publier pour chaque événement.
3. **Publication Instantanée en 1 Clic** :
   - Publication du texte généré par Gemini + affiche/image de l'événement hébergée sur Cloudinary.
4. **Programmation de Publication (Auto-Scheduling)** :
   - Choix de la date et de l'heure exacte de publication (ex: *Lundi à 18h00 pour le pic d'engagement*).
5. **Historique & Journal des Publications** :
   - Tableau récapitulatif des posts publiés avec le lien direct vers la publication en ligne, le nombre d'impressions/likes (si permis par l'API) et les erreurs éventuelles.

---

### 3. 🏗️ ARCHITECTURE TECHNIQUE & MODÈLE DE DONNÉES

#### 3.1 Architecture Globale
- **Frontend** : Boutons de connexion OAuth (`window.location.href = /api/social/auth/:provider`), modale de sélection de la Page cible et bouton de publication direct.
- **Backend Node.js / Express** :
  - Gestion des flux OAuth (Authorization Code Grant avec PKCE/State).
  - Échange du code temporaire contre un **Long-Lived Access Token** (durée 60 jours pour Meta).
  - Chiffrement symétrique **AES-256-GCM** des tokens en base de données.
  - Job Queue / Cron pour la programmation différée.
- **APIs Officielles Externes** :
  - **Meta Graph API (v19.0+)** pour Facebook Pages & Instagram Content Publishing API.
  - **TikTok Content Posting API**.
  - **LinkedIn Community Management API**.

---

#### 3.2 Modèle de Données MongoDB

```javascript
// 1. Modèle des Comptes Sociaux Connectés (socialAccount.js)
const SocialAccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: String, enum: ['facebook', 'instagram', 'tiktok', 'linkedin'], required: true },
  providerAccountId: { type: String, required: true }, // ID unique du compte chez le réseau
  accountName: { type: String, required: true },       // Nom affiché (ex: "Page Officielle Festival")
  accountAvatar: { type: String },
  encryptedAccessToken: { type: String, required: true }, // Chiffré avec AES-256-GCM
  encryptedRefreshToken: { type: String },
  tokenExpiresAt: { type: Date },
  pageId: { type: String },                             // Pour Facebook Page / IG Business ID
  pageAccessToken: { type: String },                    // Token spécifique à la Page
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// 2. Modèle des Publications Programmées / Historique (socialPost.js)
const SocialPostSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  socialAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'SocialAccount', required: true },
  platform: { type: String, enum: ['facebook', 'instagram', 'tiktok', 'linkedin'] },
  content: { type: String, required: true },            // Texte du post généré par Gemini
  mediaUrl: { type: String },                           // Image Cloudinary associée
  scheduledAt: { type: Date, default: Date.now },
  publishedAt: { type: Date },
  status: { type: String, enum: ['draft', 'scheduled', 'publishing', 'published', 'failed'], default: 'scheduled' },
  externalPostId: { type: String },                     // ID du post sur le réseau social
  externalPostUrl: { type: String },                    // Lien direct vers le post publié
  errorMessage: { type: String }
});
```

---

### 4. 📋 BESOINS & PRÉREQUIS OBLIGATOIRES POUR L'IMPLÉMENTATION

Pour implémenter cette fonctionnalité en conformité avec les règles des plateformes, voici la liste exhaustive des prérequis :

| Plateforme | Prérequis Développeur & Comptes Requis | Permissions / Scopes Requis | Particularités Techniques |
| :--- | :--- | :--- | :--- |
| **Meta (Facebook & Instagram)** | 1. Compte **Meta for Developers**.<br>2. Création d'une **Meta App** (Type Business).<br>3. Compte **Facebook Business Manager vérifié**.<br>4. Page Facebook liée à un compte **Instagram Professionnel/Créateur**. | • `pages_manage_posts`<br>• `pages_read_engagement`<br>• `instagram_basic`<br>• `instagram_content_publish`<br>• `public_profile` | • Pour Instagram, l'image doit être hébergée sur une URL publique HTTPS permanente (Cloudinary est parfait).<br>• En phase de dev : fonctionne uniquement avec les comptes administrateurs/testeurs de l'App Meta. |
| **TikTok** | 1. Compte **TikTok for Developers**.<br>2. Création d'une **App TikTok**.<br>3. Validation de la politique de confidentialité. | • `user.info.basic`<br>• `video.publish`<br>• `video.upload` | • TikTok impose le format vidéo (MP4/MOV) pour la publication directe via API. |
| **LinkedIn** | 1. **LinkedIn Developer Portal**.<br>2. Page Entreprise LinkedIn. | • `w_member_social`<br>• `w_organization_social` | • Très stable et simple pour les conférences et salons B2B. |

#### 4.1 Prérequis d'Infrastructure & Sécurité
1. **URL de Callback HTTPS Publique Obligatoire** :
   - En environnement local de développement : Nécessite un tunnel HTTPS comme **Ngrok** ou **Cloudflare Tunnel** (ex: `https://arshievent.ngrok.io/api/social/callback/facebook`) car les réseaux sociaux refusent les redirections en `http://localhost`.
2. **Chiffrement des Clés & Tokens (Sécurité Production)** :
   - Variable d'environnement secrète `SOCIAL_ENCRYPTION_KEY` (32 bytes hexadécimal) pour ne jamais stocker un token OAuth en clair dans MongoDB.
3. **Pages Légales Obligatoires** :
   - URL publique des **Conditions d'Utilisation (Terms of Service)**.
   - URL publique de la **Politique de Confidentialité (Privacy Policy)**.
   - Endpoint de **Suppression des Données Utilisateur** (`Data Deletion Callback`) exigé par Meta.

---

### 5. 🗺️ ROADMAP & PHASAGE D'IMPLÉMENTATION

```
PHASE 1 (MVP - Meta Facebook & Instagram)
├── 1. Création de l'App Meta for Developers & configuration des URLs de redirection
├── 2. Implémentation du service OAuth backend (Meta Auth & Long-lived Token Exchange)
├── 3. Stockage sécurisé chiffré dans MongoDB (SocialAccount)
├── 4. Interface React : Page "Comptes Réseaux Sociaux Connectés"
└── 5. Bouton "Publier sur Facebook & Instagram" sur la page Campagnes Pub IA

PHASE 2 (TikTok & LinkedIn)
├── 1. Intégration du flux TikTok for Developers & LinkedIn API
└── 2. Validation des vidéos pour TikTok

PHASE 3 (Auto-Scheduling & Analytics)
├── 1. Programmation de posts différés avec file d'attente (Cron / BullMQ)
└── 2. Tableau de bord des statistiques d'engagement des posts publiés
```

---

### 6. 💡 RECOMMANDATION TECHNIQUE POUR VOTRE SOUTENANCE

Pour une démonstration de soutenance impressionnante :
- **Prioriser Meta (Facebook Pages & Instagram)** : C'est le duo le plus utilisé pour l'événementiel grand public.
- Utiliser le mode **Développement Meta** (sans avoir besoin de faire valider l'application par les équipes Meta aux USA), ce qui permet de tester la publication en direct sur votre page Facebook/Instagram de test instantanément !
