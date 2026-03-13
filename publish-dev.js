#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const https = require('https')
const { name } = require('./package.json')

const dryRun = process.argv.includes('--dry-run')

function exec(cmd) {
  return execSync(cmd, { encoding: 'utf-8' }).trim()
}

// Get the latest release tag (vX.Y.Z) sorted by semver
function getLatestReleaseTag() {
  try {
    // Get all tags matching vX.Y.Z (no pre-release suffix), sorted descending
    const tags = exec('git tag --list "v[0-9]*.[0-9]*.[0-9]*" --sort=-v:refname')
    const lines = tags.split('\n').filter(Boolean)

    // Filter out pre-release tags (those containing a hyphen after vX.Y.Z)
    const releaseTags = lines.filter((t) => /^v\d+\.\d+\.\d+$/.test(t))

    if (releaseTags.length === 0) {
      console.error('No release tags found (expected format: vX.Y.Z)')
      process.exit(1)
    }

    return releaseTags[0] // already sorted descending
  } catch (e) {
    console.error('Failed to get git tags:', e.message)
    process.exit(1)
  }
}

// Fetch existing dev pre-release versions from npm to determine next increment
function getNextDevNumber(baseVersion) {
  return new Promise((resolve, reject) => {
    const url = `https://registry.npmjs.org/${name.replace('/', '%2F')}`

    https
      .get(url, { headers: { Accept: 'application/json' } }, (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          try {
            const pkg = JSON.parse(data)
            const versions = Object.keys(pkg.versions || {})

            // Find all dev pre-releases for this base version
            const prefix = `${baseVersion}-dev.`
            const devNumbers = versions
              .filter((v) => v.startsWith(prefix))
              .map((v) => parseInt(v.slice(prefix.length), 10))
              .filter((n) => !isNaN(n))

            const next = devNumbers.length > 0 ? Math.max(...devNumbers) + 1 : 1
            resolve(next)
          } catch (e) {
            reject(new Error('Failed to parse registry response: ' + e.message))
          }
        })
      })
      .on('error', reject)
  })
}

async function main() {
  const latestTag = getLatestReleaseTag()
  const baseVersion = latestTag.replace(/^v/, '')

  console.log(`Latest release tag: ${latestTag} (${baseVersion})`)

  const devNumber = await getNextDevNumber(baseVersion)
  const devVersion = `${baseVersion}-dev.${devNumber}`

  if (dryRun) {
    console.log(`[DRY RUN] Would publish: ${name}@${devVersion}`)
    console.log('[DRY RUN] No changes made.')
    return
  }

  console.log(`Publishing dev pre-release: ${name}@${devVersion}`)

  // Set version directly in package.json (avoids triggering preversion/postversion hooks)
  const pkgPath = require.resolve('./package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  pkg.version = devVersion
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

  // Build
  console.log('Building...')
  exec('npm run build')

  // Publish with "dev" dist-tag so it doesn't affect "latest"
  console.log('Publishing to npm with tag "dev"...')
  exec('npm publish --tag dev')

  const pkgUrl = `https://www.npmjs.com/package/${name}/v/${devVersion}`

  console.log(`\nPublished ${name}@${devVersion} (tagged as "dev")`)
  console.log(`Install with: npm install ${name}@dev`)
  console.log(`Or pin: npm install ${name}@${devVersion}`)
  console.log(`\nPackage URL: ${pkgUrl}`)

  // Revert package.json version change (don't leave it dirty)
  exec('git checkout -- package.json package-lock.json')

  console.log('\nReverted package.json to original version.')
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
