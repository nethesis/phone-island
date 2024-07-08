// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import Timer from '../RecorderView/Timer'
import { useTranslation } from 'react-i18next'
import Hangup from '../Hangup'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle } from '@fortawesome/free-solid-svg-icons'

export const PhysicalRecorderView: FC<PhysicalRecorderViewProps> = () => {
  const { isOpen } = useSelector((state: RootState) => state.island)
  const visibleContainerRef = useRef<HTMLDivElement>(null)

  // Initialize state dispatch
  const dispatch = useDispatch<Dispatch>()

  // Handle view close and reset state
  useEffect(() => {
    // Set visible container reference to recorder state
    dispatch.recorder.setVisibleContainerRef(visibleContainerRef)

    return () => {
      dispatch.recorder.reset()
    }
  }, [])

  const { t } = useTranslation()

  return (
    <>
      {isOpen ? (
        <>
          <div className='pi-flex pi-w-full pi-justify-center pi-items-center pi-pt-2'>
            <div className='pi-font-medium pi-text-4xl pi-w-fit pi-h-fit dark:pi-text-white'>
              <Timer />
            </div>
          </div>

          <div className='pi-grid pi-pt-2'>
            <div className='pi-grid pi-justify-items-center'>
              <Hangup description={t('Tooltip.Interrupt recording')} />
            </div>
          </div>
        </>
      ) : (
        <div className='pi-flex pi-justify-between pi-items-center'>
          <div className='pi-font-medium pi-text-base'>Recording</div>
          <div
            className={`${
              !isOpen ? 'pi-h-6 pi-w-6' : 'pi-h-12 pi-w-12'
            } pi-flex pi-justify-center pi-items-center`}
          >
            <div
              className={`${
                !isOpen ? 'pi-h-4 pi-w-4 pi-rounded-full' : 'pi-h-8'
              } pi-w-fit pi-flex pi-justify-center pi-items-center pi-gap-1 pi-overflow-hidden`}
            >
              <span
                className={`${
                  !isOpen ? 'pi-h-6 pi-w-6' : 'pi-w-8 pi-h-8'
                } pi-animate-ping pi-absolute pi-inline-flex pi-rounded-full pi-bg-red-400 pi-opacity-75 `}
              ></span>
              <FontAwesomeIcon
                className='pi-w-4 pi-h-6 pi-rotate-45 pi-text-red-500'
                icon={faCircle}
              ></FontAwesomeIcon>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export interface PhysicalRecorderViewProps {}
