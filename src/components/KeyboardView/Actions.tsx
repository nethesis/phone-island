// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { Button } from '../'

const keys = Array.from(Array(9).keys())

const bottomKeys = ['*', '0', '#']

const Actions: FC<ActionsTypes> = ({ keyCallback }) => {
  return (
    <div className='grid grid-cols-3 auto-cols-max gap-y-6 justify-items-center place-items-center justify-center px-3'>
      {keys.map((key) => (
        <Button
          key={key + 1}
          onClick={() => keyCallback(key)}
          variant='default'
          className={'text-2xl'}
        >
          {key + 1}
        </Button>
      ))}
      {bottomKeys.map((bottomKey) => (
        <Button
          key={bottomKey + 1}
          onClick={() => keyCallback(bottomKey)}
          variant='default'
          className={'text-2xl'}
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
