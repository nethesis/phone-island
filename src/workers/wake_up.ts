// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import exposeWorker from '../utils/genericFunctions/exposeWorker'

/**
 * Performs a check about the tab inactivity
 * ...probably a standby of the computer
 */
const wakeUpWorker = exposeWorker(() => {
  let lastTime = new Date().getTime()
  const CHECK_INTERVAL = 2000
  setInterval(() => {
    const currentTime = new Date().getTime()
    if (currentTime > lastTime + CHECK_INTERVAL * 2) {
      postMessage('wakeup')
    }
    lastTime = currentTime
  }, CHECK_INTERVAL)
})

export default wakeUpWorker
