// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useCallback } from 'react'
import useCommittedRef from './useCommittedRef'

export function useEventCallback<TCallback extends (...args: any[]) => any>(
  fn?: TCallback | null,
): TCallback {
  const ref = useCommittedRef(fn)
  return useCallback(
    function (...args: any[]) {
      return ref.current && ref.current(...args)
    },
    [ref],
  ) as any
}
