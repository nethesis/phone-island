// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Saves an Item to localstorage
 *
 * @param name - The key of the object
 * @param value - The object to save
 *
 */

export const setJSONItem = (name: string, value: object) => {
  localStorage.setItem(name, JSON.stringify(value))
}

type SavedType = string | null

/**
 * Gets an Item from localstorage
 *
 * @param name - The key used to save the object
 *
 */

export const getJSONItem = (name: string) => {
  const saved: SavedType = localStorage.getItem(name)
  const initialValue = saved && JSON.parse(saved)
  return initialValue || ''
}

/**
 * Deletes an Item from localstorage
 *
 * @param name - The key used to save the object
 *
 */

export const removeItem = (name: string) => {
  localStorage.removeItem(name)
}

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
