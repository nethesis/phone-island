// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

export const isEmpty = (obj) => {
  // Check if it's null or undefined
  if (obj == null) return true

  // Check if it's an array and if it's empty
  if (Array.isArray(obj)) return obj.length === 0

  // Check if it's an object and if it's empty
  return Object.keys(obj).length === 0
}
