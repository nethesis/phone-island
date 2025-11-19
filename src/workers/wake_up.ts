//
// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later
//

import exposeWorker from '../utils/genericFunctions/exposeWorker'

/**
 * Lightweight worker for keepalive ping
 * Sends periodic ping messages to keep the tab active
 */
const wakeUpWorker = exposeWorker(() => {
  const PING_INTERVAL = 30000
  
  setInterval(() => {
    postMessage('ping')
  }, PING_INTERVAL)
})

export default wakeUpWorker
