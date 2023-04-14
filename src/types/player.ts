// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

export interface PlayerStartTypes {
  base64_audio_file?: string
  type?: TypeTypes
  id?: string
  description: string
}

export type TypeTypes = 'announcement' | 'call_recording'
