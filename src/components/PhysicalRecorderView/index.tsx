// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState, store } from '../../store'
import { useTranslation } from 'react-i18next'
import Hangup from '../Hangup'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import { useEventListener, eventDispatch } from '../../utils'
import { startAnnouncementRecording } from '../../services/offhour'
import { dispatchPhysicalRecordingSave } from '../../events'
import PhysicalRecordingTimer from './PhysicalRecordingTimer'

export const PhysicalRecorderView: FC<PhysicalRecorderViewProps> = () => {
  const { isOpen } = useSelector((state: RootState) => state.island)
  const { recording } = useSelector((state: RootState) => ({
    recording: state.physicalRecorder.recording,
  }))

  const { username } = store.getState().currentUser
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

  async function handleStart() {
    // Update the recorder state
    dispatch.physicalRecorder.setRecording(true)
    // Call the api to start the recording call
    const data: { tempFilename: string } | null = await startAnnouncementRecording()
    // Set the returned temp file name to the store
    if (data.tempFilename) dispatch.physicalRecorder.setTempFilename(data.tempFilename)
    eventDispatch('phone-island-recording-started', {})
  }

  // Save recording inside store and make api request
  useEventListener('phone-island-physical-recording-open', () => {
    handleStart()
  })

  const { recordingTempVariable } = store.getState().physicalRecorder
  // recording true and conversation not empty recording is started
  // recording true and conversation empty recording is stopped
  useEventListener('phone-island-conversations', (data: { [key: string]: any }) => {
    const keys = Object.keys(data)

    keys.forEach((key) => {
      if (key === username) {
        let conversations = data[key]?.conversations

        if (conversations) {
          const conversationKeys = Object.keys(conversations)
          if (
            conversationKeys.length > 0 &&
            conversations[conversationKeys[0]].counterpartName === 'REC'
          ) {
            // Set the start time of recording
            dispatch.physicalRecorder.setStartTime(`${Date.now() / 1000}`)
            let firstConversationKey = conversationKeys[0]
            let userRecordingData = conversations[firstConversationKey]
            if (userRecordingData) {
              if (userRecordingData.chSource) {
                let recordingCallInformation = {
                  conversationId: userRecordingData.id,
                  endpointId: userRecordingData.chSource.callerNum,
                }
                dispatch.physicalRecorder.setCallRecordingInformations({
                  recordingCallInformation,
                })
              }
            }
          }
          if (conversationKeys.length === 0 && recording && !recordingTempVariable) {
            // close physical recording phone island view
            dispatchPhysicalRecordingSave()
            dispatch.island.setIslandView(null)
            dispatch.physicalRecorder.setRecording(false)
          }
        }
      }
    })
  })

  return (
    <>
      {isOpen ? (
        <div className=''>
          {recordingTempVariable && (
            <div className='pi-flex pi-w-full pi-justify-center pi-items-center pi-pt-4 pi-pb-9'>
              <div className='pi-font-medium pi-text-4xl pi-w-fit pi-h-fit dark:pi-text-white'>
                <PhysicalRecordingTimer />
              </div>
            </div>
          )}
          <div className='pi-flex pi-w-full pi-justify-center pi-items-center'>
            {recordingTempVariable ? (
              <div className='pi-sans pi-text-sm pi-w-fit pi-h-fit dark:pi-text-white'>
                {t('Common.Close the call to stop recording')}
              </div>
            ) : (
              <div className='pi-mt-[3rem] pi-font-regular pi-text-lg pi-w-fit pi-h-fit dark:pi-text-white'>
                {t('Common.Answer phone to start recording')}
              </div>
            )}
          </div>
          <div className='pi-grid pi-pt-2 pi-mt-8'>
            <div className='pi-grid pi-justify-items-center'>
              <Hangup description={t('Tooltip.Interrupt recording')} isPhysicalRecording />
            </div>
          </div>
        </div>
      ) : (
        <div className='pi-flex pi-justify-between pi-items-center'>
          <div className='pi-font-medium pi-text-base'>{t('Common.Recording')}</div>
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
