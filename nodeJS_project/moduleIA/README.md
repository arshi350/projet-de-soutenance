# Module Chatbot IA — Google Gemini & Express.js

Microservice backend autonome intégrant l'API Google Gemini (`@google/genai`) pour fournir un chatbot conversationnel multi-tours avec gestion de sessions, rate limiting et gestion d'erreurs sécurisée.

---

## 🛠️ Stack Technique

- **Runtime** : Node.js (LTS ≥ 20) — Modules ES (`"type": "module"`)
- **Framework** : Express.js
- **SDK IA** : `@google/genai` (SDK officiel Google GenAI)
- **Modèle par défaut** : `gemini-2.5-flash`
- **Sécurité** : `express-rate-limit`, `cors`, validation et assainissement des inputs

---

## 📁 Architecture du projet

```
moduleIA/
├── .env                  # Variables d'environnement locales (non commité)
├── .env.example          # Modèle des variables d'environnement
├── .gitignore            # Exclusion des secrets et de node_modules
├── package.json          # Dépendances et scripts
├── server.js             # Point d'entrée du serveur Express
├── config/
│   └── env.js            # Validation et chargement strict des variables
├── routes/
│   └── chat.routes.js    # Définition des endpoints REST
├── controllers/
│   └── chat.controller.js # Contrôleur HTTP (réception & réponses)
├── services/
│   └── gemini.service.js # Client GoogleGenAI et gestion des sessions
├── middlewares/
│   ├── errorHandler.js   # Gestionnaire d'erreurs centralisé
│   ├── rateLimiter.js    # Limitation de débit (30 req / 5 min)
│   └── validateChatInput.js # Validation & assainissement des requêtes
└── utils/
    └── logger.js         # Utilitaire de logs formatés
```

---

## 🚀 Installation et Lancement

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration des variables d'environnement
Créez un fichier `.env` basé sur `.env.example` :
```env
PORT=5000
NODE_ENV=development
GEMINI_API_KEY=votre_cle_api_gemini
GEMINI_MODEL=gemini-2.5-flash
```

### 3. Démarrage du serveur
- **Mode production** :
  ```bash
  npm start
  ```
- **Mode développement (avec hot reload)** :
  ```bash
  npm run dev
  ```

---

## 📡 Contrat d'API

### 1. Envoyer un message (`POST /api/chat`)
**Requête :**
```json
{
  "sessionId": "user-session-123",
  "message": "Bonjour, donne-moi 3 idées de thèmes pour une soirée gala."
}
```

**Réponse succès (200 OK) :**
```json
{
  "reply": "Voici 3 idées raffinées pour votre soirée gala..."
}
```

**Réponse erreur (400 Bad Request) :**
```json
{
  "error": "Le champ message est obligatoire et ne peut pas être vide."
}
```

---

### 2. Réinitialiser la session (`POST /api/chat/reset`)
**Requête :**
```json
{
  "sessionId": "user-session-123"
}
```

**Réponse (200 OK) :**
```json
{
  "message": "Session réinitialisée"
}
```

---

### 3. Vérification de santé (`GET /api/chat/health`)
**Réponse (200 OK) :**
```json
{
  "status": "ok",
  "service": "Gemini Chatbot API",
  "model": "gemini-2.5-flash",
  "environment": "development",
  "timestamp": "2026-08-09T10:45:00.000Z"
}
```

---

## 🧪 Exemples de requêtes avec `cURL`

### Initialiser une conversation :
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test-1", "message": "Je m'appelle Alex et j'organise un festival."}'
```

### Poursuivre la conversation (persistance du contexte) :
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test-1", "message": "Quel est mon prénom et qu'est-ce que j'organise ?"}'
```

### Réinitialiser la session :
```bash
curl -X POST http://localhost:5000/api/chat/reset \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test-1"}'
```
