// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { getJSONItem, setJSONItem } from '../../utils'

/**
 * Used to save data to cache inside a local storage entry "caches-username"
 *
 * @param cacheName name of the cache
 * @param cacheValue a JSON object
 * @param currentUsername username currently logged in
 * @param expiration timestamp of expiration of the cache
 */
export const saveCache = (
  cacheName: string,
  cacheData: any,
  currentUsername: string,
  expiration: number,
) => {
  if (!currentUsername) {
    return
  }
  const caches = getJSONItem(`caches-${currentUsername}`) || {}
  let data = cacheData
  data['_expiration'] = expiration
  caches[cacheName] = data
  setJSONItem(`caches-${currentUsername}`, caches)
}

/**
 * Used to load user caches from the local storage entry "caches-username"
 *
 * @param cacheName name of the cache
 * @param currentUsername username currently logged in
 */
export const loadCache = (cacheName: string, currentUsername: string) => {
  const caches = getJSONItem(`caches-${currentUsername}`) || {}
  const cache = caches[cacheName]

  if (cache && cache['_expiration'] && new Date().getTime() > cache['_expiration']) {
    // cache has expired
    return undefined
  }
  return cache
}
