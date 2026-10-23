import { existsSync, readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

export interface EnvConfig {
  baseUrl: string;
  loginPath: string;
  searchPath: string;
  [key: string]: string;
}

export const ENV_JSON_PATH = path.resolve(process.cwd(), 'data', 'envData', 'envUrls.json');
export const ENV_ENC_PATH = path.resolve(process.cwd(), 'data', 'envData', 'envUrls.json.enc');

let cachedEnv: EnvConfig | null = null;

function getSecret(): string {
  const secret = process.env.ENV_SECRET;
  if (!secret) {
    throw new Error('ENV_SECRET is required to encrypt/decrypt envUrls.json');
  }
  return secret;
}

export function decryptEnvFile(): void {
  const secret = getSecret();

  if (!existsSync(ENV_ENC_PATH)) {
    throw new Error(`Encrypted env file not found at ${ENV_ENC_PATH}. Run npm run encrypt-env first.`);
  }

  const encryptedData = readFileSync(ENV_ENC_PATH);
  const iv = encryptedData.slice(0, 16);
  const ciphertext = encryptedData.slice(16);
  const key = crypto.createHash('sha256').update(secret).digest();
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  try {
    const decryptedData = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    cachedEnv = JSON.parse(decryptedData.toString('utf8')) as EnvConfig;
  } catch {
    throw new Error('Failed to decrypt envUrls.json.enc. Check that ENV_SECRET matches the key used to encrypt it.');
  }
}

export function encryptEnvFile(): void {
  const secret = getSecret();
  const plainText = cachedEnv ? JSON.stringify(cachedEnv, null, 2) : (existsSync(ENV_JSON_PATH) ? readFileSync(ENV_JSON_PATH, 'utf8') : '');

  if (!plainText) {
    return;
  }

  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(secret).digest();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encryptedData = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);

  writeFileSync(ENV_ENC_PATH, Buffer.concat([iv, encryptedData]));
  cachedEnv = null;
}

export function getEnvConfig(): EnvConfig {
  if (cachedEnv) {
    return cachedEnv;
  }

  if (existsSync(ENV_JSON_PATH)) {
    cachedEnv = JSON.parse(readFileSync(ENV_JSON_PATH, 'utf8')) as EnvConfig;
    return cachedEnv;
  }

  decryptEnvFile();

  if (!cachedEnv) {
    throw new Error('Environment configuration could not be loaded.');
  }

  return cachedEnv;
}
