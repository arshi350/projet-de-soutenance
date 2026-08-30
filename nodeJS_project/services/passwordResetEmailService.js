const axios = require('axios');

const apiKey = process.env.BREVO_API_KEY;
const BREVO_EMAIL_API_URL = 'https://api.brevo.com/v3/smtp/email';
const fromEmail = process.env.BREVO_FROM_EMAIL || 'no-reply@example.com';
const fromName = process.env.BREVO_FROM_NAME || 'ARSHI Event';

/**
 * Envoie un email contenant le code OTP pour la réinitialisation du mot de passe.
 * @param {string} email - Adresse email du destinataire
 * @param {string} userName - Nom complet de l'utilisateur
 * @param {string} otpCode - Code OTP à 6 chiffres (en clair)
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
async function sendOtpEmail(email, userName, otpCode) {
  try {
    if (!apiKey) {
      return { success: false, error: 'BREVO_API_KEY non configurée' };
    }

    const digits = otpCode.split('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0; padding:0; background-color:#f0f4f8; font-family:'Segoe UI',Roboto,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8; padding:40px 0;">
          <tr>
            <td align="center">
              <table width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #016BDC 0%, #0148a3 100%); padding:32px 40px; text-align:center;">
                    <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700; letter-spacing:-0.5px;">
                      ARSHI<span style="color:#FF5005;">EVENT</span>
                    </h1>
                    <p style="margin:8px 0 0; color:rgba(255,255,255,0.8); font-size:13px; letter-spacing:0.5px;">
                      Réinitialisation de mot de passe
                    </p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <p style="margin:0 0 8px; color:#1a1a2e; font-size:18px; font-weight:600;">
                      Bonjour ${userName},
                    </p>
                    <p style="margin:0 0 28px; color:#6b7280; font-size:14px; line-height:1.6;">
                      Vous avez demandé la réinitialisation de votre mot de passe. Utilisez le code ci-dessous pour continuer. Ce code est valable <strong>1 heure</strong>.
                    </p>
                    <!-- OTP Code -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding:20px 0;">
                          <table cellpadding="0" cellspacing="8">
                            <tr>
                              ${digits.map(d => `
                                <td style="width:48px; height:56px; background-color:#f0f9ff; border:2px solid #016BDC; border-radius:12px; text-align:center; vertical-align:middle;">
                                  <span style="font-size:28px; font-weight:800; color:#016BDC; letter-spacing:2px;">${d}</span>
                                </td>
                              `).join('')}
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:24px 0 0; color:#9ca3af; font-size:12px; line-height:1.5; text-align:center;">
                      Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email. Votre mot de passe restera inchangé.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color:#f9fafb; padding:20px 40px; border-top:1px solid #f0f0f0; text-align:center;">
                    <p style="margin:0; color:#9ca3af; font-size:11px;">
                      © ${new Date().getFullYear()} ARSHI EVENT • Sécurisé par chiffrement AES-256
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const sendSmtpEmail = {
      sender: { email: fromEmail, name: fromName },
      to: [{ email, name: userName }],
      subject: 'Votre code de vérification — ARSHI EVENT',
      htmlContent
    };

    console.log('\n==================================================');
    console.log(`🔑 CODE OTP POUR [${email}] : ${otpCode}`);
    console.log('==================================================\n');

    try {
      const response = await axios.post(BREVO_EMAIL_API_URL, sendSmtpEmail, {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      return { success: true, data: response.data };
    } catch (apiError) {
      console.error('Erreur API Brevo (IP ou clé non autorisée) :', apiError?.response?.data || apiError.message);
      // En mode développement, si l'IP n'est pas autorisée sur Brevo, on permet de poursuivre avec l'OTP affiché dans la console
      if (process.env.NODE_ENV !== 'production') {
        console.log(`ℹ️ [MODE DEV] Email non envoyé via Brevo (IP non autorisée). Utilisez le code OTP ci-dessus: ${otpCode}`);
        return { success: true, devMode: true, data: { message: 'Code affiché dans la console backend (Mode Développement)' } };
      }
      return { success: false, error: apiError?.response?.data?.message || apiError.message };
    }
  } catch (error) {
    console.error('Erreur envoi email OTP:', error?.response?.data || error.message);
    return { success: false, error: error.message || error };
  }
}

/**
 * Envoie un email de confirmation après la réinitialisation réussie du mot de passe.
 * @param {string} email - Adresse email du destinataire
 * @param {string} userName - Nom complet de l'utilisateur
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
async function sendPasswordResetConfirmation(email, userName) {
  try {
    if (!apiKey) {
      return { success: false, error: 'BREVO_API_KEY non configurée' };
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0; padding:0; background-color:#f0f4f8; font-family:'Segoe UI',Roboto,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8; padding:40px 0;">
          <tr>
            <td align="center">
              <table width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding:32px 40px; text-align:center;">
                    <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700; letter-spacing:-0.5px;">
                      ARSHI<span style="color:#ffffff;">EVENT</span>
                    </h1>
                    <p style="margin:8px 0 0; color:rgba(255,255,255,0.9); font-size:13px; letter-spacing:0.5px;">
                      ✓ Mot de passe modifié avec succès
                    </p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <p style="margin:0 0 8px; color:#1a1a2e; font-size:18px; font-weight:600;">
                      Bonjour ${userName},
                    </p>
                    <p style="margin:0 0 20px; color:#6b7280; font-size:14px; line-height:1.6;">
                      Votre mot de passe a été réinitialisé avec succès. Vous pouvez désormais vous connecter avec votre nouveau mot de passe.
                    </p>
                    <div style="background-color:#fef3c7; border-left:4px solid #f59e0b; padding:16px 20px; border-radius:8px; margin:20px 0;">
                      <p style="margin:0; color:#92400e; font-size:13px; line-height:1.5;">
                        <strong>⚠ Attention :</strong> Si vous n'êtes pas à l'origine de cette modification, veuillez contacter immédiatement notre support.
                      </p>
                    </div>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color:#f9fafb; padding:20px 40px; border-top:1px solid #f0f0f0; text-align:center;">
                    <p style="margin:0; color:#9ca3af; font-size:11px;">
                      © ${new Date().getFullYear()} ARSHI EVENT • Sécurisé par chiffrement AES-256
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const sendSmtpEmail = {
      sender: { email: fromEmail, name: fromName },
      to: [{ email, name: userName }],
      subject: 'Mot de passe réinitialisé — ARSHI EVENT',
      htmlContent
    };

    try {
      const response = await axios.post(BREVO_EMAIL_API_URL, sendSmtpEmail, {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      return { success: true, data: response.data };
    } catch (apiError) {
      console.warn('Notification email non envoyée (IP Brevo non autorisée):', apiError?.response?.data || apiError.message);
      return { success: true, devMode: true };
    }
  } catch (error) {
    console.error('Erreur envoi email confirmation reset:', error?.response?.data || error.message);
    return { success: false, error: error.message || error };
  }
}

module.exports = { sendOtpEmail, sendPasswordResetConfirmation };
