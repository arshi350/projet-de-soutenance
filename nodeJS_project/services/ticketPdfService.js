const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'billet_secret_key_antigravity_2026';

/**
 * Service de génération et signature de billets publics sécurisés
 */
class TicketPdfService {
    /**
     * Génère un token cryptographique signé pour le QR Code
     */
    generateSignedTicketToken({ ticketId, eventId, ticketNumber, buyerEmail }) {
        return jwt.sign(
            {
                ticketId,
                eventId,
                ticketNumber,
                buyerEmail,
                issuedAt: Date.now(),
                nonce: crypto.randomBytes(8).toString('hex')
            },
            JWT_SECRET,
            { expiresIn: '365d' }
        );
    }

    /**
     * Vérifie la signature du token QR Code
     */
    verifyTicketToken(token) {
        try {
            return {
                valid: true,
                payload: jwt.verify(token, JWT_SECRET)
            };
        } catch (err) {
            return {
                valid: false,
                error: err.message
            };
        }
    }

    /**
     * Génère une image DataURL haute résolution pour le QR Code
     */
    async generateQrCodeDataUrl(data) {
        return await QRCode.toDataURL(typeof data === 'string' ? data : JSON.stringify(data), {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 320,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
    }

    /**
     * Génère une vue HTML formatée pour le billet téléchargeable ou imprimable
     */
    generateTicketHtml({ event, category, ticket, qrCodeDataUrl }) {
        const bgStyle = category.aiBackgroundUrl 
            ? `background-image: linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.85)), url('${category.aiBackgroundUrl}'); background-size: cover; background-position: center;`
            : `background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);`;

        return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <title>Billet Officiel - ${event.titre}</title>
            <style>
                body {
                    margin: 0;
                    padding: 40px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #0b0f19;
                    color: #f8fafc;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }
                .ticket-card {
                    width: 720px;
                    border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
                    overflow: hidden;
                    display: flex;
                    ${bgStyle}
                }
                .ticket-main {
                    flex: 1;
                    padding: 36px;
                    border-right: 2px dashed rgba(255, 255, 255, 0.2);
                    position: relative;
                }
                .badge {
                    display: inline-block;
                    padding: 6px 16px;
                    background: linear-gradient(135deg, #6366f1, #a855f7);
                    border-radius: 9999px;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    margin-bottom: 16px;
                }
                .event-title {
                    font-size: 26px;
                    font-weight: 800;
                    margin: 0 0 16px 0;
                    color: #ffffff;
                }
                .details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-top: 24px;
                }
                .detail-item label {
                    display: block;
                    font-size: 11px;
                    text-transform: uppercase;
                    color: #94a3b8;
                    margin-bottom: 4px;
                }
                .detail-item span {
                    font-size: 14px;
                    font-weight: 600;
                    color: #f1f5f9;
                }
                .ticket-stub {
                    width: 240px;
                    padding: 30px 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: rgba(15, 23, 42, 0.85);
                    text-align: center;
                }
                .qr-container {
                    background: white;
                    padding: 10px;
                    border-radius: 16px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
                }
                .qr-container img {
                    width: 150px;
                    height: 150px;
                    display: block;
                }
                .ticket-num {
                    font-family: monospace;
                    font-size: 12px;
                    color: #94a3b8;
                    margin-top: 14px;
                    font-weight: 700;
                }
                .security-note {
                    font-size: 10px;
                    color: #64748b;
                    margin-top: 8px;
                }
            </style>
        </head>
        <body>
            <div class="ticket-card">
                <div class="ticket-main">
                    <div class="badge">${category.name}</div>
                    <h1 class="event-title">${event.titre}</h1>
                    
                    <div class="details-grid">
                        <div class="detail-item">
                            <label>Titulaire</label>
                            <span>${ticket.buyerName}</span>
                        </div>
                        <div class="detail-item">
                            <label>Prix Payé</label>
                            <span>${ticket.totalAmount.toFixed(2)} €</span>
                        </div>
                        <div class="detail-item">
                            <label>Date de l'événement</label>
                            <span>${new Date(event.DateDebut).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div class="detail-item">
                            <label>Lieu</label>
                            <span>${event.lieu}</span>
                        </div>
                    </div>
                </div>
                <div class="ticket-stub">
                    <div class="qr-container">
                        <img src="${qrCodeDataUrl}" alt="QR Code d'accès" />
                    </div>
                    <div class="ticket-num">${ticket.ticketNumber}</div>
                    <div class="security-note">Présentez ce QR Code unique à l'entrée</div>
                </div>
            </div>
        </body>
        </html>
        `;
    }
}

module.exports = new TicketPdfService();
