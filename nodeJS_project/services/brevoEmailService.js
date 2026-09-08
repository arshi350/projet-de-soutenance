const axios = require('axios');
const QRCode = require('qrcode');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  console.warn('BREVO_API_KEY non configuré - les envois d\'emails échoueront.');
}

const BREVO_EMAIL_API_URL = 'https://api.brevo.com/v3/smtp/email';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Upload le QR Code sur Cloudinary pour obtenir une URL CDN directe .png
 * 100% compatible avec l'application Gmail Mobile et Outlook sans blocage de proxy.
 */
async function uploadQrToCloudinary(dataUri, inviteId) {
  try {
    const res = await cloudinary.uploader.upload(dataUri, {
      folder: 'event_qrcodes',
      public_id: `qr_${inviteId || Date.now()}`,
      overwrite: true,
      resource_type: 'image',
      format: 'png'
    });
    return res.secure_url;
  } catch (err) {
    console.warn('Upload Cloudinary QR code ignoré/échoué:', err.message);
    return null;
  }
}

/**
 * Envoi d'un email d'invitation avec haute délivrabilité (Anti-Spam optimisé),
 * QR Code hébergé sur Cloudinary (garanti visible dans le carré blanc sur Gmail Mobile)
 * et pièce jointe téléchargeable.
 */
async function sendEmailViaBrevo(invite, event = {}, qrCodeBase64 = null, ticketBase64 = null) {
  try {
    const toEmail = invite.inviteeEmail || invite.email;
    if (!toEmail) return { success: false, error: "L'invité n'a pas d'adresse email valide." };

    const guestName = `${invite.prenom || ''} ${invite.nom || ''}`.trim() || 'Invité';
    const eventTitle = event.titre || event.title || event.name || 'Événement Officiel';
    const eventDate = event.DateDebut
      ? new Date(event.DateDebut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : 'Date à confirmer';
    const eventHour = event.heureDebut || '19h00';
    const eventLocation = event.lieu || 'Lieu communiqué sur confirmation';
    const isVip = (invite.guestStatus || invite.status || '').toLowerCase() === 'vip';

    const subject = isVip
      ? `Invitation personnelle (Accès Privilégié) - ${eventTitle}`
      : `Votre invitation officielle - ${eventTitle}`;

    // 1. Données du QR Code
    const qrDataPayload = JSON.stringify({
      _id: String(invite.inviteId || invite._id || ''),
      idEvent: String(invite.eventId || event._id || ''),
      nom: invite.nom || '',
      prenom: invite.prenom || ''
    });

    // 2. Génération locale du QR Code (Data URL et Buffer)
    let qrDataUri = '';
    let qrBase64Pure = '';
    try {
      qrDataUri = await QRCode.toDataURL(qrDataPayload, {
        width: 360,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      qrBase64Pure = qrDataUri.split(',')[1] || '';
    } catch (qrGenErr) {
      console.warn("Erreur génération buffer QR code:", qrGenErr.message);
    }

    // 3. Utiliser l'URL Cloudinary déjà hébergée ou uploader immédiatement
    let qrImageUrl = null;
    if (invite.qrCodeImage && (invite.qrCodeImage.startsWith('https://res.cloudinary.com') || invite.qrCodeImage.startsWith('http'))) {
      qrImageUrl = invite.qrCodeImage;
    } else if (qrDataUri) {
      qrImageUrl = await uploadQrToCloudinary(qrDataUri, invite._id?.toString() || invite.inviteId?.toString());
    }

    // Fallback CDN si Cloudinary échoue
    if (!qrImageUrl) {
      qrImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrDataPayload)}&size=300&margin=2&ecLevel=M`;
    }

    // 4. Liens RSVP
    const rsvpToken = invite.rsvpToken || invite._id?.toString();
    const rsvpBaseUrl = `${FRONTEND_URL}/rsvp/${rsvpToken}`;
    const confirmUrl = `${rsvpBaseUrl}?action=confirm`;
    const declineUrl = `${rsvpBaseUrl}?action=decline`;

    // 5. Version texte brut (Crucial pour passer les filtres anti-spam Gmail / Outlook)
    const textContent = `
Bonjour ${guestName},

Vous êtes cordialement invité(e) à l'événement : ${eventTitle}
Statut : ${isVip ? 'Invité VIP (Accès Privilégié)' : 'Invité Officiel'}

Date : ${eventDate}
Heure : À partir de ${eventHour}
Lieu : ${eventLocation}

Pour confirmer votre présence et afficher votre pass d'entrée :
${confirmUrl}

Si vous ne pouvez pas venir :
${declineUrl}
    `.trim();

    // 6. Template HTML prestige Thème Clair avec rendu parfait du QR Code et boutons d'action
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); overflow: hidden; text-align: center;">
          
          <!-- Bandeau Dégradé Officiel ARSHI EVENT -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #FF5005 0%, #EFB810 50%, #0B1727 100%); line-height: 6px; font-size: 0;">&nbsp;</td>
          </tr>

          <!-- En-tête Protocolaire -->
          <tr>
            <td style="padding: 36px 28px 16px 28px;">
              <div style="display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; ${isVip ? 'background-color: #fef3c7; color: #b45309; border: 1px solid #fde68a;' : 'background-color: #ffedd5; color: #c2410c; border: 1px solid #fed7aa;'}">
                ${isVip ? '★ INVITATION PRIVILÈGE VIP ★' : 'INVITATION OFFICIELLE'}
              </div>
              <h1 style="color: #0b1727; font-size: 24px; font-weight: 900; margin: 18px 0 10px 0; line-height: 1.25; letter-spacing: -0.5px;">
                ${eventTitle}
              </h1>
              <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.5;">
                Bonjour <strong style="color: #0b1727;">${guestName}</strong>, vous êtes cordialement convié(e) à cet événement d'exception.
              </p>
            </td>
          </tr>

          <!-- Carte QR Code Haute Sécurité -->
          <tr>
            <td style="padding: 10px 28px 20px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 20px; border: 1px solid #e2e8f0; padding: 24px;">
                <tr>
                  <td align="center">
                    <div style="font-size: 11px; font-weight: 800; color: #ff5005; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 16px;">
                      VOTRE PASS D'ACCÈS CERTIFIÉ
                    </div>
                    
                    <!-- Carré Blanc Épuré du QR Code -->
                    <table border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 18px; margin: 0 auto; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                      <tr>
                        <td align="center" style="padding: 16px; background-color: #ffffff; border-radius: 18px;">
                          <img 
                            src="${qrImageUrl}" 
                            alt="QR Code d'accès sécurisé" 
                            width="190" 
                            height="190" 
                            style="display: block; width: 190px; height: 190px; border: 0; outline: none; margin: 0 auto;" 
                          />
                        </td>
                      </tr>
                    </table>

                    <p style="color: #64748b; font-size: 12px; margin: 16px 0 20px 0; line-height: 1.4; font-weight: 500;">
                      Présentez ce QR Code directement sur votre smartphone à l'accueil.
                    </p>

                    <!-- Bouton Principal Vers la Page Web RSVP -->
                    <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                      <tr>
                        <td align="center" style="background-color: #ff5005; border-radius: 14px; box-shadow: 0 6px 18px rgba(255, 80, 5, 0.25);">
                          <a href="${rsvpBaseUrl}" style="display: inline-block; background-color: #ff5005; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 14px 28px; border-radius: 14px;">
                            📱 Consulter mon Pass & Confirmer ma Présence
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Détails de l'Événement -->
          <tr>
            <td style="padding: 0 28px 20px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="10" style="background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; text-align: left; font-size: 13px;">
                <tr>
                  <td width="32" align="center" style="font-size: 16px;">📅</td>
                  <td style="color: #0b1727; font-weight: 700;">${eventDate}</td>
                </tr>
                <tr>
                  <td width="32" align="center" style="font-size: 16px;">⏰</td>
                  <td style="color: #0b1727; font-weight: 700;">À partir de ${eventHour}</td>
                </tr>
                <tr>
                  <td width="32" align="center" style="font-size: 16px;">📍</td>
                  <td style="color: #0b1727; font-weight: 700;">${eventLocation}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Section Confirmation Rapide RSVP -->
          <tr>
            <td style="padding: 24px 28px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0;">
              <div style="color: #0b1727; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px;">
                Réponse rapide en un clic
              </div>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 10px;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="background-color: #10b981; border-radius: 12px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);">
                          <a href="${confirmUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 800; padding: 11px 26px; border-radius: 12px;">
                            ✓ Je confirme ma présence
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${declineUrl}" style="display: inline-block; color: #ef4444; text-decoration: none; font-size: 12px; font-weight: 700; padding: 6px 12px;">
                      ✕ Signaler mon absence
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pied de page -->
          <tr>
            <td style="padding: 20px 28px; color: #94a3b8; font-size: 11px; text-align: center;">
              Plateforme Intelligente de Gestion d'Événements • <strong>ARSHI EVENT</strong>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const fromEmail = process.env.BREVO_FROM_EMAIL || 'no-reply@arshievent.com';
    let fromName = (process.env.BREVO_FROM_NAME || 'ARSHI Design').replace(/%20/g, ' ');

    const sendSmtpEmail = {
      sender: {
        email: fromEmail,
        name: fromName,
      },
      to: [{ email: toEmail, name: guestName }],
      subject,
      textContent,
      htmlContent,
    };

    const response = await axios.post(BREVO_EMAIL_API_URL, sendSmtpEmail, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erreur brevoEmailService.sendEmailViaBrevo:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

/**
 * Envoi des identifiants (Email + Mot de passe par défaut) à l'agent de scan
 */
async function sendAgentCredentialsEmail({ agentEmail, agentName = 'Agent', defaultPassword, eventTitle, eventCode }) {
  try {
    if (!agentEmail) return { success: false, error: "Adresse email de l'agent manquante." };

    const subject = `Vos identifiants Agent de Scan - ${eventTitle || 'Événement'}`;

    const textContent = `
Bonjour ${agentName},

Un compte Agent de Scan vous a été attribué pour l'événement : ${eventTitle}

Voici vos identifiants pour vous connecter à l'application mobile ARSHI EVENT SCAN :
Email : ${agentEmail}
Mot de passe par défaut : ${defaultPassword}
Code d'événement : ${eventCode || 'Non spécifié'}

Veuillez télécharger l'application mobile, vous connecter et modifier votre mot de passe dès votre première connexion.
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: sans-serif; color: #f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; overflow: hidden; padding: 30px; text-align: left;">
          <tr>
            <td>
              <div style="font-size: 11px; font-weight: 800; color: #f97316; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                ACCÈS AGENT DE SCAN
              </div>
              <h2 style="color: #ffffff; font-size: 22px; margin: 0 0 16px 0;">Identifiants d'Accès Mobile</h2>
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">
                Bonjour <strong style="color: #ffffff;">${agentName}</strong>,<br>
                L'organisateur vous a inscrit comme Agent de Scan pour l'événement <strong style="color: #f97316;">${eventTitle}</strong>.
              </p>
              
              <div style="background-color: #0f172a; border-radius: 14px; border: 1px solid #334155; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #94a3b8;">Email de connexion : <strong style="color: #ffffff;">${agentEmail}</strong></p>
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #94a3b8;">Mot de passe par défaut : <strong style="color: #f97316; font-size: 16px; letter-spacing: 1px;">${defaultPassword}</strong></p>
                ${eventCode ? `<p style="margin: 0; font-size: 13px; color: #94a3b8;">Code d'Événement : <strong style="color: #38bdf8; font-size: 16px; letter-spacing: 2px;">${eventCode}</strong></p>` : ''}
              </div>

              <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
                Connectez-vous sur l'application mobile <strong>ARSHI SCAN</strong> pour commencer les contrôles d'entrée. N'oubliez pas de modifier votre mot de passe depuis les paramètres de votre compte.
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

    const fromEmail = process.env.BREVO_FROM_EMAIL || 'no-reply@arshievent.com';
    const fromName = (process.env.BREVO_FROM_NAME || 'ARSHI Event').replace(/%20/g, ' ');

    const sendSmtpEmail = {
      sender: { email: fromEmail, name: fromName },
      to: [{ email: agentEmail, name: agentName }],
      subject,
      textContent,
      htmlContent
    };

    const response = await axios.post(BREVO_EMAIL_API_URL, sendSmtpEmail, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erreur sendAgentCredentialsEmail:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

/**
 * Envoi automatique du Code d'Événement par mail aux agents
 */
async function sendEventCodeEmail({ agentEmail, agentName = 'Agent', eventTitle, eventCode }) {
  try {
    if (!agentEmail) return { success: false, error: "Adresse email de l'agent manquante." };

    const subject = `Code d'accès Événement : ${eventCode} - ${eventTitle}`;

    const textContent = `
Bonjour ${agentName},

Voici le code d'accès officiel pour effectuer le scan de l'événement : ${eventTitle}
CODE ÉVÉNEMENT : ${eventCode}

Utilisez ce code dans l'application mobile ARSHI SCAN pour déverrouiller le module de contrôle des invités.
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: sans-serif; color: #f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; padding: 30px; text-align: center;">
          <tr>
            <td>
              <div style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                CODE DE SCAN ÉVÉNEMENT
              </div>
              <h2 style="color: #ffffff; font-size: 22px; margin: 0 0 16px 0;">${eventTitle}</h2>
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
                Bonjour ${agentName}, voici le code unique d'accès pour scanner les billets et invités de cet événement.
              </p>
              
              <div style="background-color: #0f172a; border-radius: 16px; border: 2px dashed #38bdf8; padding: 24px; margin: 0 auto 20px auto; max-width: 320px;">
                <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">CODE DE SCAN</span><br>
                <strong style="color: #38bdf8; font-size: 32px; letter-spacing: 4px; display: inline-block; margin-top: 6px;">${eventCode}</strong>
              </div>

              <p style="color: #94a3b8; font-size: 13px;">
                Saisissez ce code dans votre application mobile pour activer le contrôle des pass.
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

    const fromEmail = process.env.BREVO_FROM_EMAIL || 'no-reply@arshievent.com';
    const fromName = (process.env.BREVO_FROM_NAME || 'ARSHI Event').replace(/%20/g, ' ');

    const sendSmtpEmail = {
      sender: { email: fromEmail, name: fromName },
      to: [{ email: agentEmail, name: agentName }],
      subject,
      textContent,
      htmlContent
    };

    const response = await axios.post(BREVO_EMAIL_API_URL, sendSmtpEmail, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erreur sendEventCodeEmail:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

module.exports = {
  sendEmailViaBrevo,
  sendAgentCredentialsEmail,
  sendEventCodeEmail,
};