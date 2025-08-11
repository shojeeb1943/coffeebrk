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

  console.log(`📁 Source path: ${sharedSourcePath}`);
  console.log(`📁 Destination path: ${sharedNodeModulesPath}`);

  // Check if shared source exists
  if (!fs.existsSync(sharedSourcePath)) {
    console.log('⚠️  Shared package not found, creating minimal stub...');

    // Create minimal shared package structure
    fs.mkdirSync(sharedNodeModulesPath, { recursive: true });
    fs.mkdirSync(path.join(sharedNodeModulesPath, 'src'), { recursive: true });

    // Create minimal package.json
    const minimalPackageJson = {
      "name": "@dailydotdev/shared",
      "version": "0.0.0",
      "main": "./src/index.ts"
    };

    fs.writeFileSync(
      path.join(sharedNodeModulesPath, 'package.json'),
      JSON.stringify(minimalPackageJson, null, 2)
    );

    // Create minimal index.ts
    fs.writeFileSync(
      path.join(sharedNodeModulesPath, 'src', 'index.ts'),
      '// Minimal shared package stub for standalone deployment\nexport {};\n'
    );

  } else {
    // Copy the entire shared package
    copyDir(sharedSourcePath, sharedNodeModulesPath);

    // Create package.json for the shared package in node_modules
    const sharedPackageJson = JSON.parse(fs.readFileSync(path.join(sharedSourcePath, 'package.json'), 'utf8'));
    fs.writeFileSync(
      path.join(sharedNodeModulesPath, 'package.json'),
      JSON.stringify(sharedPackageJson, null, 2)
    );
  }

  console.log('✅ Successfully set up shared package');

  console.log('🔨 Step 2: Building webapp...');

  // Run the Next.js build using the local next binary
  execSync('npm run build', { stdio: 'inherit', cwd: __dirname });

  console.log('🎉 Build completed successfully!');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
