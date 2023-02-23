// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Joins multiple string with classes in one string
 * 
 * @param classes An array of classes
 * @returns A unique string of classes
 */

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}