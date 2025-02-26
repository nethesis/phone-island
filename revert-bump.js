const fs = require('fs');
const { execSync } = require('child_process');

// Path to package.json
const packageJsonPath = './package.json';

// Read package.json content
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Decrement version number
const currentVersion = packageJson.version;
const [major, minor, patch] = currentVersion.split('.').map(Number);
const previousVersion = `${major}.${minor}.${patch - 1}`;

// Update version in package.json object
packageJson.version = previousVersion;

// Write the previous version back to package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log(`Version reverted: ${currentVersion} -> ${previousVersion}`);

// Regenerate package-lock.json
console.log('Updating package-lock.json...');
execSync('npm install --package-lock-only', { stdio: 'inherit' });

// Remove .tgz file if exists
const tgzFile = `nethesis-phone-island-${currentVersion}.tgz`;
if (fs.existsSync(tgzFile)) {
    fs.unlinkSync(tgzFile);
    console.log(`Removed ${tgzFile}`);
}

console.log('Revert completed.');
