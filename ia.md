
si l'utilisateur demande d'ajouter la fonctionnalite "d'IA" suit exactement les instruction suivante :

1. POSE LA QUESTION SUIVANTE "es ce que pous posseder deja une cle d'api ?" 
 
# Workflow d'intégration — Chatbot IA Gemini dans une application Express.js

## Contexte du projet
Je souhaite intégrer un chatbot conversationnel basé sur l'API Gemini de Google dans mon application backend Express.js. Le chatbot doit gérer des sessions utilisateur, conserver le contexte de conversation, et être prêt pour un usage en développement avec une architecture propre permettant une montée en production ultérieure.

---

## 1. Objectif fonctionnel

- Permettre à un utilisateur d'entamer une conversation multi-tours avec l'IA (le modèle doit se souvenir des échanges précédents dans une même session).
- Exposer une API REST (`POST /api/chat`) consommable par un frontend (web ou mobile).
- Isoler chaque conversation par utilisateur via un `sessionId`.
- Supporter le streaming de réponse (optionnel, à activer si demandé).
- Être résilient aux erreurs (clé invalide, quota dépassé, timeout réseau, message vide, etc.).

---

## 2. Stack technique imposée

- **Runtime** : Node.js (version LTS ≥ 20)
- **Framework** : Express.js
- **SDK IA** : `@google/genai` (SDK officiel Google GenAI)
- **Modèle par défaut** : `gemini-2.5-flash` (texte) — changer uniquement si le projet nécessite un autre modèle
- **Gestion des variables d'environnement** : `dotenv`
- **Format des échanges** : JSON strict, pas de HTML dans les réponses API

---

## 3. Règles de sécurité (non négociables)

1. La clé API Gemini ne doit **jamais** être codée en dur dans le code source.
2. La clé doit être chargée exclusivement via `process.env.GEMINI_API_KEY`.
3. Le fichier `.env` doit être ajouté au `.gitignore` avant le premier commit.
4. Fournir un fichier `.env.example` (sans valeurs réelles) pour documenter les variables attendues.
5. Ne jamais exposer la clé API côté client/frontend — tous les appels à Gemini doivent transiter par le backend Express.
6. Valider et assainir (sanitize) tous les inputs utilisateurs avant de les transmettre au modèle (longueur max, pas de payload vide, pas de types inattendus).
7. Mettre en place un rate limiting basique par IP ou par utilisateur (ex. `express-rate-limit`) pour éviter l'épuisement du quota gratuit par abus.
8. Logger les erreurs côté serveur sans jamais renvoyer la stack trace complète au client.

---

## 4. Structure de projet à générer
tu dois l'adapter en fonction de l'architecture actuel
```
nodeJS_project/moduleIA/
│   ├── .env 
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── server.js
├── config/
│   └── env.js
├── routes/
│   └── chat.routes.js
├── controllers/
│   └── chat.controller.js
├── services/
│   └── gemini.service.js
├── middlewares/
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   └── validateChatInput.js
└── utils/
    └── logger.js
```

---

## 5. Règles d'implémentation par couche

### 5.1 `config/env.js`
- Centraliser le chargement et la validation des variables d'environnement.
- Faire échouer le démarrage du serveur (`process.exit(1)`) si `GEMINI_API_KEY` est absente.

### 5.2 `services/gemini.service.js`
- Instancier le client `GoogleGenAI` une seule fois (singleton), pas à chaque requête.
- Exposer deux fonctions :
  - `getOrCreateChat(sessionId)` : crée une session de chat si elle n'existe pas, la réutilise sinon.
  - `sendMessage(sessionId, message)` : envoie le message à la session et retourne la réponse texte.
- Définir un `systemInstruction` clair qui cadre le ton et le rôle du chatbot (à personnaliser selon le projet).
- Prévoir une fonction `resetSession(sessionId)` pour permettre à un utilisateur de redémarrer une conversation.
- Le stockage des sessions se fait en mémoire (`Map`) pour le développement uniquement. Prévoir un commentaire explicite indiquant qu'il faudra migrer vers Redis ou une base de données avant la production (les sessions en mémoire sont perdues au redémarrage et ne scalent pas sur plusieurs instances).

### 5.3 `middlewares/validateChatInput.js`
- Rejeter toute requête sans `sessionId` ou `message` (HTTP 400).
- Rejeter les messages vides ou excédant une longueur raisonnable (ex. 4000 caractères).

### 5.4 `middlewares/rateLimiter.js`
- Limiter le nombre de requêtes par IP (ex. 30 requêtes / 5 minutes) pour protéger le quota gratuit de l'API.

### 5.5 `middlewares/errorHandler.js`
- Middleware Express centralisé, placé en dernier.
- Catégoriser les erreurs connues (clé invalide, quota dépassé, timeout) avec des messages clairs pour le client.
- Ne jamais renvoyer `err.stack` au client, seulement en log serveur.

### 5.6 `controllers/chat.controller.js`
- Ne contient aucune logique métier Gemini directement — délègue tout à `gemini.service.js`.
- Gère uniquement : réception de la requête, appel du service, formatage de la réponse HTTP.

### 5.7 `routes/chat.routes.js`
- `POST /api/chat` → envoyer un message
- `POST /api/chat/reset` → réinitialiser une session
- (optionnel) `GET /api/chat/health` → vérifier que le service Gemini répond

### 5.8 `server.js`
- Applique `cors`, `express.json()`, les routes, puis le `errorHandler` en dernier middleware.
- Doit démarrer uniquement après validation réussie des variables d'environnement.

---

## 6. Contrat d'API à respecter

### `POST /api/chat`
**Requête :**
```json
{
  "sessionId": "string (obligatoire)",
  "message": "string (obligatoire, non vide)"
}
```

**Réponse succès (200) :**
```json
{
  "reply": "string"
}
```

**Réponse erreur (400/500) :**
```json
{
  "error": "message explicite, sans détails techniques sensibles"
}
```

### `POST /api/chat/reset`
**Requête :**
```json
{ "sessionId": "string" }
```
**Réponse (200) :**
```json
{ "message": "Session réinitialisée" }
```

---

## 7. Étapes d'exécution (ordre à respecter)

1. Initialiser le projet Node.js (`npm init -y`) et activer les modules ES (`"type": "module"` dans `package.json`).
2. Installer les dépendances : `express`, `@google/genai`, `dotenv`, `cors`, `express-rate-limit`.
3. Créer la structure de dossiers listée en section 4.
4. Implémenter `config/env.js` avec validation stricte.
5. Implémenter `services/gemini.service.js` avec gestion de session en mémoire.
6. Implémenter les middlewares (validation, rate limiting, gestion d'erreurs).
7. Implémenter le contrôleur et les routes selon le contrat d'API défini en section 6.
8. Assembler `server.js`.
9. Créer `.env.example` et vérifier que `.env` est bien ignoré par git.
10. Tester manuellement avec `curl` ou Postman :
    - Un premier message pour initier une conversation.
    - Un second message avec le même `sessionId` pour vérifier la persistance du contexte.
    - Un appel à `/api/chat/reset` puis un nouveau message pour vérifier que le contexte a bien été effacé.
11. Vérifier le comportement en cas d'erreur : clé API invalide, message vide, sessionId manquant.
12. Documenter dans un `README.md` les instructions de lancement (`npm install`, configuration `.env`, `npm start`).

---

## 8. Points explicitement hors périmètre (pour cette itération)

- Authentification utilisateur (JWT, OAuth) — à ajouter dans une itération future.
- Persistance des sessions en base de données — à ajouter avant la mise en production.
- Interface frontend — non couverte par ce workflow, uniquement le backend.
- Support multi-modal (upload d'image dans la conversation) — à traiter comme une fonctionnalité séparée si besoin.

---

## 9. Critère de validation final

L'implémentation est considérée conforme si :
- Le serveur démarre sans erreur avec une clé API valide dans `.env`.
- Une conversation à plusieurs messages avec le même `sessionId` conserve le contexte (le modèle fait référence à un échange précédent).
- Une requête sans `sessionId` ou `message` retourne une erreur 400 claire.
- Aucune clé API n'apparaît dans le code source, les logs, ou les réponses HTTP.
- Le code est organisé selon la structure de dossiers définie en section 4, sans logique Gemini dispersée dans les routes ou contrôleurs.