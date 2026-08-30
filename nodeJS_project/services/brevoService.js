const axios = require('axios');

// Uses Brevo (Sendinblue) WhatsApp API to send template messages.
// Environment variables used:
// - BREVO_API_KEY
// - BREVO_WHATSAPP_SENDER (sender WhatsApp number approved in Brevo, e.g. "33712345678")
// - BREVO_WHATSAPP_TEMPLATE_ID (numeric template ID from the Brevo WhatsApp campaigns dashboard)
// - BREVO_WHATSAPP_API_URL (optional, default to Brevo v3 WhatsApp endpoint)

const BREVO_API_URL = process.env.BREVO_WHATSAPP_API_URL || 'https://api.brevo.com/v3/whatsapp/sendMessage';

/**
 * Normalize a phone number to digits only (Brevo expects no "+" and no spaces),
 * e.g. "+33 6 12 34 56 78" -> "33612345678"
 */
function normalizePhone(num) {
  if (!num) return num;
  return String(num).replace(/[^\d]/g, '');
}

/**
 * sendWhatsApp
 * @param {Object} invite - invitation document (expects invite.invitePhone / inviteePhone / telephone)
 * @param {Object} event - event document (used to format message params)
 * @param {Object} opts - optional: { templateId, senderNumber, params }
 *   - templateId: numeric Brevo WhatsApp template ID (REQUIRED by Brevo for the first message to a contact)
 *   - senderNumber: WhatsApp sender number approved in Brevo
 *   - params: flat object of key/value pairs matching the variables defined in the Brevo template
 * Returns: { success: boolean, data|error }
 */
async function sendWhatsApp(invite, event, opts = {}) {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) return { success: false, error: 'BREVO_API_KEY not set' };

    const rawTo = invite.invitePhone || invite.inviteePhone || invite.telephone;
    const to = normalizePhone(rawTo);
    if (!to) return { success: false, error: 'No recipient phone number' };

    const senderNumber = normalizePhone(
      opts.senderNumber || process.env.BREVO_WHATSAPP_SENDER
    );
    if (!senderNumber) return { success: false, error: 'BREVO_WHATSAPP_SENDER not set' };

    const templateId = opts.templateId || process.env.BREVO_WHATSAPP_TEMPLATE_ID;
    if (!templateId) {
      return {
        success: false,
        error:
          'Missing templateId. Create/approve a WhatsApp template in Brevo (Campaigns > WhatsApp) and pass its numeric ID via opts.templateId or BREVO_WHATSAPP_TEMPLATE_ID.'
      };
    }

    // params must be a flat key/value object matching the variables defined
    // in your Brevo template (names depend on how the template was configured).
    const params = opts.params || {
      NOM: `${invite.prenom || ''} ${invite.nom || ''}`.trim(),
      EVENT: event.titre || '',
      LIEU: event.lieu || event.location || '',
      DATE: event.date ? new Date(event.date).toLocaleString('fr-FR') : ''
    };

    // Correct Brevo payload shape (see https://developers.brevo.com/reference/send-whatsapp-message)
    const payload = {
      templateId: Number(templateId),
      senderNumber,
      contactNumbers: [to],
      params
    };

    const res = await axios.post(BREVO_API_URL, payload, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      timeout: 15000
    });

    return { success: true, data: res.data };
  } catch (error) {
    // return structured error for caller
    const message = error.response?.data || error.message || error;
    console.error('brevo whatsapp error', message);
    return { success: false, error: message };
  }
}

module.exports = { sendWhatsApp };