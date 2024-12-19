// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

// launch a fetch to google to check if the connection is available
export const checkInternetConnection = async () => {
  try {
    const response = await fetch('https://www.google.com', { mode: 'no-cors' })
    return true
  } catch (error) {
    return false
  }
}
