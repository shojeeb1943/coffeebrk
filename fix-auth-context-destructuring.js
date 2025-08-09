#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Scanning for unsafe AuthContext destructuring...');

// Function to fix unsafe destructuring in a file
function fixAuthContextDestructuring(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Pattern 1: const { user } = useContext(AuthContext);
  const pattern1 = /const\s*{\s*([^}]*user[^}]*)\s*}\s*=\s*useContext\(AuthContext\);/g;
  let newContent = content.replace(pattern1, (match, destructuredVars) => {
    console.log(`   🔧 Fixing pattern 1 in ${path.relative(process.cwd(), filePath)}`);
    modified = true;
    return `const authContext = useContext(AuthContext);\n  const { ${destructuredVars} } = authContext || {};`;
  });
  
  // Pattern 2: const { user, otherVar } = useAuthContext();
  // This is safer but let's check if it needs fixing too
  const pattern2 = /const\s*{\s*([^}]*user[^}]*)\s*}\s*=\s*useAuthContext\(\);/g;
  const matches = [...newContent.matchAll(pattern2)];
  
  if (matches.length > 0) {
    // Check if useAuthContext is properly implemented to handle null
    if (!content.includes('useAuthContext') || content.includes('useContext(AuthContext)')) {
      console.log(`   ⚠️  Found useAuthContext usage in ${path.relative(process.cwd(), filePath)} - should be safe`);
    }
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
        
        // Check for unsafe destructuring patterns
        if (content.includes('useContext(AuthContext)') && content.includes('{ user')) {
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
  console.log('✅ No unsafe AuthContext destructuring found!');
} else {
  console.log(`🔧 Found ${problematicFiles.length} files with potentially unsafe AuthContext destructuring:`);
  
  let fixedCount = 0;
  
  for (const filePath of problematicFiles) {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`   📄 ${relativePath}`);
    
    if (fixAuthContextDestructuring(filePath)) {
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
    console.log('   git commit -m "Fix: Add null checks for AuthContext destructuring"');
    console.log('   git push');
  }
}
