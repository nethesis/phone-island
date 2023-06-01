// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

export default function exposeWorker(workerFunction: () => void) {
  return URL.createObjectURL(
    new Blob(['(', workerFunction.toString(), ')()'], { type: 'application/javascript' }),
  )
}
