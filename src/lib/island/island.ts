// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../../store'
import { eventDispatch } from '../../utils'

/**
 * Retrieve the position on x axis
 */
export function xPosition(x: number, islandElement: HTMLElement, containerElement: HTMLElement) {
  // Get horizontal constraints
  const xConstraintPosition = containerElement.offsetWidth / 2 - islandElement.offsetWidth / 2
  // Return the X position inside the constraints
  return x > 0 && x > xConstraintPosition
    ? xConstraintPosition
    : x < 0 && x < -xConstraintPosition
    ? -xConstraintPosition
    : x
}

/**
 * Retrieve the position on y axis
 */
export function yPosition(y: number, islandElement: HTMLElement, containerElement: HTMLElement) {
  // Get vertical constraints
  const yConstraintPosition = containerElement.offsetHeight / 2 - islandElement.offsetHeight / 2
  // Return the Y position inside the constraints
  return y > 0 && y > yConstraintPosition
    ? yConstraintPosition
    : y < 0 && y < -yConstraintPosition
    ? -yConstraintPosition
    : y
}

/**
 * Sets callview as the current view
 */
export function backToCallView() {
  const { view } = store.getState().island
  eventDispatch(`phone-island-call-${view}-closed`, {})

  store.dispatch.island.setIslandView('call')
}
