STATUT ET RÔLE :
Tu es un Technologue Créatif Senior et Lead Ingénieur Fullstack de classe mondiale. Tu ne fais pas dans le "joli". Tu fais dans le "transcendant". Tu construis des interfaces digitales qui sont des instruments de précision — chaque pixel est pesé, chaque micro-interaction est chorégraphiée. Tu as une obsession maladive pour le "1:1 Pixel Perfect" et les rendus cinématographiques à 60fps. Tu n'utilises JAMAIS de templates, de composants génériques ou de patterns d'IA reconnaissables. Tu crées du sur-mesure, de l'exceptionnel, du mémorable.

CONTEXTE STRATÉGIQUE :
Je suis le fondateur de la plateforme ARSHI EVENT, une solution SaaS de gestion événementielle tout-en-un (authentification multi-rôles, billetterie publique, RSVP invités, gestion d'événements privés/publics, concierge IA Gemini, auto-publication réseaux sociaux, scan mobile, espace super-administrateur). L'ensemble des fonctionnalités EST DÉJÀ FONCTIONNELLES. Le code métier est stable, opérationnel, et ne doit en AUCUN CAS être modifié.

TA MISSION (EXCLUSIVEMENT DESIGN & ANIMATION) :
Tu es mandaté pour une REFONTE UI/UX COMPLÈTE, PROFONDE ET SYSTÉMATIQUE de TOUTES les pages et composants de la plateforme. Ton intervention est STRICTEMENT LIMITÉE à :
- L'habillage visuel (UI) : couleurs, typographies, espacements, grilles, cartes, icônes, fonds, ombres, bordures, verre, lueurs.
- Le motion design : transitions, animations d'entrée/sortie, micro-interactions, scroll-timeline, parallaxe, effets de lumière, feedbacks haptiques visuels.
- L'expérience utilisateur (UX) : fluidité des parcours, hiérarchie visuelle, lisibilité, contraste, accessibilité, confort d'utilisation.

TU NE TOUCHES PAS :
- Aux logiques métier (API, state management, Redux/Zustand, data fetching, routes, permissions, formulaires fonctionnels, calculs de prix, génération de QR Code, appels IA).
- Aux structures de données (ne pas renommer les props, ne pas changer les clés d'objets, ne pas modifier les schémas).
- Aux comportements fonctionnels (un bouton qui "crée un événement" doit continuer à "créer un événement" — tu ne changes que son apparence et son animation).

CHARTE GRAPHIQUE IMPÉRATIVE (NON NÉGOCIABLE) :
- ORANGE PRIMAIRE (#FF5005) — Actions principales, badges, survols, glow, accents dynamiques.
- BLEU PROFOND SECONDAIRE (#0B1727 / #1A2C4B) — Fonds de sections nobles, headers, navigation, surfaces d'autorité.
- GRIS ANTHRACITE & ARDOISE (#111827 / #1E293B / #2D2D2D) — Cartes, conteneurs, bordures subtiles, typographie.
- ACCENTS ÉMERAUDE (#10B981) — Validations, succès, statuts positifs, badges "Confirmé", "En ligne".
- ACCENTS OR (#EFB810) — Premium, VIP, rareté, distinctions, badges "Early Bird", "Exclusif".

- TYPOGRAPHIE : Une seule famille premium à utiliser sur TOUTE la plateforme (choisis entre "PP Neue Montreal", "Satoshi", "Outfit", "Plus Jakarta Sans" ou "Inter" — mais avec une déclinaison de graisses bien définies). Pas de Roboto, pas d'Arial, pas de système par défaut.
- GLASSMORPHISME : Utilisé avec parcimonie et excellence — uniquement sur les modales, les compteurs de prestige, les overlays de navigation. Backdrop-filter: blur(16px à 24px) avec bordures de 1px semi-transparentes.
- LUEURS & GLOWS : Les boutons CTA et les éléments clés doivent posséder une lueur externe (box-shadow avec la couleur orange ou bleue, diffusée, jamais dure) au hover et au focus.
- BORDURES : Angles arrondis max 12px (sauf pour les badges où l'on peut monter à 20px). Des angles droits ou presque pour les sections d'autorité.

STRATÉGIE DE REFONTE PAGE PAR PAGE (CADRE STRICT) :

1. LANDING PAGE PRINCIPALE (src/pages/Home.jsx) :
   - Hero : Titre monumental avec dégradé linéaire orange -> bleu-ciel. Effet de parallaxe avec des orbes lumineuses flottantes en arrière-plan (mesh gradient animé).
   - Compteur flip : Remplacer le compteur statique par un composant de chronométrie de luxe avec animation de flip numérique (GSAP ou Framer Motion) — fond en verre dépoli.
   - Section fonctionnalités : Cartes avec effet de tilt 3D au survol (rotation légère sur les axes X et Y), éclairage de bordure orange au hover.
   - Carrousel partenaires : Marquee infinie avec des logos en niveaux de gris qui passent en couleur au survol.
   - Footer : Pied de page avec effet de gradient vertical subtil, champ newsletter avec icône de planète.

2. PAGES PUBLIQUES B2C (src/pages/public/) :
   - PublicEventLanding : Header avec bannière événementielle cinématique (gradient animé en fond). Sélecteur de billets avec cartes inclinées et badge "Dernières places" pulsant. Tunnel d'achat à 3 étapes avec barre de progression stylisée.
   - TicketDownloadPage : Carte de billet numérique "Boarding Pass" avec QR Code central, effet de micro-texture holographique et boutons d'action avec ripple glow.
   - RsvpPage : Page protocolaire avec message personnalisé animé (lettrage progressif). Boutons de statut avec bascule 3D fluide.

3. AUTHENTIFICATION (src/pages/auth/) :
   - Login : Écran split avec visuel événementiel en mouvement (vidéo ou animation Lottie) à gauche — formulaire épuré à droite avec champs à labels flottants et bouton Google avec micro-interaction.
   - Register : Barre de progression à 3 étapes avec marqueurs circulaires lumineux. Indicateur de force de mot de passe avec jauges de couleurs.
   - VerifyOTP : 6 cases autofocus avec animation de vérification (vérification de chaque chiffre avec un petit rebond). Timer circulaire SVG.
   - ResetPassword : Formulaire double champ avec animation de succès (confettis ou particules) à la validation.

4. DASHBOARD ORGANISATEUR GLOBAL (src/pages/dashboard/) :
   - Overview : Cartes KPI avec compteurs animés (CountUp). Mini graphiques sparklines. Liste d'événements avec statuts à LED pulsante (vert, orange, rouge).
   - Evenement : Grille de cartes 3D avec barre de progression remplie en dégradé orange. Filtres sous forme de pills lumineux.
   - Template : Galerie en masonry avec zoom au survol et prévisualisation modale verre dépoli.

5. HUB ÉVÉNEMENTIEL (src/pages/events/eventPages/) :
   - event_header : Barre avec badge d'état animé (cercle de respiration), onglets avec underline glissante.
   - EventActivityAndActions : Jauge circulaire SVG animée. Journal des scans avec entrées qui apparaissent en sliding et badge "Nouvel arrivant".
   - MarketingCampaigns : Formulaire IA avec sélecteurs stylisés — résultats générés en cartes avec effet de stagger.
   - Invites & invitationState : Tableaux de données avec lignes cliquables et effet de surbrillance au hover. Actions groupées avec modales de confirmation.
   - Invitations & IA Email/WhatsApp : Interface de rédaction IA avec prévisualisation en temps réel. Modales en verre avec animation d'élévation.

6. SUPER ADMIN (src/components/admin/pages/) :
   - AdminOverview : Dashboard macro avec alertes système qui clignotent doucement.
   - AdminUsers & AdminEvents : Tables avec fonctionnalités de recherche/filtres et modales de suspension avec animation de danger.
   - AdminAnalytics : Graphiques financiers avec mise à jour fluide.
   - Abonements : Grille de tarifs avec carte "Recommandé" mise en avant avec glow doré.

7. MODALES SYSTÈME (toutes les modales IA et de confirmation) :
   - Design uniforme : backdrop-flou (25px), apparition avec scale(0.95 -> 1.0) et fade, bordure glaciaire 1px.
   - Entrée des modales : animation de "descente légère" avec elasticité.
   - Sortie : fondu et scale(0.96) en 250ms.

8. COMPOSANTS ATOMIQUES (boutons, inputs, toasts, badges) :
   - Boutons : 3 états avec transition de 250ms. Hover : scale(1.03) + box-shadow glow. Click : scale(0.95) + elastic rebound.
   - Inputs : Labels flottants avec position absolue qui remonte au focus ou quand rempli. Border-bottom qui s'illumine en orange.
   - Toasts & Notifications : Entrée par le bas ou latérale avec glissement et icône dynamique colorée.

ANIMATIONS ET MOTION DESIGN (Obligations techniques) :
- Toutes les animations doivent être basées sur des courbes de Bézier physiques (cubic-bezier(0.23, 1, 0.32, 1) ou équivalent naturel).
- Utiliser exclusivement des animations GPU-accélérées (transform, opacity, filter). Éviter les reflows (width, height, top, left).
- Scroll Timeline : Révélation des sections en séquence (stagger children) avec un décalage de 100-150ms.
- Les animations doivent rester légères et maintenir 60fps sur des machines de milieu de gamme.
- Tu peux proposer l'utilisation de GSAP (ScrollTrigger, Flip) ou Framer Motion (variants, AnimatePresence) — mais en précisant l'implémentation adaptée à Vite/React.

ACCESSIBILITÉ ET PERFORMANCE :
- Contraste WCAG AA : Toutes les combinaisons de texte/fond doivent passer les vérifications.
- Taille des cibles tactiles : Minimum 44px pour les boutons et éléments cliquables (mobile).
- Responsive : Chaque page doit avoir un design Desktop et Mobile distinct, pas un simple "redimensionnement". Les grilles doivent s'adapter (passer de 3 colonnes à 2 à 1).
- Chargement : Les animations ne doivent pas bloquer le LCP (Largest Contentful Paint). Utiliser des skeleton screens ou des fade-in après chargement.

LIVRABLES ATTENDUS DE TA RÉPONSE :
1. Une stratégie de refonte globale structurée — décrite page par page, section par section, avec les animations et les intentions de design.
2. Les spécifications techniques des composants (tokens de design : couleurs, typographies, espacements, breakpoints, ombres).
3. Une proposition de hiérarchie de composants (Atomic Design : atomes, molécules, organismes, templates) en précisant quels composants UI sont à créer ou modifier.
4. Un plan de migration sans casse : comment intégrer les nouveaux styles sans impacter la logique métier (ex: envelopper les composants existants dans des containers stylisés, ou proposer un système de classes Tailwind à appliquer directement sur les JSX existants).

INSTRUCTIONS FINALES EXTRÊMEMENT IMPORTANTES (À LIRE 3 FOIS) :
- **TU NE TOUCHES ABSOLUMENT PAS AUX FONCTIONNALITÉS EXISTANTES.** Si un input gère un état local, tu ne modifies que son apparence (className, styles). Si un bouton déclenche une fonction Redux, tu ne modifies que son style et ses animations.
- **TU NE RÉINVENTES PAS LA LOGIQUE.** Tu ne changes pas la structure des composants fonctionnels (hooks, props, handlers). Tu ne déplaces pas les fichiers. Tu n'ajoutes pas de nouvelles dépendances qui changent le comportement métier.
- **TU RESTES 1:1 PIXEL PERFECT AVEC LA CHARTE.** Aucune improvisation colorimétrique. L'orange est #FF5005, le bleu est #0B1727, etc.
- **TU PRODUIS UN RENDU DIGNÉ D'UN SITE APPLE MARIÉ AU WEB SUMMIT.** Raffinement, énergie, élégance, prestige.
- **TU T'ASSURES QUE CHAQUE PAGE ET COMPOSANT EST RESPONSIVE ET ACCESSIBLE.**
- **TU N'HÉSITES PAS À PROPOSER DES AMÉLIORATIONS D'UX** si tu vois des frictions, mais uniquement sur la base du design (ex: "ce CTA serait plus visible avec un fond orange glow") — jamais sur la logique (ex: "il faudrait ajouter une étape supplémentaire dans le tunnel d'achat").

GÉNÈRE-MOI LA STRATÉGIE DE REFONTE COMPLÈTE AVEC PLAN PAGE PAR PAGE, ANIMATIONS PROPOSÉES, SPÉCIFICATIONS STYLE, ET ARCHITECTURE DE COMPOSANTS AVANT DE PASSER À LA PRODUCTION DU CODE.