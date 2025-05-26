// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useRef, useLayoutEffect, useCallback, useMemo, memo } from 'react'
import { StyledName } from '../../styles/Island.styles'
import { motion } from 'framer-motion'
import { RootState } from '../../store'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { getDisplayText, getTextClassName } from './DisplayNameUtils'

const selectDisplayNameAndIncoming = (state: RootState) => ({
  displayName: state.currentCall.displayName,
  incoming: state.currentCall.incoming,
})

const selectIntrudeListenStatus = (state: RootState) => state.listen

const DisplayName: React.FC<DisplayNameProps> = () => {
  const [animateText, setAnimateText] = useState<boolean>(false)
  const nameContainer = useRef<null | HTMLDivElement>(null)
  const nameText = useRef<null | HTMLDivElement>(null)
  const NameMotion = motion(StyledName)

  const { displayName, incoming } = useSelector(selectDisplayNameAndIncoming)
  const intrudeListenStatus = useSelector(selectIntrudeListenStatus)

  const { t } = useTranslation()

  useLayoutEffect(() => {
    if (
      nameContainer?.current &&
      nameText?.current &&
      nameText?.current?.clientWidth - nameContainer?.current?.clientWidth > 5
    ) {
      setAnimateText(true)
    }
  }, [nameContainer, nameText])

  const textClassName = useMemo(
    () => getTextClassName({ intrudeListenStatus, animateText }),
    [intrudeListenStatus, animateText],
  )

  const displayTextContent = useMemo(
    () => getDisplayText({ intrudeListenStatus, displayName, incoming, t }),
    [intrudeListenStatus, displayName, incoming, t],
  )

  return (
    <NameMotion ref={nameContainer} className='pi-whitespace-nowrap pi-relative pi-overflow-hidden'>
      <div className={textClassName} ref={nameText}>
        {displayTextContent}
      </div>
      <div className='pi-w-6 pi-absolute pi-right-0 pi-top-0 pi-h-full pi-bg-gradient-to-r pi-from-transparent dark:pi-to-gray-950 pi-to-gray-50' />
    </NameMotion>
  )
}

export default memo(DisplayName)

export interface DisplayNameProps {}
