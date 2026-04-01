// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ConversationTypes, ExtensionsTypes, ExtensionTypes } from '../../types'

export function getExtensionByNumber(
  number: string | undefined,
  extensions?: ExtensionsTypes | null,
): ExtensionTypes | undefined {
  if (!number || !extensions) {
    return undefined
  }

  return Object.values(extensions).find((item) => item?.exten === number)
}

function getExtensionNameByNumber(
  number: string | undefined,
  extensions?: ExtensionsTypes | null,
): string {
  const extension = getExtensionByNumber(number, extensions)
  return extension?.name || ''
}

function hasUsableDisplayName(displayName: string | undefined, number: string | undefined): boolean {
  return !!displayName && displayName !== '<unknown>' && displayName !== number
}

export function getDisplayName(conv: ConversationTypes): string {
  let dispName = ''
  if (
    conv &&
    conv.counterpartName !== '<unknown>' &&
    typeof conv.counterpartName === 'string' &&
    conv.counterpartName.length > 0
  ) {
    dispName = conv.counterpartName
  } else if (
    conv &&
    conv.counterpartNum &&
    typeof conv.counterpartNum === 'string' &&
    conv.counterpartNum.length > 0
  ) {
    dispName = conv.counterpartNum
  } else {
    dispName = 'Anonymous'
  }
  return dispName
}

interface ResolveDisplayNameOptions {
  conv?: ConversationTypes
  extensions?: ExtensionsTypes | null
  fallbackDisplayName?: string
  fallbackNumber?: string
}

export function resolveDisplayName({
  conv,
  extensions,
  fallbackDisplayName = '',
  fallbackNumber = '',
}: ResolveDisplayNameOptions): string {
  const conversationDisplayName = conv ? getDisplayName(conv) : ''
  const number = `${conv?.counterpartNum || fallbackNumber || ''}`

  if (hasUsableDisplayName(fallbackDisplayName, number)) {
    return fallbackDisplayName
  }

  if (hasUsableDisplayName(conversationDisplayName, number)) {
    return conversationDisplayName
  }

  const extensionName = getExtensionNameByNumber(number, extensions)
  if (extensionName) {
    return extensionName
  }

  if (fallbackDisplayName && fallbackDisplayName !== '<unknown>') {
    return fallbackDisplayName
  }

  if (conversationDisplayName && conversationDisplayName !== 'Anonymous') {
    return conversationDisplayName
  }

  if (number) {
    return number
  }

  return 'Anonymous'
}

export function resolveUsernameByNumber(
  number: string | undefined,
  extensions?: ExtensionsTypes | null,
): string {
  return getExtensionByNumber(number, extensions)?.username || ''
}
