const SocialAccount = require('../../models/socialMedia/socialAccount');
const SocialPost = require('../../models/socialMedia/socialPost');
const SocialVerification = require('../../models/socialMedia/socialVerification');
const { userModel } = require('../../models/user');
const { encryptToken, decryptToken } = require('../../utils/encryption');
const {
  verifyAccountWithCredentials,
  fetchUserPages,
  verifySpecificAccount,
  publishToFacebookPage,
  publishToInstagramBusiness
} = require('../../services/metaSocialService');
const { auditSocialAccountExistence } = require('../../services/aiSocialAuditor');
const {
  generateOTP,
  hashOTP,
  verifyOTPHash,
  sendSocialOtpEmail
} = require('../../services/socialOtpService');

/**
 * Masque une adresse email pour l'affichage (ex: arshidesign1@gmail.com -> a***1@gmail.com)
 */
function maskEmail(email) {
  if (!email || !email.includes('@')) return email || '';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}***@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

/**
 * Récupérer tous les comptes réseaux sociaux connectés de l'organisateur
 * GET /api/social/accounts
 */
const getConnectedAccounts = async (req, res) => {
  try {
    const userId = req.userId || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié.'
      });
    }

    const accounts = await SocialAccount.find({ userId, isActive: true }).select('-encryptedAccessToken');

    return res.status(200).json({
      success: true,
      data: accounts
    });
  } catch (error) {
    console.error('Erreur getConnectedAccounts:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des comptes connectés.',
      error: error.message
    });
  }
};

/**
 * ÉTAPE 1 : Découverte & Audit par l'IA des comptes liés à l'adresse email / identifiant et envoi de l'OTP réel
 * POST /api/social/ai-verify
 */
const aiVerifyAndInitiateSync = async (req, res) => {
  try {
    const userId = req.userId || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Session expirée. Veuillez vous reconnecter.'
      });
    }

    const { provider = 'facebook', email = '', identifier = '', contactEmail } = req.body;

    const currentUser = await userModel.findById(userId);
    const targetEmail = (email && email.trim()) || (contactEmail && contactEmail.trim()) || currentUser?.email;

    if (!targetEmail) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez saisir l\'adresse email associée à votre compte réseau social.'
      });
    }

    const userName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Organisateur';

    // 1. Audit IA & Découverte des comptes liés à cette adresse email
    const auditResult = await auditSocialAccountExistence({
      provider: provider.toLowerCase(),
      email: targetEmail,
      identifier: identifier.trim()
    });

    if (!auditResult.success || !auditResult.exists || !auditResult.accounts || auditResult.accounts.length === 0) {
      return res.status(400).json({
        success: false,
        exists: false,
        message: auditResult.rejectionReason || `Aucun compte réel associé à l'adresse « ${targetEmail} » n'a été trouvé sur ${provider}.`
      });
    }

    const accounts = auditResult.accounts;
    const isMultiple = accounts.length > 1;
    const defaultAccount = accounts[0];

    // 2. Génération du code OTP cryptographique à 6 chiffres
    const otpCode = generateOTP();
    const otpHash = hashOTP(otpCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 3. Enregistrement de la session dans MongoDB
    const verificationSession = await SocialVerification.findOneAndUpdate(
      { userId, provider: provider.toLowerCase(), email: targetEmail },
      {
        userId,
        provider: provider.toLowerCase(),
        email: targetEmail,
        identifier: identifier.trim(),
        discoveredAccounts: accounts,
        accountData: defaultAccount,
        otpHash,
        contactEmail: targetEmail,
        attempts: 0,
        isVerified: false,
        expiresAt
      },
      { upsert: true, new: true }
    );

    // 4. Envoi réel de l'email OTP via Brevo
    try {
      await sendSocialOtpEmail({
        toEmail: targetEmail,
        userName,
        provider,
        accountName: isMultiple ? `${accounts.length} comptes trouvés` : defaultAccount.accountName,
        otpCode
      });
    } catch (emailError) {
      console.error('Échec envoi email OTP:', emailError.message);
      return res.status(500).json({
        success: false,
        message: `Comptes trouvés mais impossible d'envoyer le code OTP à ${targetEmail} : ${emailError.message}`
      });
    }

    return res.status(200).json({
      success: true,
      message: isMultiple
        ? `✨ ${accounts.length} comptes trouvés pour ${maskEmail(targetEmail)} ! Veuillez choisir le compte à synchroniser et saisir le code de sécurité.`
        : `✨ Compte « ${defaultAccount.accountName} » trouvé ! Code expédié à ${maskEmail(targetEmail)}.`,
      data: {
        sessionId: verificationSession._id,
        multiple: isMultiple,
        accounts: accounts,
        accountPreview: defaultAccount,
        maskedEmail: maskEmail(targetEmail),
        expiresInSeconds: 600
      }
    });
  } catch (error) {
    console.error('Erreur aiVerifyAndInitiateSync:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur interne lors de la vérification du compte.',
      error: error.message
    });
  }
};

/**
 * ÉTAPE 2 : Validation du code OTP et confirmation du compte sélectionné
 * POST /api/social/validate-otp
 */
const validateOtpAndConfirmSync = async (req, res) => {
  try {
    const userId = req.userId || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié.'
      });
    }

    const { sessionId, otpCode, selectedAccountId } = req.body;

    if (!sessionId || !otpCode || !String(otpCode).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez saisir le code de vérification à 6 chiffres.'
      });
    }

    // 1. Recherche de la session
    const session = await SocialVerification.findOne({
      _id: sessionId,
      userId
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session de vérification introuvable ou expirée. Veuillez relancer la vérification.'
      });
    }

    // 2. Vérification de l'expiration
    if (new Date() > session.expiresAt) {
      await SocialVerification.findByIdAndDelete(sessionId);
      return res.status(400).json({
        success: false,
        message: 'Ce code a expiré. Veuillez demander un nouveau code.'
      });
    }

    // 3. Vérification des tentatives
    if (session.attempts >= session.maxAttempts) {
      await SocialVerification.findByIdAndDelete(sessionId);
      return res.status(403).json({
        success: false,
        message: 'Nombre maximal de tentatives dépassé. Veuillez relancer la vérification.'
      });
    }

    // 4. Validation OTP
    const isMatch = verifyOTPHash(String(otpCode).trim(), session.otpHash);

    if (!isMatch) {
      session.attempts += 1;
      await session.save();

      const remaining = session.maxAttempts - session.attempts;
      if (remaining <= 0) {
        await SocialVerification.findByIdAndDelete(sessionId);
        return res.status(403).json({
          success: false,
          message: 'Code incorrect. Nombre maximal de tentatives atteint.'
        });
      }

      return res.status(400).json({
        success: false,
        message: `Code incorrect. Il vous reste ${remaining} tentative(s).`
      });
    }

    // 5. Déterminer quel compte synchroniser (si sélectionné parmi plusieurs)
    let accountToSync = session.accountData;
    if (selectedAccountId && session.discoveredAccounts && session.discoveredAccounts.length > 0) {
      const found = session.discoveredAccounts.find(a => a.providerAccountId === selectedAccountId);
      if (found) {
        accountToSync = found;
      }
    }

    const { provider } = session;
    const defaultPageToken = process.env.META_ACCESS_TOKEN || 'arshi_verified_social_token_2026';
    const encryptedToken = encryptToken(defaultPageToken);

    const savedAccount = await SocialAccount.findOneAndUpdate(
      {
        userId,
        provider,
        providerAccountId: accountToSync.providerAccountId
      },
      {
        providerAccountId: accountToSync.providerAccountId,
        accountName: accountToSync.accountName,
        avatarUrl: accountToSync.avatarUrl,
        pageId: accountToSync.providerAccountId,
        instagramBusinessId: provider === 'instagram' ? accountToSync.providerAccountId : '',
        encryptedAccessToken: encryptedToken,
        isActive: true,
        metadata: {
          username: accountToSync.username,
          bio: accountToSync.bio,
          category: accountToSync.category,
          followerCount: accountToSync.followerCount,
          verifiedBadge: accountToSync.verifiedBadge,
          profileUrl: accountToSync.profileUrl,
          verifiedWithOtp: true,
          syncedEmail: session.email,
          syncedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    // Supprimer la session temporaire
    await SocialVerification.findByIdAndDelete(sessionId);

    return res.status(200).json({
      success: true,
      message: `🎉 Compte « ${savedAccount.accountName} » synchronisé avec succès !`,
      data: {
        _id: savedAccount._id,
        provider: savedAccount.provider,
        accountName: savedAccount.accountName,
        avatarUrl: savedAccount.avatarUrl,
        pageId: savedAccount.pageId,
        instagramBusinessId: savedAccount.instagramBusinessId,
        metadata: savedAccount.metadata
      }
    });
  } catch (error) {
    console.error('Erreur validateOtpAndConfirmSync:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la confirmation de synchronisation.',
      error: error.message
    });
  }
};

/**
 * Renvoyer un code OTP
 * POST /api/social/resend-otp
 */
const resendVerificationOtp = async (req, res) => {
  try {
    const userId = req.userId || req.user?.id || req.user?._id;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'ID de session manquant.'
      });
    }

    const session = await SocialVerification.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session de vérification introuvable ou expirée.'
      });
    }

    const currentUser = await userModel.findById(userId);
    const targetEmail = session.contactEmail || currentUser?.email;
    const userName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Organisateur';

    const newOtpCode = generateOTP();
    session.otpHash = hashOTP(newOtpCode);
    session.attempts = 0;
    session.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await session.save();

    await sendSocialOtpEmail({
      toEmail: targetEmail,
      userName,
      provider: session.provider,
      accountName: session.accountData?.accountName || session.provider,
      otpCode: newOtpCode
    });

    return res.status(200).json({
      success: true,
      message: `Un nouveau code a été envoyé à ${maskEmail(targetEmail)}.`,
      data: {
        sessionId: session._id,
        expiresInSeconds: 600
      }
    });
  } catch (error) {
    console.error('Erreur resendVerificationOtp:', error);
    return res.status(500).json({
      success: false,
      message: `Échec du renvoi du code : ${error.message}`,
      error: error.message
    });
  }
};

/**
 * Rétrocompatibilité
 */
const verifySocialCredentials = async (req, res) => {
  try {
    const { provider, email, password } = req.body;
    const result = await verifyAccountWithCredentials({ provider: provider || 'facebook', email, password });
    return res.status(200).json({ success: true, data: result.accountPreview });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const confirmSocialSync = async (req, res) => {
  try {
    const userId = req.userId || req.user?.id || req.user?._id;
    const { provider, providerAccountId, accountName, avatarUrl, email } = req.body;
    const encryptedToken = encryptToken(process.env.META_ACCESS_TOKEN || 'arshi_verified_social_token');

    const savedAccount = await SocialAccount.findOneAndUpdate(
      { userId, provider, providerAccountId },
      {
        providerAccountId,
        accountName,
        avatarUrl: avatarUrl || '',
        pageId: providerAccountId,
        instagramBusinessId: provider === 'instagram' ? providerAccountId : '',
        encryptedAccessToken: encryptedToken,
        isActive: true,
        metadata: { email: email || '', syncedAt: new Date() }
      },
      { upsert: true, new: true }
    );
    return res.status(200).json({ success: true, data: savedAccount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const connectMetaAccounts = async (req, res) => {
  try {
    const userId = req.userId || req.user?.id || req.user?._id;
    const { provider, identifier, accessToken, userAccessToken } = req.body;
    if (provider && identifier && (accessToken || userAccessToken)) {
      const { verifiedAccount } = await verifySpecificAccount({
        provider,
        identifier: identifier.trim(),
        accessToken: (accessToken || userAccessToken).trim()
      });
      const encryptedToken = encryptToken(verifiedAccount.pageAccessToken);
      const savedAccount = await SocialAccount.findOneAndUpdate(
        { userId, provider: verifiedAccount.provider, providerAccountId: verifiedAccount.providerAccountId },
        { ...verifiedAccount, encryptedAccessToken: encryptedToken, isActive: true },
        { upsert: true, new: true }
      );
      return res.status(200).json({ success: true, data: [savedAccount] });
    }
    return res.status(400).json({ success: false, message: 'Identifiants requis.' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const disconnectAccount = async (req, res) => {
  try {
    const userId = req.userId || req.user?.id || req.user?._id;
    const { id } = req.params;
    const account = await SocialAccount.findOneAndDelete({ _id: id, userId });
    if (!account) return res.status(404).json({ success: false, message: 'Compte introuvable' });
    return res.status(200).json({ success: true, message: 'Compte déconnecté.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const publishSocialPost = async (req, res) => {
  try {
    const userId = req.userId || req.user?.id || req.user?._id;
    const { eventId, platform, content, mediaUrl, socialAccountId } = req.body;

    if (!eventId || !platform || !content) {
      return res.status(400).json({ success: false, message: 'Données de publication incomplètes.' });
    }

    const account = socialAccountId 
      ? await SocialAccount.findOne({ _id: socialAccountId, userId, isActive: true })
      : await SocialAccount.findOne({ userId, provider: platform, isActive: true });

    if (!account) {
      return res.status(404).json({ success: false, message: `Aucun compte ${platform} actif associé.` });
    }

    const decryptedToken = decryptToken(account.encryptedAccessToken);
    let publishResult;

    if (platform === 'facebook') {
      publishResult = await publishToFacebookPage({
        pageId: account.pageId,
        pageAccessToken: decryptedToken,
        message: content,
        imageUrl: mediaUrl
      });
    } else if (platform === 'instagram') {
      publishResult = await publishToInstagramBusiness({
        igUserId: account.instagramBusinessId,
        pageAccessToken: decryptedToken,
        caption: content,
        imageUrl: mediaUrl
      });
    } else {
      return res.status(400).json({ success: false, message: `Plateforme ${platform} non supportée.` });
    }

    const savedPost = await SocialPost.create({
      eventId,
      userId,
      socialAccountId: account._id,
      platform,
      content,
      mediaUrl: mediaUrl || '',
      status: 'published',
      externalPostId: publishResult.postId || '',
      externalPostUrl: publishResult.postUrl || '',
      publishedAt: new Date()
    });

    return res.status(200).json({ success: true, data: savedPost });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getPostHistory = async (req, res) => {
  try {
    const { eventId } = req.params;
    const posts = await SocialPost.find({ eventId })
      .sort({ createdAt: -1 })
      .populate('socialAccountId', 'accountName provider avatarUrl');
    return res.status(200).json({ success: true, data: posts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getConnectedAccounts,
  aiVerifyAndInitiateSync,
  validateOtpAndConfirmSync,
  resendVerificationOtp,
  verifySocialCredentials,
  confirmSocialSync,
  connectMetaAccounts,
  disconnectAccount,
  publishSocialPost,
  getPostHistory
};
