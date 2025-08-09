#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting automated webapp deployment...');

// Step 1: Create proper vercel.json for monorepo
const vercelConfig = {
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "installCommand": "cd ../.. && pnpm install --no-frozen-lockfile",
        "buildCommand": "pnpm run build"
      }
    }
  ]
};

console.log('📝 Creating vercel.json configuration...');
fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));

// Step 2: Deploy with proper settings
console.log('🔧 Deploying to Vercel...');
try {
  const result = execSync('vercel --prod --yes', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ Deployment successful!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
