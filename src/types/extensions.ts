// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { ConversationTypes } from './conversation'

export interface ExtensionsTypes {
  [key: string]: ExtensionTypes
}

export interface ExtensionTypes {
  ip: string
  cf: string
  mac: string
  cfb: string
  cfu: string
  dnd: boolean
  cfVm: string
  port: string
  name: string
  cfbVm: string
  cfuVm: string
  exten: string
  codecs: CodecsTypes
  status: string
  context: string
  chanType: string
  username: string
  sipuseragent: string
  conversations: {
    [id: string]: ConversationTypes
  }
}

export type CodecsTypes = 'ulaw' | 'alaw' | 'opus' | 'gsm' | 'g726' | 'h264' | 'mpeg4'
