// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { eventDispatch } from './eventDispatch'

/**
 * Trigger download of all stores as JSON file
 * This will automatically download a JSON file with all store states
 */
export const triggerStoresDownload = (): void => {
  eventDispatch('phone-island-stores-download', {})
}
