// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Handles a function to be called before a timeout
 *
 * @param onSuccess The function to execute before timeout
 * @param onTimeout The function to execute when timeout it reached
 * @param timeout The timeout
 */
export const withTimeout = (
  onSuccess: (args: any) => void,
  onTimeout: () => void,
  timeout: number,
) => {
  let called = false
  const timer = setTimeout(() => {
    if (called) return
    called = true
    onTimeout()
  }, timeout)
  return (...args: any) => {
    if (called) return
    called = true
    clearTimeout(timer)
    onSuccess(args)
  }
}
