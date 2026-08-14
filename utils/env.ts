import { existsSync, readFileSync } from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

export interface EnvConfig {
  baseUrl: string;
  loginPath: string;
  searchPath: string;
  [key: string]: string;
}

let cachedEnv: EnvConfig | null = null;

export function getEnvConfig(): EnvConfig {
  if (cachedEnv) {
    return cachedEnv;
  }

  const decryptedPath = path.resolve(process.cwd(), '.tmp', 'env.decrypted.json');

  if (!existsSync(decryptedPath)) {
    throw new Error(
      `Decrypted env file not found at ${decryptedPath}. Run npm run decrypt-env before executing tests.`
    );
  }

  const fileContent = readFileSync(decryptedPath, 'utf8');
  cachedEnv = JSON.parse(fileContent) as EnvConfig;
  return cachedEnv;
}
