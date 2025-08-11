#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting CoffeeBreak webapp build for Vercel...');

// Function to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and other build directories
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'dist') {
        continue;
      }
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  console.log('📦 Step 1: Copying shared package files...');
  
  // Paths relative to the webapp directory
  const sharedNodeModulesPath = path.join(__dirname, 'node_modules', '@dailydotdev', 'shared');
  const sharedSourcePath = path.join(__dirname, '..', 'shared');
  
  // Copy the entire shared package
  copyDir(sharedSourcePath, sharedNodeModulesPath);
  
  // Create package.json for the shared package in node_modules
  const sharedPackageJson = JSON.parse(fs.readFileSync(path.join(sharedSourcePath, 'package.json'), 'utf8'));
  fs.writeFileSync(
    path.join(sharedNodeModulesPath, 'package.json'),
    JSON.stringify(sharedPackageJson, null, 2)
  );
  
  console.log('✅ Successfully copied shared package files');
  
  console.log('🔨 Step 2: Building webapp...');
  
  // Run the Next.js build
  execSync('npx next build', { stdio: 'inherit', cwd: __dirname });
  
  console.log('🎉 Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
