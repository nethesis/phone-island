// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useState } from 'react'
import { Button } from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRecordVinyl, faStop } from '@nethesis/nethesis-solid-svg-icons'

export const Actions: FC<{ animationStartedCallback: (started: boolean) => void }> = ({
  animationStartedCallback,
}) => {
  const [animationStarted, setAnimationStarted] = useState<boolean>(false)

  function handleStartAnimation() {
    setAnimationStarted((state) => {
      animationStartedCallback(!state)
      return !state
    })
  }

  return (
    <div className='pi-flex pi-justify-center pi-items-center pi-pt-9'>
      {animationStarted ? (
        <Button onClick={handleStartAnimation} variant='default' className='pi-scale-110'>
          <FontAwesomeIcon icon={faStop} size='xl' />
        </Button>
      ) : (
        <Button onClick={handleStartAnimation} variant='red' className='pi-scale-110'>
          <FontAwesomeIcon icon={faRecordVinyl} size='xl' />
        </Button>
      )}
    </div>
  )
}
