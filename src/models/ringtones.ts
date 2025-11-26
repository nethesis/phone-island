// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import incomingRingtone from '../static/incoming_ringtone'
import exampleTone1 from '../static/example_tone1'
import exampleTone2 from '../static/example_tone2'
import exampleTone3 from '../static/example_tone3'
import exampleTone4 from '../static/example_tone4'

export interface RingtoneOption {
  name: string
  displayName: string
  base64Audio: string
}

export interface RingtonesTypes {
  availableRingtones: RingtoneOption[]
  selectedRingtone: string
  outputDeviceId: string | null
}

const AVAILABLE_RINGTONES: RingtoneOption[] = [
  {
    name: 'default',
    displayName: 'Default',
    base64Audio: incomingRingtone,
  },
  {
    name: 'tone1',
    displayName: 'Tone 1',
    base64Audio: exampleTone1,
  },
  {
    name: 'tone2',
    displayName: 'Tone 2',
    base64Audio: exampleTone2,
  },
  {
    name: 'tone3',
    displayName: 'Tone 3',
    base64Audio: exampleTone3,
  },
  {
    name: 'tone4',
    displayName: 'Tone 4',
    base64Audio: exampleTone4,
  },
]

const defaultState: RingtonesTypes = {
  availableRingtones: AVAILABLE_RINGTONES,
  selectedRingtone: 'default',
  outputDeviceId: null,
}

export const ringtones = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    setSelectedRingtone: (state, payload: string) => {
      // Validate that the ringtone exists
      const ringtoneExists = state.availableRingtones.some((r) => r.name === payload)
      if (!ringtoneExists) {
        console.warn(`Ringtone "${payload}" not found. Keeping current selection.`)
        return state
      }
      return {
        ...state,
        selectedRingtone: payload,
      }
    },
    setOutputDeviceId: (state, payload: string | null) => {
      return {
        ...state,
        outputDeviceId: payload,
      }
    },
    reset: () => {
      return defaultState
    },
  },
  effects: (dispatch) => ({
    /**
     * Gets the currently selected ringtone's base64 audio data
     */
    getSelectedRingtoneAudio: (_: void, rootState): string => {
      const { selectedRingtone, availableRingtones } = rootState.ringtones
      const ringtone = (availableRingtones as RingtoneOption[]).find(
        (r) => r.name === selectedRingtone,
      )
      return ringtone?.base64Audio || (availableRingtones as RingtoneOption[])[0].base64Audio
    },
  }),
})
