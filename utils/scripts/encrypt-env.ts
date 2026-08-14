// Load environment variables from .env file
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Secret key used for encryption
const secret = process.env.ENV_SECRET;
if (!secret) {
  console.error('ERROR: ENV_SECRET is required to encrypt envUrls.json');
  process.exit(1);
}

// Use a default file path, or allow a custom path from the command line
const inputFile = process.argv[2] || 'data/envData/envUrls.json';
const outputFile = process.argv[3] || `${inputFile}.enc`;

// Stop if the input file does not exist
if (!existsSync(inputFile)) {
  console.error(`ERROR: Input file not found: ${inputFile}`);
  process.exit(1);
}

// Read the plain JSON data from the file
const plainText = readFileSync(inputFile, 'utf8');

// Create a random IV and a fixed-length key from the secret
const iv = crypto.randomBytes(16);
const key = crypto.createHash('sha256').update(secret).digest();
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
const encryptedData = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
const outputData = Buffer.concat([iv, encryptedData]);

// Save the encrypted bytes to the output file
writeFileSync(outputFile, outputData);
console.log(`Encrypted file saved to ${outputFile}`);

// Remove the original plain file after encrypting it
if (inputFile !== outputFile && outputFile.endsWith('.enc')) {
  unlinkSync(inputFile);
  console.log(`Removed original file: ${inputFile}`);
}
