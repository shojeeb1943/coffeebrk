#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Scanning for SSR-unsafe code...');

// Function to add SSR checks to browser API usage
function fixSSRIssues(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let modified = false;

  // Pattern 1: Direct localStorage access
  const localStoragePattern = /(?<!globalThis\?\.)localStorage\./g;
  if (localStoragePattern.test(content)) {
    newContent = newContent.replace(localStoragePattern, 'globalThis?.localStorage?.');
    modified = true;
    console.log(`   🔧 Fixed localStorage access in ${path.relative(process.cwd(), filePath)}`);
  }

  // Pattern 2: Direct window access (but not globalThis.window)
  const windowPattern = /(?<!globalThis\?\.)(?<!globalThis\.)window\./g;
  if (windowPattern.test(content) && !content.includes('typeof window')) {
    newContent = newContent.replace(windowPattern, 'globalThis?.window?.');
    modified = true;
    console.log(`   🔧 Fixed window access in ${path.relative(process.cwd(), filePath)}`);
  }

  // Pattern 3: Direct document access
  const documentPattern = /(?<!globalThis\?\.)(?<!globalThis\.)document\./g;
  if (documentPattern.test(content)) {
    newContent = newContent.replace(documentPattern, 'globalThis?.document?.');
    modified = true;
    console.log(`   🔧 Fixed document access in ${path.relative(process.cwd(), filePath)}`);
  }

  // Pattern 4: Direct navigator access
  const navigatorPattern = /(?<!globalThis\?\.)(?<!globalThis\.)navigator\./g;
  if (navigatorPattern.test(content)) {
    newContent = newContent.replace(navigatorPattern, 'globalThis?.navigator?.');
    modified = true;
    console.log(`   🔧 Fixed navigator access in ${path.relative(process.cwd(), filePath)}`);
  }

  if (modified) {
    fs.writeFileSync(filePath, newContent);
    return true;
  }

  return false;
}

// Function to recursively scan directory
function scanDirectory(dir, extensions = ['.tsx', '.ts']) {
  const problematicFiles = [];

  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        // Skip certain directories
        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(item)) {
          scan(itemPath);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        const content = fs.readFileSync(itemPath, 'utf8');

        // Check for browser API usage without proper SSR checks
        const hasBrowserAPIs = 
          /(?<!globalThis\?\.)localStorage\./.test(content) ||
          /(?<!globalThis\?\.)(?<!globalThis\.)window\./.test(content) ||
          /(?<!globalThis\?\.)(?<!globalThis\.)document\./.test(content) ||
          /(?<!globalThis\?\.)(?<!globalThis\.)navigator\./.test(content);

        if (hasBrowserAPIs) {
          problematicFiles.push(itemPath);
        }
      }
    }
  }

  scan(dir);
  return problematicFiles;
}

// Main execution
const rootDir = process.cwd();
const problematicFiles = scanDirectory(rootDir);

if (problematicFiles.length === 0) {
  console.log('✅ No SSR-unsafe browser API usage found!');
} else {
  console.log(`🔧 Found ${problematicFiles.length} files with potentially SSR-unsafe browser API usage:`);

  let fixedCount = 0;

  for (const filePath of problematicFiles) {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`   📄 ${relativePath}`);

    if (fixSSRIssues(filePath)) {
      console.log(`   ✅ Fixed: ${relativePath}`);
      fixedCount++;
    } else {
      console.log(`   ⚠️  No changes needed: ${relativePath}`);
    }
  }

  console.log(`\n🎉 Fixed ${fixedCount} out of ${problematicFiles.length} files`);

  if (fixedCount > 0) {
    console.log('\n📝 Remember to commit these changes:');
    console.log('   git add -A');
    console.log('   git commit -m "Fix: Add SSR-safe checks for browser API usage"');
    console.log('   git push');
  }
}
