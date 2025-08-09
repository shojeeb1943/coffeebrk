#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing workspace dependencies for deployment...');

// Read current webapp package.json
const webappPackageJsonPath = path.join(__dirname, 'packages', 'webapp', 'package.json');
const webappPackageJson = JSON.parse(fs.readFileSync(webappPackageJsonPath, 'utf8'));

// Read shared package.json
const sharedPackageJsonPath = path.join(__dirname, 'packages', 'shared', 'package.json');
const sharedPackageJson = JSON.parse(fs.readFileSync(sharedPackageJsonPath, 'utf8'));

// Create backup
const backupPath = webappPackageJsonPath + '.backup';
fs.writeFileSync(backupPath, JSON.stringify(webappPackageJson, null, 2));

// Replace workspace dependency with actual dependencies
const updatedWebappPackageJson = { ...webappPackageJson };

if (updatedWebappPackageJson.dependencies['@dailydotdev/shared'] === 'workspace:*') {
  console.log('📦 Replacing @dailydotdev/shared workspace dependency...');
  
  // Remove workspace dependency
  delete updatedWebappPackageJson.dependencies['@dailydotdev/shared'];
  
  // Add shared package dependencies (avoiding conflicts)
  const sharedDeps = sharedPackageJson.dependencies || {};
  
  for (const [depName, depVersion] of Object.entries(sharedDeps)) {
    // Only add if not already present in webapp
    if (!updatedWebappPackageJson.dependencies[depName]) {
      updatedWebappPackageJson.dependencies[depName] = depVersion;
    }
  }
  
  console.log(`✅ Added ${Object.keys(sharedDeps).length} dependencies from shared package`);
}

// Write updated package.json
fs.writeFileSync(webappPackageJsonPath, JSON.stringify(updatedWebappPackageJson, null, 2));

console.log('📝 Updated package.json for standalone deployment');
console.log('🚀 Now you can deploy using Vercel Dashboard with these settings:');
console.log('');
console.log('Root Directory: packages/webapp');
console.log('Framework: Next.js');
console.log('Build Command: pnpm run build');
console.log('Install Command: pnpm install');
console.log('');
console.log('⚠️  Remember to restore package.json after deployment:');
console.log('   node restore-package.js');

// Create restore script
const restoreScript = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const webappPackageJsonPath = path.join(__dirname, 'packages', 'webapp', 'package.json');
const backupPath = webappPackageJsonPath + '.backup';

if (fs.existsSync(backupPath)) {
  fs.writeFileSync(webappPackageJsonPath, fs.readFileSync(backupPath, 'utf8'));
  fs.unlinkSync(backupPath);
  console.log('✅ Restored original package.json');
} else {
  console.log('❌ No backup found');
}
`;

fs.writeFileSync(path.join(__dirname, 'restore-package.js'), restoreScript);
