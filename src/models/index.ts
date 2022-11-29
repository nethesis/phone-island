import { Models } from '@rematch/core'
import { player } from './player'
import { webrtc } from './webrtc'
import { currentCall } from './currentCall'

export interface RootModel extends Models<RootModel> {
  player: typeof player
  webrtc: typeof webrtc
  currentCall: typeof currentCall
}

export const models: RootModel = {
  player,
  webrtc,
  currentCall,
}
