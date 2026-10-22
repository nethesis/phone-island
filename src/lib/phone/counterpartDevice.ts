// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type {
  ConversationTypes,
  ExtensionsTypes,
  ExtensionTypeTypes,
  UsersEndpointsTypes,
} from '../../types'

interface UsersDataTypes {
  extensions: ExtensionsTypes | null
  endpoints: UsersEndpointsTypes | null
}

export function getExtensionFromChannel(channel?: string): string {
  if (!channel || typeof channel !== 'string' || channel.startsWith('Local/')) return ''
  const dashIndex = channel.lastIndexOf('-')
  const base = dashIndex > 0 ? channel.substring(0, dashIndex) : channel
  const parts = base.split('/')
  return parts.length > 1 ? parts[1] : ''
}

function getDeviceType(
  exten: string,
  username: string,
  endpoints: UsersEndpointsTypes | null,
): ExtensionTypeTypes | '' {
  const userExtensions = endpoints?.[username]?.endpoints?.extension || []
  return userExtensions.find((extension) => extension?.id === exten)?.type || ''
}

function findDeviceByLinkedId(
  conv: ConversationTypes,
  username: string,
  extensions: ExtensionsTypes,
): string {
  if (!conv.linkedId) return ''

  const candidates = Object.values(extensions).filter(
    (extension) => extension?.username === username && extension?.exten !== conv.owner,
  )

  for (const extension of candidates) {
    const conversations = Object.values(extension?.conversations || {})
    const match = conversations.find(
      (conversation) =>
        conversation?.linkedId === conv.linkedId &&
        (conv.connected ? conversation.connected : conversation.direction === 'out'),
    )
    if (match) return extension.exten
  }

  return ''
}

export function getCounterpartDeviceType(
  conv: ConversationTypes,
  users: UsersDataTypes,
): ExtensionTypeTypes | '' {
  const { extensions, endpoints } = users
  if (!conv || !extensions) return ''

  const counterpartNum = `${conv.counterpartNum || ''}`
  const username = extensions[counterpartNum]?.username
  if (!username) return ''

  const channelExtensions = [conv.chSource?.channel, conv.chDest?.channel]
    .map(getExtensionFromChannel)
    .filter((exten) => exten && exten !== conv.owner)

  let deviceExten =
    channelExtensions.find((exten) => extensions[exten]?.username === username) || ''

  if (!deviceExten) {
    deviceExten = findDeviceByLinkedId(conv, username, extensions)
  }

  if (!deviceExten) return ''

  return getDeviceType(deviceExten, username, endpoints)
}
