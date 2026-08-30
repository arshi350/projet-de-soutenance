const resendPackage = require('resend');
const Resend = resendPackage.Resend || resendPackage.default || resendPackage;
const fs = require('fs');

if (!Resend || typeof Resend !== 'function') {
  throw new Error('Unable to initialize Resend client: Resend constructor not found.');
}

// Expect process.env.RESEND_API_KEY
const client = new Resend(process.env.RESEND_API_KEY);

// invite: invitation document
// event: event document
// qrCodeBase64, ticketBase64: base64 strings
async function sendEmail(invite, event, qrCodeBase64, ticketBase64) {
  try {
    const toEmail = invite.inviteeEmail;
    if (!toEmail) return { success: false, error: 'Invite has no email' };

    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.4; color:#111">
        <h2>Bonjour ${invite.prenom} ${invite.nom},</h2>
        <p>${invite.message || `Vous êtes invité à ${event.titre}`}</p>
        <p>Présentez ce QR code à l'entrée :</p>
        <img src="cid:qrCode" alt="QR Code" style="max-width:240px;"/>
        <p>Billet en pièce jointe.</p>
        <p>À bientôt — ${event.titre}</p>
      </div>
    `;

    // prepare attachments: qr as inline cid, ticket as attachment
    const attachments = [];
    if (qrCodeBase64) {
      const qrBuffer = Buffer.from(qrCodeBase64, 'base64');
      attachments.push({
        filename: 'qrcode.png',
        type: 'image/png',
        disposition: 'inline',
        content: qrBuffer.toString('base64'),
        content_id: 'qrCode'
      });
    }
    if (ticketBase64) {
      const ticketBuffer = Buffer.from(ticketBase64, 'base64');
      attachments.push({
        filename: 'ticket.png',
        type: 'image/png',
        disposition: 'attachment',
        content: ticketBuffer.toString('base64')
      });
    }

    const res = await client.emails.send({
      from: process.env.RESEND_FROM || 'arshidesign1@gmail.com',
      to: toEmail,
      subject: `Votre invitation pour ${event.titre}`,
      html: html,
      // Resend client expects attachments in specific shape
      attachments: attachments
    });

    return { success: true, data: res };
  } catch (error) {
    console.error('resend error', error);
    return { success: false, error: error.message || error };
  }
}

module.exports = { sendEmail };
