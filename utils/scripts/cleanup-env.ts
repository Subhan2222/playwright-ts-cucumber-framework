// This script removes the decrypted JSON file after tests are done
import { existsSync, unlinkSync } from 'fs';

const file = 'data/envData/envUrls.json';

if (existsSync(file)) {
  unlinkSync(file);
  console.log(`Deleted decrypted file: ${file}`);
} else {
  console.log(`No decrypted file found at ${file}`);
}
