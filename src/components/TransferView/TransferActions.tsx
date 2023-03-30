// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { Button } from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faMicrophoneSlash } from '@nethesis/nethesis-light-svg-icons'

export const TransferActions: FC<TransferActionsProps> = () => {
  return (
    <div className='pi-grid pi-grid-cols-4 pi-auto-cols-max pi-gap-y-5 pi-justify-items-center pi-place-items-center pi-justify-center'>
      <div></div>
      <Button variant='default'>
        <FontAwesomeIcon size='xl' icon={faPlay} />
      </Button>
      <Button variant='default'>
        <FontAwesomeIcon size='xl' icon={faMicrophoneSlash} />
      </Button>
      <div></div>
    </div>
  )
}

interface TransferActionsProps {}
