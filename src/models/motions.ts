// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

const defaultState = {
  padding_expanded: 24,
  alert_padding_expanded: 2,
  padding_x_collapsed: 8,
  padding_y_collapsed: 16,
  border_radius_expanded: 20,
  border_radius_collapsed: 99,
  variants: {
    // Call View
    call: {
      expanded: {
        incoming: {
          width: 418,
          height: 96,
        },
        outgoing: {
          width: 418,
          height: 96,
        },
        accepted: {
          width: 348,
          height: 236,
          actionsExpanded: {
            width: 348,
            height: 304,
          },
        },
        listening: {
          width: 348,
          height: 168,
        },
        transfer: {
          width: 348,
          height: 236,
          actionsExpanded: {
            width: 348,
            height: 304,
          },
        },
      },
      collapsed: {
        width: 168,
        height: 40,
      },
    },
    // Keypad View
    keypad: {
      expanded: {
        width: 338,
        height: 400,
      },
      collapsed: {
        width: 168,
        height: 40,
      },
    },
    // Transfer View
    transfer: {
      expanded: {
        width: 408,
        height: 410,
      },
      collapsed: {
        width: 168,
        height: 40,
      },
    },
    // Audio Player View
    player: {
      expanded: {
        width: 374,
        height: 236,
      },
      collapsed: {
        width: 168,
        height: 40,
      },
    },
    // Recorder View
    recorder: {
      expanded: {
        width: 374,
        height: 256,
      },
      collapsed: {
        width: 168,
        height: 40,
      },
    },
    // Physical Recorder View
    physicalPhoneRecorder: {
      expanded: {
        width: 374,
        height: 256,
      },
      collapsed: {
        width: 168,
        height: 40,
      },
    },
    // Alerts Section
    alerts: {
      width: 418,
      height: 88,
    },
    settings: {
      expanded: {
        width: 374,
        height: 256,
      },
      collapsed: {
        width: 168,
        height: 40,
      },
    },
  },
}

export const motions = createModel<RootModel>()({
  state: defaultState,
})

export type AnimationsTypes = typeof defaultState
