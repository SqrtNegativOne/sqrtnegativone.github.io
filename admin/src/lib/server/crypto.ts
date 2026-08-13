import crypto from 'crypto';
import { env } from '$env/dynamic/private';
import { Result, ok, err } from 'neverthrow';

const ALGORITHM = 'aes-256-gcm';

function getKey() {
  const password = env.PRIVATE_NOTES_PASSWORD;
  if (!password) {
    console.warn("WARNING: PRIVATE_NOTES_PASSWORD is not set in .env. Using a fallback key for development only!");
  }
  const secret = password || 'development_fallback_password_do_not_use_in_prod';
  return crypto.createHash('sha256').update(String(secret)).digest();
}

export function encrypt(text: string): Result<string, Error> {
  if (!text) return err(new Error('Empty text provided'));
  return Result.fromThrowable(
    () => {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag().toString('hex');
      return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    },
    (e) => {
      console.error("Encryption failed", e);
      return e instanceof Error ? e : new Error(String(e));
    }
  )();
}

export function decrypt(hash: string): Result<string, Error> {
  if (!hash) return err(new Error('Empty hash provided'));
  return Result.fromThrowable(
    () => {
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
    },
    (e) => {
      console.error("Decryption failed", e);
      return e instanceof Error ? e : new Error(String(e));
    }
  )();
}
