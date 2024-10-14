// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Executes a callback and waits for resolution
 * @param cb The callback to be called every check
 */
export function useWaitResolution(cb: (resolve: () => void) => void) {
  function resolve() {
    clearInterval(interval)
  }
  let times = 0
  let maxTimes = 10
  const interval = setInterval(() => {
    cb(resolve)
    if (times === maxTimes) clearInterval(interval)
    times++
  }, 500)
}
