const crypto = require('crypto');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const BREVO_EMAIL_API_URL = 'https://api.brevo.com/v3/smtp/email';
const apiKey = process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.trim() : '';
const fromEmail = process.env.BREVO_FROM_EMAIL || 'arshidesign1@gmail.com';
const fromName = process.env.BREVO_FROM_NAME || 'ARSHI Events';

/**
 * Génère un code OTP cryptographique à 6 chiffres
 * @returns {string} Code à 6 chiffres (ex: "849201")
 */
function generateOTP() {
  const codeInt = crypto.randomInt(100000, 1000000);
  return String(codeInt);
}

/**
 * Hache un code OTP avec SHA-256 et un sel interne
 * @param {string} code
 * @returns {string} Hash hexadécimal
 */
function hashOTP(code) {
  const salt = process.env.JWT_SECRET || 'arshi_social_otp_salt_key_2026';
  return crypto.createHash('sha256').update(String(code) + salt).digest('hex');
}

/**
 * Vérifie si le code saisi correspond au hash stocké
 * @param {string} inputCode
 * @param {string} storedHash
 * @returns {boolean}
 */
function verifyOTPHash(inputCode, storedHash) {
  if (!inputCode || !storedHash) return false;
  try {
    const computedHash = hashOTP(String(inputCode).trim());
    return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));
  } catch (e) {
    return false;
  }
}

/**
 * Envoie le code de sécurité OTP par email réel via Brevo API
 * @param {Object} params
 * @param {string} params.toEmail - Adresse email réelle de destination
 * @param {string} params.userName - Nom de l'organisateur
 * @param {string} params.provider - Nom du réseau social ('facebook', 'instagram', etc.)
 * @param {string} params.accountName - Nom du compte vérifié
 * @param {string} params.otpCode - Code à 6 chiffres
 */
async function sendSocialOtpEmail({ toEmail, userName = 'Organisateur', provider = 'Réseau Social', accountName = '', otpCode }) {
  if (!toEmail || !toEmail.includes('@')) {
    throw new Error('Adresse email de destination invalide ou manquante pour l\'envoi du code OTP.');
  }

  if (!apiKey) {
    throw new Error('BREVO_API_KEY non configurée sur le serveur. Impossible d\'envoyer l\'email de sécurité.');
  }

  const capitalizedProvider = provider.charAt(0).toUpperCase() + provider.slice(1);
  const subject = `🔐 Code de vérification pour connecter ${capitalizedProvider} : ${otpCode}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 540px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); }
        .header { background: linear-gradient(135deg, #1e40af, #4338ca, #6d28d9); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 800; }
        .content { padding: 30px 28px; font-size: 14px; line-height: 1.6; color: #cbd5e1; }
        .account-card { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 14px 18px; margin: 20px 0; }
        .otp-box { background: #0f172a; border: 2px dashed #6366f1; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #38bdf8; margin: 8px 0; font-family: monospace; }
        .footer { padding: 18px 24px; background: #0b0f19; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1f2937; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Vérification de Compte Réseau Social</h1>
          <p style="margin: 6px 0 0; font-size: 12px; opacity: 0.85;">Authentification Obligatoire de Propriété</p>
        </div>
        <div class="content">
          <p>Bonjour <strong>${userName}</strong>,</p>
          <p>Une demande de synchronisation a été initiée pour associer le compte suivant à votre espace organisateur :</p>
          
          <div class="account-card">
            <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700;">Compte Réseau Social Détecté</div>
            <div style="font-size: 15px; font-weight: 800; color: #f8fafc; margin-top: 4px;">
              ${accountName || provider} (${capitalizedProvider})
            </div>
          </div>

          <p>Pour confirmer que vous êtes bien le propriétaire de ce compte et autoriser la synchronisation sur la plateforme, saisissez ce code à usage unique :</p>

          <div class="otp-box">
            <div style="font-size: 11px; color: #a5b4fc; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">Code Unique de Confirmation</div>
            <div class="otp-code">${otpCode}</div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">⏱️ Ce code expire dans <strong>10 minutes</strong>.</div>
          </div>

          <p style="font-size: 12px; color: #94a3b8;">
            🔒 <em>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email. Sans ce code, aucune synchronisation ne peut avoir lieu.</em>
          </p>
        </div>
        <div class="footer">
          © 2026 ARSHI Events — Sécurité & Synchronisation Réseaux Sociaux
        </div>
      </div>
    </body>
    </html>
  `;

  const sendSmtpEmail = {
    sender: { email: fromEmail, name: fromName },
    to: [{ email: toEmail, name: userName }],
    subject,
    htmlContent
  };

  try {
    const response = await axios.post(BREVO_EMAIL_API_URL, sendSmtpEmail, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log(`✉️ [BREVO] Email OTP envoyé avec succès à ${toEmail} pour le compte ${accountName}`);
    return { success: true, data: response.data };
  } catch (apiError) {
    const brevoError = apiError?.response?.data?.message || apiError.message;
    console.error('❌ Erreur envoi Brevo Email OTP:', brevoError);
    throw new Error(`Échec de l'envoi du code par email via Brevo : ${brevoError}`);
  }
}

module.exports = {
  generateOTP,
  hashOTP,
  verifyOTPHash,
  sendSocialOtpEmail
};
