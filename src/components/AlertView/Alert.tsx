// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { classNames } from '../../utils/'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTriangleExclamation,
  faCircleCheck,
  faCircleXmark,
} from '@nethesis/nethesis-solid-svg-icons'

const classes = {
  base: 'pi-border-4 pi-rounded-2xl pi-p-4 pi-flex pi-gap-5 pi-items-center',
  red: 'pi-border-red-600',
  orange: 'pi-border-orange-600',
  green: 'pi-border-green-600',
}

const Alert: FC<AlertProps> = ({ color, message }) => {
  return (
    <div className={classNames(classes.base, classes[color])}>
      <div className='pi-w-12 pi-h-12 pi-rounded-xl pi-bg-gray-300 pi-shrink-0 pi-flex pi-justify-center pi-items-center'>
        {color === 'green' ? (
          <FontAwesomeIcon icon={faCircleCheck} size='xl' className='pi-text-black' />
        ) : color === 'orange' ? (
          <FontAwesomeIcon icon={faTriangleExclamation} size='xl' className='pi-text-black' />
        ) : (
          <FontAwesomeIcon icon={faCircleXmark} size='xl' className='pi-text-black' />
        )}
      </div>
      <div className='pi-text-sm'>{message}</div>
    </div>
  )
}

export default Alert

interface AlertProps {
  type: 'alert' | 'feedback'
  color: 'red' | 'orange' | 'green'
  message: string
}
