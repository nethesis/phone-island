// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

export const playBase64Ringtone = (audio) => {
  // Play outgoing audio
  const player: HTMLAudioElement = new Audio(`data:audio/ogg;base64, ${audio}`)
  player.loop = true
  player.play()
  return player
}
