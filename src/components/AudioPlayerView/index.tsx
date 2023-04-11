// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { Avatar } from './Avatar'

export const KeypadView: FC<KeypadViewTypes> = () => {
  const { audioPlayerType } = useSelector((state: RootState) => state.player)

  return (
    <>
      <Avatar type={audioPlayerType} />
    </>
  )
}

export default KeypadView

export interface KeypadViewTypes {}
