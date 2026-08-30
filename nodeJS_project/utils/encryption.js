const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Récupère une clé de 32 octets (256 bits) à partir d'un secret d'environnement ou du JWT_SECRET
function getEncryptionKey() {
  const secret = process.env.SOCIAL_ENCRYPTION_SECRET || process.env.JWT_SECRET || 'arshi_default_super_secret_social_key_32b';
  return crypto.createHash('sha256').update(String(secret)).digest();
}

/**
 * Chiffre une chaîne de caractères (ex: token d'accès)
 * @param {string} plainText
 * @returns {string} format "ivHex:authTagHex:encryptedHex"
 */
function encryptToken(plainText) {
  if (!plainText) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Déchiffre une chaîne chiffrée
 * @param {string} encryptedString format "ivHex:authTagHex:encryptedHex"
 * @returns {string}
 */
function decryptToken(encryptedString) {
  if (!encryptedString) return '';
  const parts = encryptedString.split(':');
  if (parts.length !== 3) {
    // Si la chaîne n'est pas chiffrée selon le format, retourne tel quel par sécurité rétrocompatible
    return encryptedString;
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

module.exports = {
  encryptToken,
  decryptToken
};
