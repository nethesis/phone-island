// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

export interface ConvType {
  counterpartNum: string | number
  counterpartName: string | number
  connected: boolean
  startTime: number
  direction: 'out' | 'in'
}

export function getDisplayName(conv: ConvType): string {
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
