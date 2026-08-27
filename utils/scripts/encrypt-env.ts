import { encryptEnvFile, ENV_JSON_PATH } from '../env';
import { existsSync } from 'fs';

if (!existsSync(ENV_JSON_PATH)) {
  console.error(`ERROR: Input file not found: ${ENV_JSON_PATH}`);
  process.exit(1);
}

encryptEnvFile();
console.log('Encrypted file saved to data/envData/envUrls.json.enc');
console.log('Removed original file: data/envData/envUrls.json');
