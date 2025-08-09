#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting final webapp deployment with proper configuration...');

// Step 1: Ensure we're in the webapp directory
const webappDir = path.join(__dirname, 'packages', 'webapp');
process.chdir(webappDir);

console.log('📁 Changed to webapp directory:', webappDir);

// Step 2: Set required environment variables for Vercel
const envVars = {
  'NEXT_PUBLIC_API_URL': 'https://api.daily.dev',
  'NEXT_PUBLIC_SUBS_URL': 'wss://api.daily.dev/graphql',
  'NEXT_PUBLIC_DOMAIN': 'daily.dev',
  'NEXT_PUBLIC_WEBAPP_URL': '/',
  'NEXT_PUBLIC_AUTH_URL': 'https://sso.daily.dev',
  'NEXT_PUBLIC_HEIMDALL_URL': 'https://sso.daily.dev',
  'NEXT_PUBLIC_EXPERIMENTATION_KEY': 'ACCB0B287D9C5EACBA90999B3356069F',
  'CURRENT_VERSION': '1.0.0'
};

console.log('🔧 Setting environment variables...');
for (const [key, value] of Object.entries(envVars)) {
  try {
    execSync(`vercel env add ${key} production`, { 
      input: value,
      stdio: ['pipe', 'inherit', 'inherit']
    });
    console.log(`✅ Set ${key}`);
  } catch (error) {
    // Variable might already exist, try to remove and re-add
    try {
      execSync(`vercel env rm ${key} production --yes`, { stdio: 'ignore' });
      execSync(`vercel env add ${key} production`, { 
        input: value,
        stdio: ['pipe', 'inherit', 'inherit']
      });
      console.log(`✅ Updated ${key}`);
    } catch (updateError) {
      console.log(`⚠️  Could not set ${key}: ${updateError.message}`);
    }
  }
}

// Step 3: Deploy with proper settings
console.log('🔧 Deploying to Vercel...');
try {
  const result = execSync('vercel --prod --yes', { 
    stdio: 'inherit',
    cwd: webappDir
  });
  console.log('✅ Deployment successful!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
