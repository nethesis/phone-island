// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Saves an Item to localstorage
 *
 * @param name - The key of the object
 * @param value - The object to save
 */

export const setJSONItem = (name: string, value: object) => {
  localStorage.setItem(name, JSON.stringify(value))
}

type SavedType = string | null

/**
 * Gets an Item from localstorage
 *
 * @param name - The key used to save the object
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
 */

export const removeItem = (name: string) => {
  localStorage.removeItem(name)
}
