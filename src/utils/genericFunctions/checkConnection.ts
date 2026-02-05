// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

const CONNECTIVITY_CHECK_ENDPOINTS = [
  'https://connectivitycheck.gstatic.com/generate_204', // Google's connectivity check
  'https://1.1.1.1/cdn-cgi/trace', // Cloudflare
  'https://cloudflare.com/cdn-cgi/trace' // Cloudflare alternative
]

// Check internet connection using lightweight endpoints with fallbacks
export const checkInternetConnection = async () => {
  // Quick check using browser's navigator.onLine
  if (!navigator.onLine) {
    return false
  }

  // Try connectivity check endpoints with fallbacks
  for (const endpoint of CONNECTIVITY_CHECK_ENDPOINTS) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      await fetch(endpoint, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return true
    } catch (error) {
      // Try next endpoint
      continue
    }
  }

  return false
}
