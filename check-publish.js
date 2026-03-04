#!/usr/bin/env node

const https = require('https')
const { name, version } = require('./package.json')

const type = process.argv[2] || 'patch'
const parts = version.split('.').map(Number)

if (type === 'patch') parts[2]++
else if (type === 'minor') { parts[1]++; parts[2] = 0 }
else if (type === 'major') { parts[0]++; parts[1] = 0; parts[2] = 0 }

const nextVersion = parts.join('.')

console.log(`Checking if ${name}@${nextVersion} can be published...`)

const url = `https://registry.npmjs.org/${name.replace('/', '%2F')}`

https.get(url, { headers: { Accept: 'application/json' } }, (res) => {
  let data = ''
  res.on('data', (chunk) => (data += chunk))
  res.on('end', () => {
    try {
      const pkg = JSON.parse(data)
      const versions = Object.keys(pkg.versions || {})
      const time = pkg.time || {}

      // Version still exists on the registry
      if (versions.includes(nextVersion)) {
        console.error(`\nVersion ${nextVersion} already exists on npm. Cannot publish.`)
        process.exit(1)
      }

      // Version was unpublished but may still be in the 24h cooldown
      if (time[nextVersion]) {
        const publishedAt = new Date(time[nextVersion])
        const hoursSince = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60)

        if (hoursSince < 24) {
          console.error(
            `\nVersion ${nextVersion} was unpublished ${hoursSince.toFixed(1)}h ago.` +
            `\nnpm requires 24h before republishing. Wait ~${(24 - hoursSince).toFixed(1)}h more.`,
          )
          process.exit(1)
        }
      }

      console.log(`\nVersion ${nextVersion} is available for publishing.`)
    } catch (e) {
      console.error('Failed to parse registry response:', e.message)
      process.exit(1)
    }
  })
}).on('error', (e) => {
  console.error('Failed to check npm registry:', e.message)
  process.exit(1)
})
