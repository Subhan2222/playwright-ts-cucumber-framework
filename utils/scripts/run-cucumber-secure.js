const { execSync } = require('child_process');

const args = process.argv.slice(2).join(' ');

try {
  console.log('🔓 Decrypting env...');
  execSync('npm run decrypt-env', { stdio: 'inherit' });

  console.log('\n🚀 Running Cucumber tests...');
  if (args.trim()) {
    execSync(`npm run cucumber -- ${args}`, { stdio: 'inherit' });
  } else {
    execSync('npm run cucumber', { stdio: 'inherit' });
  }
} finally {
  console.log('\n🔐 Encrypting env...');
  try {
    execSync('npm run encrypt-env', { stdio: 'inherit' });
  } catch (err) {
    console.error('⚠️  Encryption failed after test execution.');
  }
}
