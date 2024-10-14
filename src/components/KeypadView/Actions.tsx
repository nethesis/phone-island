// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { Button } from '..'

const keys = Array.from(Array(9).keys())

const bottomKeys = ['*', '0', '#']

const Actions: FC<ActionsTypes> = ({ keyCallback }) => {
  return (
    <div className='pi-grid pi-grid-cols-3 pi-auto-cols-max pi-gap-y-6 pi-justify-items-center pi-place-items-center pi-justify-center pi-px-3'>
      {keys.map((key) => (
        <Button
          key={key + 1}
          onClick={() => keyCallback(key + 1)}
          variant='default'
          className={'pi-text-2xl'}
          style={{ transform: 'scale(1.15)' }}
        >
          {key + 1}
        </Button>
      ))}
      {bottomKeys.map((bottomKey) => (
        <Button
          key={bottomKey + 1}
          onClick={() => keyCallback(bottomKey)}
          variant='default'
          className={'pi-text-2xl'}
          style={{ transform: 'scale(1.15)' }}
        >
          {bottomKey}
        </Button>
      ))}
    </div>
  )
}

export default Actions

interface ActionsTypes {
  keyCallback: any
}
