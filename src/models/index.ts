import { Models } from '@rematch/core'
import { player } from './player'
import { webrtc } from './webrtc'

export interface RootModel extends Models<RootModel> {
  player: typeof player
  webrtc: typeof webrtc
}

export const models: RootModel = {
  player,
  webrtc,
}
