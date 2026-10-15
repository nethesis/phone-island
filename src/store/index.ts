// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { init, RematchDispatch, RematchRootState } from '@rematch/core'
import { models, RootModel } from '../models'
import immerPlugin from '@rematch/immer'
import selectPlugin from '@rematch/select'
import { setAutoFreeze } from 'immer'
import packageInfo from '../../package.json'

setAutoFreeze(false)

export const store = init<RootModel>({
  models,
  plugins: [immerPlugin(), selectPlugin()],
})

export type Store = typeof store
export type Dispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel>

/**
 * Export all stores data as JSON
 * This provides a "dump" functionality to capture all application state
 * Useful for debugging, backup, or state analysis
 */
export const exportAllStoresAsJSON = (): string => {
  const currentState = store.getState()

  // Create a clean export object with timestamp
  const storeExport = {
    timestamp: new Date().toISOString(),
    version: packageInfo.version,
    appName: packageInfo.name,
    description: packageInfo.description,
    stores: {},
  }

  const sanitizeState = (obj: any): any => {
    if (!obj || typeof obj !== 'object') {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => sanitizeState(item))
    }

    const cleanObject: any = {}

    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        continue
      }

      const value = obj[key]

      if (value instanceof HTMLElement || value instanceof Node || typeof value === 'function') {
        cleanObject[key] = '[DOM Element]'
        continue
      }

      if (key.startsWith('__react') || key.startsWith('_react')) {
        continue
      }

      try {
        JSON.stringify({ test: value })
        cleanObject[key] = sanitizeState(value)
      } catch (err) {
        if (value instanceof Error) {
          cleanObject[key] = {
            errorName: value.name,
            errorMessage: value.message,
            errorStack: value.stack,
          }
        } else if (value instanceof Date) {
          cleanObject[key] = value.toISOString()
        } else if (typeof value === 'object' && value !== null) {
          cleanObject[key] = '[Circular Reference]'
        } else {
          cleanObject[key] = `[Unserializable: ${typeof value}]`
        }
      }
    }

    return cleanObject
  }

  for (const storeKey in currentState) {
    try {
      storeExport.stores[storeKey] = sanitizeState(currentState[storeKey])
    } catch (error) {
      console.error(`Error ${storeKey}:`, error)
      storeExport.stores[storeKey] = {
        error: `Failed to sanitize: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  return JSON.stringify(
    storeExport,
    (key, value) => {
      if (value === undefined) return '[Undefined]'
      if (value === Infinity) return '[Infinity]'
      if (Number.isNaN(value)) return '[NaN]'
      return value
    },
    2,
  )
}

/**
 * Download all stores data as JSON file
 * Creates and triggers download of a JSON file containing all store states
 */
export const downloadStoresAsJSON = (): void => {
  try {
    const jsonData = exportAllStoresAsJSON()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `phone-island-stores-${timestamp}.json`

    // Create download link
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {}
}
