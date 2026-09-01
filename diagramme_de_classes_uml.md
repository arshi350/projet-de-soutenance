# Diagramme de Classes - Analyse UML du Projet ARSHI EVENT

Ce document présente l'analyse UML complète de la structure logicielle du projet **ARSHI EVENT**, englobant :
1. **L'Architecture Backend** (Modèles de données MongoDB / Mongoose, Contrôleurs et Services REST API).
2. **L'Architecture Mobile Flutter** (Modèles de données client, Providers de gestion d'état et Services API).
3. **Les Relations et Cardinalités** régissant le système de billetterie, de gestion d'événements, d'invitations et de contrôle d'accès par QR Code.

---

## 1. Diagramme de Classes Général (Mermaid)

```mermaid
classDiagram
    %% ==========================================
    %% ENTITÉS DU DOMAINE (BACKEND MONGOOSE)
    %% ==========================================
    class User {
        +ObjectId _id
        +String first_name
        +String last_name
        +String email
        +Number phone
        +String city
        +String password
        +String role
        +Boolean suspended
        +String suspensionReason
        +Date date
        +String resetToken
        +Date resetTokenExp
    }

    class Event {
        +ObjectId _id
        +String titre
        +String description
        +Date DateDebut
        +Date DateFin
        +String heureDebut
        +String heureFin
        +String lieu
        +String categorie
        +String image
        +ObjectId userId
        +String EventCode
        +String status
        +Number confirmedInvites
        +Number totalInvites
        +String eventType
        +Pricing pricing
    }

    class Invites {
        +ObjectId _id
        +String nom
        +String prenom
        +String telephone
        +String email
        +String status
        +ObjectId idEvent
        +Boolean isScanned
        +Boolean isPresent
        +Date createdAt
        +Date updatedAt
    }

    class QRCodeModel {
        +ObjectId _id
        +ObjectId inviteId
        +ObjectId eventId
        +Buffer qrCodeData
        +String qrCodeDataUrl
        +String content
        +String format
        +Date createdAt
    }

    class TicketCategory {
        +ObjectId _id
        +ObjectId eventId
        +String name
        +String description
        +Number price
        +Number capacity
        +Number soldCount
        +Number reservedCount
        +String aiBackgroundUrl
        +String aiPrompt
        +List~String~ benefits
        +Boolean isActive
    }

    class PurchasedTicket {
        +ObjectId _id
        +ObjectId eventId
        +ObjectId ticketCategoryId
        +String ticketNumber
        +String buyerName
        +String buyerEmail
        +String buyerPhone
        +String qrCodeToken
        +String qrCodeImage
        +String pdfUrl
        +Number unitPrice
        +Number feeAmount
        +Number totalAmount
        +String paymentReference
        +String status
        +Date scannedAt
        +ObjectId scannedBy
    }

    class Poll {
        +ObjectId _id
        +ObjectId eventId
        +String question
        +List~String~ options
        +String status
        +Boolean aiGenerated
        +Date createdAt
    }

    class PollVote {
        +ObjectId _id
        +ObjectId pollId
        +String voterIdentifier
        +Number optionIndex
        +Date createdAt
    }

    class SocialAccount {
        +ObjectId _id
        +ObjectId userId
        +String platform
        +String accountName
        +String accessToken
        +String status
    }

    class SocialPost {
        +ObjectId _id
        +ObjectId eventId
        +ObjectId userId
        +String content
        +List~String~ platforms
        +String status
        +Date scheduledAt
    }

    class Notification {
        +ObjectId _id
        +ObjectId userId
        +ObjectId eventId
        +String title
        +String message
        +String type
        +Boolean isRead
        +Date createdAt
    }

    %% ==========================================
    %% CLASSES CLIENT MOBILE (FLUTTER / DART)
    %% ==========================================
    class EventModel {
        +String id
        +String name
        +String description
        +DateTime dateDebut
        +DateTime dateFin
        +String location
        +String category
        +String eventCode
        +int totalGuests
        +int scannedGuests
        +fromJson(Map json) EventModel
        +toJson() Map
    }

    class GuestModel {
        +String id
        +String firstName
        +String lastName
        +String email
        +String phone
        +String status
        +String idEvent
        +bool isScanned
        +bool isPresent
        +fullName String
        +isVip bool
        +fromJson(Map json) GuestModel
    }

    class ScanResultModel {
        +bool success
        +bool alreadyScanned
        +GuestModel guest
        +String scannedAt
        +String error
        +fromJson(Map json) ScanResultModel
    }

    %% ==========================================
    %% SERVICES ET PROVIDERS
    %% ==========================================
    class AuthProvider {
        -String token
        -String userId
        -EventModel currentEvent
        -bool isLoading
        -String error
        +login(email, password) Future~bool~
        +loginWithGoogle(token, email) Future~bool~
        +connectToEventByCode(eventId, code) Future~bool~
        +logout() Future~void~
    }

    class ApiService {
        +baseUrl String
        +login(email, password) Future~Map~
        +googleLogin(token, email) Future~Map~
        +getEvents() Future~List~
        +getGuests(eventId) Future~List~
        +verifyQRCode(qrData, eventId) Future~Map~
        +verifyEventAccess(eventId, code) Future~Map~
    }

    class GuestProvider {
        -List~GuestModel~ guests
        -bool isLoading
        -String error
        +fetchGuests(eventId) Future~void~
        +scannedGuests int
        +vipGuests int
    }

    %% ==========================================
    %% RELATIONS ET CARDINALITÉS (UML)
    %% ==========================================
    User "1" -- "*" Event : créé / gère >
    User "1" -- "*" SocialAccount : possède >
    User "1" -- "*" SocialPost : publie >
    User "1" -- "*" Notification : reçoit >
    User "1" -- "*" PurchasedTicket : scanne / valide (scannedBy) >

    Event "1" -- "*" Invites : contient >
    Event "1" -- "*" TicketCategory : propose >
    Event "1" -- "*" PurchasedTicket : enregistre les ventes >
    Event "1" -- "*" Poll : organise >
    Event "1" -- "*" SocialPost : promeut >

    Invites "1" -- "0..1" QRCodeModel : génère le badge d'accès >
    TicketCategory "1" -- "*" PurchasedTicket : catégorise >
    Poll "1" -- "*" PollVote : enregistre >

    AuthProvider ..> ApiService : utilise
    GuestProvider ..> ApiService : utilise
    AuthProvider "1" o-- "0..1" EventModel : événement actif sélectionné
    GuestProvider "1" o-- "*" GuestModel : liste d'invités chargés
```

---

## 2. Description Détaillée des Classes et Attributs

### A. Core Backend Models (MongoDB / Mongoose)

#### 1. `User` (Utilisateur & Organisateur)
- **Rôle** : Représente un compte utilisateur (Organisateur d'événement ou Administrateur système).
- **Attributs majeurs** :
  - `_id`: Identifiant unique MongoDB.
  - `first_name`, `last_name`: Nom complet de l'utilisateur.
  - `email`: Adresse email unique (sert d'identifiant de connexion standard ou Google).
  - `password`: Hachage sécurisé du mot de passe (Bcrypt).
  - `role`: Type de privilège (`'user'` | `'admin'`).
  - `suspended`: État de suspension du compte.
  - `resetToken`, `resetTokenExp`: Token et date d'expiration pour la réinitialisation de mot de passe.

#### 2. `Event` (Événement)
- **Rôle** : Représente un événement créé par un organisateur.
- **Attributs majeurs** :
  - `titre`, `description`, `lieu`, `categorie`: Informations descriptives.
  - `DateDebut`, `DateFin`, `heureDebut`, `heureFin`: Plage temporelle.
  - `userId`: Clé étrangère vers l'utilisateur créateur (`ref: 'user'`).
  - `EventCode`: Code secret alphanumérique à 8 caractères pour l'accès mobile des contrôleurs.
  - `eventType`: Type d'événement (`'private'` | `'public'`).
  - `status`: Échéance (`'en attente'`, `'en cours'`, `'terminer'`).
  - `pricing`: Structuration tarifaire de la billetterie publique et frais de canal.

#### 3. `Invites` (Invité Privé)
- **Rôle** : Fiche d'un invité sur la liste privée d'un événement.
- **Attributs majeurs** :
  - `nom`, `prenom`, `telephone`, `email`: Coordonnées du participant.
  - `status`: Catégorie d'invité (`'vip'` | `'classique'`).
  - `idEvent`: Clé étrangère vers l'événement concerné (`ref: 'event'`).
  - `isScanned`, `isPresent`: États booléens du contrôle d'accès en temps réel.

#### 4. `QRCodeModel` (QR Code de Validation)
- **Rôle** : Stocke les données de l'empreinte QR Code d'un invité.
- **Attributs majeurs** :
  - `inviteId`: Référence de l'invité (`ref: 'Invites'`).
  - `eventId`: Référence de l'événement (`ref: 'event'`).
  - `content`: Token / Empreinte unique encodée dans le QR Code.
  - `qrCodeData`: Image binaire (PNG Buffer).

#### 5. `TicketCategory` & `PurchasedTicket` (Billetterie Publique)
- **`TicketCategory`** : Définit les types de billets (Tarifs VIP, Standard, Early Bird, capacité max).
- **`PurchasedTicket`** : Billet individuel acheté publiquement avec numéro unique `ticketNumber`, jeton `qrCodeToken`, lien du PDF et statut (`'valid'`, `'scanned'`, `'cancelled'`).

---

### B. Mobile App Models (Flutter / Dart)

#### 1. `EventModel`
- Modèle Dart côté application mobile représentant l'événement auquel l'agent de contrôle est connecté.
- Gère la désérialisation JSON via `EventModel.fromJson()`.

#### 2. `GuestModel`
- Représente un invité dans la liste mobile avec propriétés calculées `fullName` et `isVip`.

#### 3. `ScanResultModel`
- Modèle de données encapsulant le résultat du scan d'un QR code (Succès, Déjà scanné, Invalide).

---

### C. Services & Management Layer (State & API)

#### 1. `AuthProvider` & `GuestProvider`
- Gèrent l'état réactif (`ChangeNotifier`) de la session, de l'authentification (Standard et Google), et de la synchronisation de la liste des invités.

#### 2. `ApiService`
- Fournit la couche d'abstraction réseau pour communiquer avec les API REST Node.js (`/api/auth/login`, `/api/auth/google`, `/api/scan/verify`, etc.).

---

## 3. Matrice des Relations UML

| Classe Source | Cardinalité | Classe Cible | Type de Relation | Description |
| :--- | :---: | :--- | :---: | :--- |
| **User** | `1` | **Event** | Association | Un utilisateur peut créer plusieurs événements (`userId`). |
| **Event** | `1` | **Invites** | Composition | Un événement contient une liste d'invités (`idEvent`). |
| **Invites** | `1` | **QRCodeModel** | Composition | Un invité possède un QR Code unique pour l'entrée (`inviteId`). |
| **Event** | `1` | **TicketCategory** | Agrégation | Un événement propose des catégories de billets (`eventId`). |
| **TicketCategory** | `1` | **PurchasedTicket** | Association | Une catégorie est associée à plusieurs billets achetés. |
| **User** | `1` | **PurchasedTicket** | Association | Un contrôleur (User) effectue le scan d'un billet (`scannedBy`). |
| **AuthProvider** | `1` | **EventModel** | Agrégation | L'AuthProvider maintient l'événement sélectionné en cours. |
| **GuestProvider** | `1` | **GuestModel** | Agrégation | Le GuestProvider gère la collection des invités filtrables. |
