// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { Actions } from './Actions'
import { BarsGroup } from './BarsGroup'

export const RecorderView: FC<RecorderViewProps> = () => {
  const { isOpen } = useSelector((state: RootState) => state.island)
  const visibleContainerRef = useRef<HTMLDivElement>(null)
  const [animationStarted, setAnimationStarted] = useState<boolean>(false)

  return (
    <>
      {isOpen ? (
        <>
          {' '}
          <div className='pi-flex pi-w-full pi-justify-center pi-items-center pi-pt-4 pi-pb-9'>
            <div className='pi-font-medium pi-text-4xl pi-w-fit pi-h-fit pi-text-white'>
              00:00:00
            </div>
          </div>
          {/* Bars animation section  */}
          <div
            className='pi-relative pi-w-full pi-h-8 pi-overflow-x-hidden pi-flex'
            ref={visibleContainerRef}
          >
            {Array.from({ length: 2 }).map((_, i) => (
              <BarsGroup
                key={i}
                index={i}
                startAnimation={animationStarted}
                visibleContainerRef={visibleContainerRef}
              />
            ))}
          </div>
          {/* Actions section */}
          <Actions animationStartedCallback={(started: boolean) => setAnimationStarted(started)} />
        </>
      ) : (
        <div className='pi-font-medium pi-text-base'>Recorder</div>
      )}
    </>
  )
}

export interface RecorderViewProps {}
