// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ConversationTypes } from '../../types'

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
