import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const secret = process.env.ENV_SECRET;
if (!secret) {
  console.error('ERROR: ENV_SECRET is required to decrypt envUrls.json.enc');
  process.exit(1);
}

const inputFile = process.argv[2] || 'data/envData/envUrls.json.enc';
const outputFile = process.argv[3] || 'data/envData/envUrls.json';

const outputDir = path.dirname(outputFile);
mkdirSync(outputDir, { recursive: true });

if (!existsSync(inputFile)) {
  console.error(`ERROR: ${inputFile} not found. Run npm run encrypt-env first.`);
  process.exit(1);
}

const encryptedData = readFileSync(inputFile);
const iv = encryptedData.slice(0, 16);
const ciphertext = encryptedData.slice(16);
const key = crypto.createHash('sha256').update(secret).digest();
const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
const decryptedData = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

writeFileSync(outputFile, decryptedData);
console.log(`Decrypted file saved to ${outputFile}`);
