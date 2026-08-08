import crypto from 'crypto';
import { env } from '$env/dynamic/private';

const ALGORITHM = 'aes-256-gcm';

function getKey() {
  const password = env.PRIVATE_NOTES_PASSWORD;
  if (!password) {
    console.warn("WARNING: PRIVATE_NOTES_PASSWORD is not set in .env. Using a fallback key for development only!");
  }
  const secret = password || 'development_fallback_password_do_not_use_in_prod';
  return crypto.createHash('sha256').update(String(secret)).digest();
}

export function encrypt(text: string): string {
  if (!text) return '';
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error("Encryption failed", err);
    return '';
  }
}

export function decrypt(hash: string): string {
  if (!hash) return '';
  try {
    const parts = hash.split(':');
    if (parts.length !== 3) return hash; // might not be encrypted, just return it
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error("Decryption failed", err);
    return '--- decryption failed (invalid password or corrupted data) ---'; 
  }
}
