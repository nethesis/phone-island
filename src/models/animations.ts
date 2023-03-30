// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

const EXPANDED_PADDING = '24px'
const COLLAPSED_PADDING = '8px 16px'
const BORDER_RADIUS_EXPANDED = '20px'
const BORDER_RADIUS_COLLAPSED = '99px'

const defaultState = {
  variants: {
    // The animation variants for CallView
    callView: {
      // When there is and incoming call and the island is expanded
      expandedIncoming: {
        width: '418px',
        height: '96px',
        borderRadius: BORDER_RADIUS_EXPANDED,
        padding: EXPANDED_PADDING,
      },
      // When there is and incoming call and the island is expanded
      expandedIncomingWithAlerts: {
        width: '418px',
        height: '224px',
        borderRadius: BORDER_RADIUS_EXPANDED,
        padding: EXPANDED_PADDING,
      },
      // When there is an accepted call and the island is expanded
      expandedAccepted: {
        width: '348px',
        height: '236px',
        borderRadius: BORDER_RADIUS_EXPANDED,
        padding: EXPANDED_PADDING,
      },
      // When there is an accepted call and the island is expanded
      expandedAcceptedWithAlerts: {
        width: '348px',
        height: '364px',
        borderRadius: BORDER_RADIUS_EXPANDED,
        padding: EXPANDED_PADDING,
      },
      // When the island is collapsed
      collapsed: {
        width: '168px',
        height: '40px',
        borderRadius: BORDER_RADIUS_COLLAPSED,
        padding: COLLAPSED_PADDING,
      },
      // When there is a transfer
      transfer: {
        expanded: {
          width: '348px',
          height: '304px',
          borderRadius: BORDER_RADIUS_EXPANDED,
          padding: EXPANDED_PADDING,
        },
        expandedWithAlerts: {
          width: '348px',
          height: '336px',
          borderRadius: BORDER_RADIUS_EXPANDED,
          padding: EXPANDED_PADDING,
        },
        collapsed: {
          width: '348px',
          height: '336px',
          borderRadius: BORDER_RADIUS_COLLAPSED,
          padding: COLLAPSED_PADDING,
        },
      },
    },
    // The animation variant for keypadView
    keypadView: {
      expandedWithAlerts: {
        width: '338px',
        height: '590px',
        borderRadius: BORDER_RADIUS_EXPANDED,
        padding: EXPANDED_PADDING,
      },
      expanded: {
        width: '338px',
        height: '462px',
        borderRadius: BORDER_RADIUS_EXPANDED,
        padding: EXPANDED_PADDING,
      },
      collapsed: {
        width: '168px',
        height: '40px',
        borderRadius: BORDER_RADIUS_COLLAPSED,
        padding: COLLAPSED_PADDING,
      },
    },
    // The animation variant for transferListView
    transferListView: {
      expandedWithAlerts: {
        width: '408px',
        height: '600px',
        borderRadius: BORDER_RADIUS_EXPANDED,
        padding: EXPANDED_PADDING,
      },
      expanded: {
        width: '408px',
        height: '472px',
        borderRadius: BORDER_RADIUS_EXPANDED,
        padding: EXPANDED_PADDING,
      },
      collapsed: {
        width: '168px',
        height: '40px',
        borderRadius: BORDER_RADIUS_COLLAPSED,
        padding: COLLAPSED_PADDING,
      },
    },
    // The animation variant for transferActionsView
    transferActionsView: {
      expanded: {
        width: '398px',
        height: '462px',
        borderRadius: BORDER_RADIUS_EXPANDED,
        padding: EXPANDED_PADDING,
      },
      collapsed: {
        width: '168px',
        height: '40px',
        borderRadius: BORDER_RADIUS_COLLAPSED,
        padding: COLLAPSED_PADDING,
      },
    },
    // When theare aren't calls but there are alerts
    expandedWithAlerts: {
      width: '418px',
      height: '152px',
      borderRadius: BORDER_RADIUS_EXPANDED,
      padding: EXPANDED_PADDING,
    },
  },
}

export const animations = createModel<RootModel>()({
  state: defaultState,
})

export type AnimationsTypes = typeof defaultState