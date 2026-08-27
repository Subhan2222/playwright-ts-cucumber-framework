import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const secret = process.env.ENV_SECRET;
if (!secret) {
  console.error('ERROR: ENV_SECRET is required to encrypt envUrls.json');
  process.exit(1);
}

const inputFile = process.argv[2] || '.tmp/env.decrypted.json';
const outputFile = process.argv[3] || 'data/envData/envUrls.json.enc';

if (!existsSync(inputFile)) {
  console.error(`ERROR: Input file not found: ${inputFile}`);
  process.exit(1);
}

const plainText = readFileSync(inputFile, 'utf8');

const outputDir = path.dirname(outputFile);
if (outputDir && outputDir !== '.') {
  require('fs').mkdirSync(outputDir, { recursive: true });
}

const iv = crypto.randomBytes(16);
const key = crypto.createHash('sha256').update(secret).digest();
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
const encryptedData = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
const outputData = Buffer.concat([iv, encryptedData]);

writeFileSync(outputFile, outputData);
console.log(`Encrypted file saved to ${outputFile}`);

if (existsSync(inputFile)) {
  unlinkSync(inputFile);
  console.log(`Removed temporary decrypted file: ${inputFile}`);
}
