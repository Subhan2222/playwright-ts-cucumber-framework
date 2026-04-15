// Load environment variables from .env
import { existsSync, readFileSync, writeFileSync } from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Secret key used for decryption
const secret = process.env.ENV_SECRET;
if (!secret) {
  console.error('ERROR: ENV_SECRET is required to decrypt envUrls.json.enc');
  process.exit(1);
}

// Use the encrypted file by default, or allow a custom path
const inputFile = process.argv[2] || 'data/envData/envUrls.json.enc';
const outputFile = process.argv[3] || 'data/envData/envUrls.json';

// Stop if the encrypted file does not exist
if (!existsSync(inputFile)) {
  console.error(`ERROR: ${inputFile} not found. Run npm run encrypt-env first.`);
  process.exit(1);
}

// Read the encrypted data from the file
const encryptedData = readFileSync(inputFile);

// Extract the IV from the first 16 bytes
const iv = encryptedData.slice(0, 16);
const ciphertext = encryptedData.slice(16);
const key = crypto.createHash('sha256').update(secret).digest();
const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
const decryptedData = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

// Save the decrypted JSON back to the output file
writeFileSync(outputFile, decryptedData);
console.log(`Decrypted file saved to ${outputFile}`);
