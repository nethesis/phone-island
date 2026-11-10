// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useMemo, memo } from 'react'
import { RootState } from '../../store'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { getDisplayText, getTextClassName } from './DisplayNameUtils'
import TextScroll from '../TextScroll'

const selectDisplayNameAndIncoming = (state: RootState) => ({
  displayName: state?.currentCall?.displayName,
  incoming: state?.currentCall?.incoming,
})

const selectIntrudeListenStatus = (state: RootState) => state.listen

const DisplayName: React.FC<DisplayNameProps> = () => {
  const { displayName, incoming } = useSelector(selectDisplayNameAndIncoming)
  const intrudeListenStatus = useSelector(selectIntrudeListenStatus)

  const { t } = useTranslation()

  const displayTextResult = useMemo(
    () => getDisplayText({ intrudeListenStatus, displayName, incoming, t }),
    [intrudeListenStatus, displayName, incoming, t],
  )

  const displayText = displayTextResult.content

  const textClassName = useMemo(() => getTextClassName(), [])

  return (
    <div
      className='pi-relative pi-block pi-w-full pi-min-w-0 pi-overflow-hidden pi-whitespace-nowrap pi-text-lg pi-font-medium'
      data-tooltip-id={displayText ? 'tooltip-display-name' : undefined}
      data-tooltip-content={displayText || ''}
    >
      <div className={`${textClassName} pi-w-full pi-min-w-0`}>
        {displayTextResult.type === 'scroll' ? (
          <TextScroll text={displayText} />
        ) : (
          <span className='pi-block pi-max-w-full pi-truncate'>{displayText}</span>
        )}
      </div>
    </div>
  )
}

export default memo(DisplayName)

export interface DisplayNameProps {}
