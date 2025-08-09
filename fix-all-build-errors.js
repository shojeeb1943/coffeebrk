#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Scanning for pages that might cause build-time errors...');

const pagesDir = path.join(__dirname, 'packages', 'webapp', 'pages');

// Function to check if a file has server-side props
function hasServerSideProps(content) {
  return content.includes('getServerSideProps') || content.includes('getStaticProps');
}

// Function to check if a file uses hooks that might access user data
function usesUserDataHooks(content) {
  const userDataHooks = [
    'useAuthContext',
    'useSources',
    'useSquadCategories',
    'useSquadPendingPosts',
    'SquadsDirectoryFeed'
  ];
  
  return userDataHooks.some(hook => content.includes(hook));
}

// Function to add getServerSideProps to a file
function addServerSideProps(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if it already has server-side props
  if (hasServerSideProps(content)) {
    return false;
  }
  
  // Find the export default line
  const lines = content.split('\n');
  const exportDefaultIndex = lines.findIndex(line => line.includes('export default'));
  
  if (exportDefaultIndex === -1) {
    console.log(`⚠️  Could not find export default in ${filePath}`);
    return false;
  }
  
  // Insert getServerSideProps before export default
  const serverSidePropsCode = [
    '',
    '// Disable static generation to avoid build-time errors',
    'export async function getServerSideProps() {',
    '  return {',
    '    props: {},',
    '  };',
    '}',
    ''
  ];
  
  lines.splice(exportDefaultIndex, 0, ...serverSidePropsCode);
  
  const newContent = lines.join('\n');
  fs.writeFileSync(filePath, newContent);
  
  return true;
}

// Function to recursively scan directory
function scanDirectory(dir) {
  const problematicFiles = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Skip certain directories
        if (!['api', 'node_modules', '.next'].includes(item)) {
          scan(itemPath);
        }
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        // Skip non-page files
        if (item.startsWith('_') || item === 'index.ts') {
          continue;
        }
        
        const content = fs.readFileSync(itemPath, 'utf8');
        
        // Check if this file might cause build-time errors
        if (usesUserDataHooks(content) && !hasServerSideProps(content)) {
          problematicFiles.push(itemPath);
        }
      }
    }
  }
  
  scan(dir);
  return problematicFiles;
}

// Main execution
const problematicFiles = scanDirectory(pagesDir);

if (problematicFiles.length === 0) {
  console.log('✅ No problematic pages found!');
} else {
  console.log(`🔧 Found ${problematicFiles.length} potentially problematic pages:`);
  
  let fixedCount = 0;
  
  for (const filePath of problematicFiles) {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`   📄 ${relativePath}`);
    
    if (addServerSideProps(filePath)) {
      console.log(`   ✅ Fixed: ${relativePath}`);
      fixedCount++;
    } else {
      console.log(`   ⚠️  Could not fix: ${relativePath}`);
    }
  }
  
  console.log(`\n🎉 Fixed ${fixedCount} out of ${problematicFiles.length} files`);
  
  if (fixedCount > 0) {
    console.log('\n📝 Remember to commit these changes:');
    console.log('   git add packages/webapp/pages/');
    console.log('   git commit -m "Fix: Add getServerSideProps to prevent build-time errors"');
    console.log('   git push');
  }
}
