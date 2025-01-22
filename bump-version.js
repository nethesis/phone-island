const fs = require('fs');
const { execSync } = require('child_process');

// Script for automatic version bumping of Phone-island component
// Path to package.json
const packageJsonPath = './package.json';

// Read package.json content
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Increment version number
// Split version into major.minor.patch and convert to numbers
const currentVersion = packageJson.version;
const [major, minor, patch] = currentVersion.split('.').map(Number);
const newVersion = `${major}.${minor}.${patch + 1}`;

// Update version in package.json object
packageJson.version = newVersion;

// Write the new version back to package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log(`Version updated: ${currentVersion} -> ${newVersion}`);

// Regenerate package-lock.json to ensure dependency consistency
console.log('Updating package-lock.json...');
execSync('npm install --package-lock-only', { stdio: 'inherit' });

console.log('Process completed.');

