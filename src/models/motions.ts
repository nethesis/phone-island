// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

const defaultState = {
  padding_expanded: 24,
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
        },
        transfer: {
          width: 348,
          height: 304,
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
        height: 462,
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
        height: 472,
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
  },
}

export const motions = createModel<RootModel>()({
  state: defaultState,
})

export type AnimationsTypes = typeof defaultState
