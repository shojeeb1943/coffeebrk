#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Creating standalone deployment...');

// Read the current package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Read the shared package to get its dependencies
const sharedPackageJsonPath = path.join(process.cwd(), '../shared/package.json');
const sharedPackageJson = JSON.parse(fs.readFileSync(sharedPackageJsonPath, 'utf8'));

// Replace workspace dependencies with actual versions
const updatedPackageJson = { ...packageJson };

// Replace @dailydotdev/shared workspace dependency with its actual dependencies
if (updatedPackageJson.dependencies['@dailydotdev/shared'] === 'workspace:*') {
  delete updatedPackageJson.dependencies['@dailydotdev/shared'];
  
  // Add shared package dependencies
  Object.assign(updatedPackageJson.dependencies, sharedPackageJson.dependencies);
}

// Create backup and update package.json
fs.writeFileSync(packageJsonPath + '.backup', JSON.stringify(packageJson, null, 2));
fs.writeFileSync(packageJsonPath, JSON.stringify(updatedPackageJson, null, 2));

console.log('📝 Updated package.json with resolved dependencies');

// Create simple vercel.json
const vercelConfig = {
  "github": {
    "silent": true
  },
  "framework": "nextjs"
};

fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));

console.log('🔧 Deploying to Vercel...');
try {
  execSync('vercel --prod --yes', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ Deployment successful!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
} finally {
  // Restore original package.json
  fs.writeFileSync(packageJsonPath, fs.readFileSync(packageJsonPath + '.backup', 'utf8'));
  fs.unlinkSync(packageJsonPath + '.backup');
  console.log('🔄 Restored original package.json');
}
