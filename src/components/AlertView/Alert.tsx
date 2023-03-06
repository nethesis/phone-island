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
  base: 'border-4 rounded-2xl p-6 flex gap-5 items-center',
  red: 'border-red-600',
  orange: 'border-orange-600',
  green: 'border-green-600',
}

const Alert: FC<AlertProps> = ({ color, message }) => {
  return (
    <div className={classNames(classes.base, classes[color])}>
      <div className='w-12 h-12 rounded-xl bg-gray-300 shrink-0 flex justify-center items-center'>
        {color === 'green' ? (
          <FontAwesomeIcon icon={faCircleCheck} size='xl' className='text-black' />
        ) : color === 'orange' ? (
          <FontAwesomeIcon icon={faTriangleExclamation} size='xl' className='text-black' />
        ) : (
          <FontAwesomeIcon icon={faCircleXmark} size='xl' className='text-black' />
        )}
      </div>
      <div className='text-base font-bold'>{message}</div>
    </div>
  )
}

export default Alert

interface AlertProps {
  type: 'alert' | 'feedback'
  color: 'red' | 'orange' | 'green'
  message: string
}
