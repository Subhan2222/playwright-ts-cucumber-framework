import { existsSync, readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

export interface UserData {
  UserId?: number;
  UserName?: string;
  UserPassword?: string;
  [key: string]: string | number | undefined;
}

export const USER_DATA_DIR = path.resolve(process.cwd(), 'data', 'userData');
export const USER_DATA_JSON_PATH = path.resolve(USER_DATA_DIR, 'userData.json');
export const USER_DATA_ENC_PATH = path.resolve(USER_DATA_DIR, 'userData.json.enc');

let cachedUserData: UserData | null = null;

function getSecret(): string {
  const secret = process.env.USER_SECRET ?? process.env.ENV_SECRET;
  if (!secret) {
    throw new Error('USER_SECRET or ENV_SECRET is required to encrypt/decrypt userData.json');
  }
  return secret;
}

export function decryptUserDataFile(): void {
  const secret = getSecret();

  if (!existsSync(USER_DATA_ENC_PATH)) {
    if (existsSync(USER_DATA_JSON_PATH)) {
      cachedUserData = JSON.parse(readFileSync(USER_DATA_JSON_PATH, 'utf8')) as UserData;
      return;
    }
    throw new Error(`Encrypted user data file not found at ${USER_DATA_ENC_PATH}.`);
  }

  const encryptedData = readFileSync(USER_DATA_ENC_PATH);
  const iv = encryptedData.slice(0, 16);
  const ciphertext = encryptedData.slice(16);
  const key = crypto.createHash('sha256').update(secret).digest();
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  try {
    const decryptedData = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    cachedUserData = JSON.parse(decryptedData.toString('utf8')) as UserData;
  } catch {
    throw new Error('Failed to decrypt userData.json.enc. Check that USER_SECRET matches the key used to encrypt it.');
  }
}

export function encryptUserDataFile(): void {
  const secret = getSecret();
  const plainText = cachedUserData
    ? JSON.stringify(cachedUserData, null, 2)
    : (existsSync(USER_DATA_JSON_PATH) ? readFileSync(USER_DATA_JSON_PATH, 'utf8') : '');

  if (!plainText) {
    return;
  }

  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(secret).digest();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encryptedData = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);

  writeFileSync(USER_DATA_ENC_PATH, Buffer.concat([iv, encryptedData]));
  cachedUserData = null;
}

export function getUserData(): UserData {
  if (cachedUserData) {
    return cachedUserData;
  }

  if (existsSync(USER_DATA_JSON_PATH)) {
    cachedUserData = JSON.parse(readFileSync(USER_DATA_JSON_PATH, 'utf8')) as UserData;
    return cachedUserData;
  }

  if (existsSync(USER_DATA_ENC_PATH)) {
    decryptUserDataFile();
    if (!cachedUserData) {
      throw new Error('User data could not be loaded.');
    }
    return cachedUserData;
  }

  throw new Error('userData.json does not exist.');
}

export function getUserCredentials(): { username: string; password: string } {
  const userData = getUserData();
  const record = Array.isArray(userData) ? userData[0] : userData;

  const username = record?.UserName ?? record?.userName ?? record?.username;
  const password = record?.UserPassword ?? record?.userPassword ?? record?.password;

  if (!username || !password) {
    throw new Error('userData.json must contain UserName and UserPassword fields.');
  }

  return {
    username: String(username),
    password: String(password),
  };
}

export function getUserCredentialsById(userId: string | number): { username: string; password: string } {
  const userData = getUserData();
  const records = Array.isArray(userData) ? userData : [userData];
  const idValue = String(userId);

  const record = records.find((entry: any) => {
    const entryId = entry?.UserId ?? entry?.userId ?? entry?.id;
    return String(entryId) === idValue;
  });

  if (!record) {
    throw new Error(`No user found in userData.json for UserId "${userId}".`);
  }

  const username = record.UserName ?? record.userName ?? record.username;
  const password = record.UserPassword ?? record.userPassword ?? record.password;

  if (!username || !password) {
    throw new Error(`UserId "${userId}" is missing UserName or UserPassword in userData.json.`);
  }

  return {
    username: String(username),
    password: String(password),
  };
}
