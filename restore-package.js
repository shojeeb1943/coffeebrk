#!/usr/bin/env node
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
