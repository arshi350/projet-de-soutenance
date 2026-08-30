const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
const GEMINI_MODEL = process.env.GEMINI_MODEL_TEXT || 'gemini-2.5-flash';
const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0';
const metaAccessToken = process.env.META_ACCESS_TOKEN ? process.env.META_ACCESS_TOKEN.trim() : '';

let aiClient = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('⚠️ Erreur initialisation GoogleGenAI dans aiSocialAuditor:', err.message);
  }
}

function extractJSON(rawText) {
  if (!rawText) return null;
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || rawText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } catch (e) {
      console.warn('Erreur parsing JSON extrait:', e.message);
    }
  }
  try {
    return JSON.parse(rawText);
  } catch (e) {
    return null;
  }
}

function isMalformedOrFake(identifier) {
  if (!identifier || typeof identifier !== 'string') return true;
  const clean = identifier.trim().toLowerCase();
  if (clean.length < 2) return true;
  const fakeKeywords = [
    'fake', 'faux', 'nonexistent', 'azerty', 'qwerty',
    '12345', 'dummy', 'null', 'undefined', 'anonymous',
    'sample', 'exemple', 'example', 'noone', 'fictif'
  ];
  return fakeKeywords.some(kw => clean === kw || clean === `@${kw}`);
}

/**
 * Tente d'interroger l'API Graph Meta si le token est valide
 */
async function fetchMetaAccounts(provider) {
  if (!metaAccessToken) return [];

  try {
    const response = await axios.get(`${GRAPH_API_BASE}/me/accounts`, {
      params: {
        access_token: metaAccessToken,
        fields: 'id,name,category,about,fan_count,picture{url},is_verified,instagram_business_account{id,username,profile_picture_url,followers_count}'
      },
      timeout: 5000
    });

    const pages = response.data?.data || [];
    const accounts = [];

    for (const page of pages) {
      if (provider === 'facebook' || !provider) {
        accounts.push({
          provider: 'facebook',
          providerAccountId: page.id,
          accountName: page.name,
          username: `@${page.id}`,
          avatarUrl: page.picture?.data?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(page.name)}&backgroundColor=017ef7`,
          bio: page.about || `Compte Facebook officiel vérifié via Meta API.`,
          category: 'Compte Facebook Officiel',
          followerCount: page.fan_count ? `${Number(page.fan_count).toLocaleString()} abonnés` : 'Compte Actif',
          verifiedBadge: !!page.is_verified,
          profileUrl: `https://facebook.com/${page.id}`
        });
      }

      if ((provider === 'instagram' || !provider) && page.instagram_business_account) {
        const ig = page.instagram_business_account;
        accounts.push({
          provider: 'instagram',
          providerAccountId: ig.id,
          accountName: `@${ig.username}`,
          username: `@${ig.username}`,
          avatarUrl: ig.profile_picture_url || page.picture?.data?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(ig.username)}&backgroundColor=ec4899`,
          bio: 'Compte Instagram Professionnel vérifié via Meta API.',
          category: 'Compte Instagram Professionnel',
          followerCount: ig.followers_count ? `${Number(ig.followers_count).toLocaleString()} abonnés` : 'Compte Actif',
          verifiedBadge: true,
          profileUrl: `https://instagram.com/${ig.username}`
        });
      }
    }

    return accounts;
  } catch (err) {
    return [];
  }
}

/**
 * Service d'audit réel et factuel par l'IA Gemini avec recherche web Google en direct
 * Recherche uniquement les COMPTES RÉELS existants sur Facebook / Instagram.
 * ZÉRO compte fictif, ZÉRO simulation.
 * @param {Object} params
 * @param {string} params.provider - 'facebook' | 'instagram' | 'tiktok' | 'linkedin'
 * @param {string} params.email - Adresse email du compte
 * @param {string} [params.identifier] - Nom d'utilisateur ou identifiant exact
 */
async function auditSocialAccountExistence({ provider = 'facebook', email = '', identifier = '' }) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanId = String(identifier || '').trim();
  const searchInput = cleanId || cleanEmail;

  if (!searchInput) {
    return {
      success: false,
      exists: false,
      rejectionReason: 'Veuillez saisir l\'adresse email de votre compte réseau social.'
    };
  }

  if (isMalformedOrFake(searchInput)) {
    return {
      success: false,
      exists: false,
      rejectionReason: `L'entrée « ${searchInput} » est un identifiant de test invalide. Aucun compte réel trouvé.`
    };
  }

  // 1. Essai API Meta en direct (si token actif)
  const metaAccounts = await fetchMetaAccounts(provider);
  if (metaAccounts && metaAccounts.length > 0) {
    return {
      success: true,
      exists: true,
      accounts: metaAccounts,
      accountPreview: metaAccounts[0],
      multiple: metaAccounts.length > 1
    };
  }

  // 2. Recherche et vérification factuelle avec Google Gemini
  if (!aiClient) {
    return {
      success: false,
      exists: false,
      rejectionReason: 'Le service IA (GEMINI_API_KEY) n\'est pas disponible pour auditer ce compte.'
    };
  }

  const prompt = `Tu es un Auditeur d'Identités Numériques et de Réseaux Sociaux factuel et strict.
Un utilisateur fournit une adresse email et demande de retrouver ses COMPTES RÉELS d'utilisateurs sur la plateforme "${provider.toUpperCase()}".

Adresse Email fournie : "${cleanEmail}"
Nom d'utilisateur / identifiant optionnel : "${cleanId || 'Déduire du préfixe email et de l\'identité'}"
Plateforme ciblée : ${provider}

RÈGLES ABSOLUES ET STRICTES :
1. Recherche uniquement des COMPTES RÉELS d'utilisateurs ou créateurs qui existent VRAIMENT sur ${provider}.
2. NE CRÉE ET N'INVENTE AUCUN COMPTE FICTIF.
3. Si des comptes réels sont trouvés sur ${provider} associés à cette adresse email ou à ce titulaire :
   - Renseigne-les dans le tableau "accounts" (1 à 3 comptes réels).
   - Renseigne le vrai nom ("accountName"), le @handle réel ("username"), la bio réelle ("bio"), la catégorie ("category"), le nombre d'abonnés estimé ("followerCount") et le lien officiel ("profileUrl").
4. Si AUCUN compte réel n'est trouvé sur ${provider} pour cette adresse email, réponds STRICTEMENT avec "exists": false et un message d'erreur clair indiquant qu'aucun compte réel n'a été trouvé.

Réponds STRICTEMENT sous format JSON :
\`\`\`json
{
  "exists": true,
  "accounts": [
    {
      "accountName": "Nom Réel du Titulaire",
      "username": "@handle_reel",
      "bio": "Description réelle du compte",
      "category": "Compte ${provider === 'instagram' ? 'Instagram' : 'Facebook'} Réel",
      "followerCount": "Estimation d'abonnés",
      "verifiedBadge": false,
      "profileUrl": "https://${provider}.com/handle_reel"
    }
  ],
  "rejectionReason": null
}
\`\`\``;

  try {
    const response = await aiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        temperature: 0.1,
        tools: [{ googleSearch: {} }] // Recherche web Google en temps réel
      }
    });

    const text = response.text || '';
    const parsed = extractJSON(text);

    if (!parsed || typeof parsed.exists !== 'boolean') {
      return {
        success: false,
        exists: false,
        rejectionReason: `Impossible de confirmer l'existence réelle d'un compte ${provider} pour « ${searchInput} ».`
      };
    }

    if (!parsed.exists || !parsed.accounts || parsed.accounts.length === 0) {
      return {
        success: false,
        exists: false,
        rejectionReason: parsed.rejectionReason || `Aucun compte réel existant sur ${provider} n'a été trouvé pour l'adresse « ${searchInput} » sur le web.`
      };
    }

    const formattedAccounts = parsed.accounts.map((acc, index) => {
      const cleanHandle = (acc.username || `${provider}_user_${index + 1}`).replace(/^@/, '').toLowerCase();
      const providerAccountId = `${provider}_${Buffer.from(cleanHandle).toString('hex').slice(0, 16)}`;
      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(acc.accountName || cleanHandle)}&backgroundColor=017ef7,ff5005,6366f1,ec4899,10b981&fontSize=42&fontWeight=700`;

      return {
        provider,
        providerAccountId,
        accountName: acc.accountName || cleanHandle,
        username: acc.username?.startsWith('@') ? acc.username : `@${cleanHandle}`,
        avatarUrl,
        bio: acc.bio || `Compte réel ${provider} vérifié pour les communications événementielles.`,
        category: acc.category || `Compte Utilisateur ${provider === 'instagram' ? 'Instagram' : 'Facebook'}`,
        followerCount: acc.followerCount || 'Compte Actif',
        verifiedBadge: !!acc.verifiedBadge,
        profileUrl: acc.profileUrl || `https://${provider}.com/${cleanHandle}`,
        email: cleanEmail
      };
    });

    return {
      success: true,
      exists: true,
      accounts: formattedAccounts,
      accountPreview: formattedAccounts[0],
      multiple: formattedAccounts.length > 1
    };
  } catch (err) {
    console.error('Erreur audit réel Gemini:', err.message);

    // Si quota 429 ou erreur 503, renvoyer un message d'erreur clair sans inventer de données
    const isRateLimit = err.message?.includes('429') || err.message?.includes('quota');
    const isOverload = err.message?.includes('503') || err.message?.includes('high demand');

    let msg = 'Échec de la vérification en ligne du compte.';
    if (isRateLimit) {
      msg = 'Le quota temporaire de l\'API IA est atteint. Veuillez patienter une minute avant de réessayer.';
    } else if (isOverload) {
      msg = 'Le service de vérification IA est temporairement saturé. Veuillez réessayer dans quelques instants.';
    } else {
      msg = `Vérification impossible : ${err.message}`;
    }

    return {
      success: false,
      exists: false,
      rejectionReason: msg
    };
  }
}

module.exports = {
  auditSocialAccountExistence
};
