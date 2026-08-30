const express = require('express');
const router = express.Router();
const socialController = require('../controller/social/socialController');
const authenticateToken = require('../middleware/authmiddlewre');

// Récupérer les comptes réseaux sociaux connectés
router.get('/accounts', authenticateToken, socialController.getConnectedAccounts);

// 1. Audit IA de l'existence réelle du compte et envoi de l'OTP
router.post('/ai-verify', authenticateToken, socialController.aiVerifyAndInitiateSync);

// 2. Validation du code OTP et confirmation définitive de la synchronisation
router.post('/validate-otp', authenticateToken, socialController.validateOtpAndConfirmSync);

// 3. Renvoyer un code de vérification OTP
router.post('/resend-otp', authenticateToken, socialController.resendVerificationOtp);

// Vérifier les identifiants (Email + Mot de passe) (rétrocompatibilité)
router.post('/verify-credentials', authenticateToken, socialController.verifySocialCredentials);

// Confirmer et enregistrer la synchronisation du compte vérifié (rétrocompatibilité)
router.post('/confirm-sync', authenticateToken, socialController.confirmSocialSync);

// Synchroniser / Associer des comptes Meta (Facebook / Instagram)
router.post('/connect-meta', authenticateToken, socialController.connectMetaAccounts);

// Déconnecter un compte social
router.delete('/accounts/:id', authenticateToken, socialController.disconnectAccount);

// Publier un post directement sur un réseau social
router.post('/publish', authenticateToken, socialController.publishSocialPost);

// Historique des publications pour un événement
router.get('/history/:eventId', authenticateToken, socialController.getPostHistory);

module.exports = router;
