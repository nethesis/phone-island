// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

export const useEventDispatch = (
  name: string,
  data: any,
  element: HTMLElement | Window = window,
) => {
  typeof element !== 'undefined'
    ? element.dispatchEvent(new CustomEvent(name, { detail: data }))
    : console.error(new Error('EventDispatch error: element is not defined'))
}
