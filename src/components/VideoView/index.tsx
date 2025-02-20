// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useRef } from 'react'
import { Button } from '../Button'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState, store } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircle,
  faCircleDot,
  faMicrophone,
  faMicrophoneSlash,
  faPause,
  faPlay,
  faStop,
  faUserPlus,
  faVideo,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { eventDispatch, useIsomorphicLayoutEffect } from '../../utils'
import Hangup from '../Hangup'
import {
  muteCurrentCall,
  pauseCurrentCall,
  recordCurrentCall,
  unmuteCurrentCall,
  unpauseCurrentCall,
} from '../../lib/phone/call'

export interface VideoViewProps {}

export const VideoView: FC<VideoViewProps> = () => {
  const dispatch = useDispatch<Dispatch>()
  const { muted, isVideoEnabled, isRecording, paused } = useSelector(
    (state: RootState) => state.currentCall,
  )
  const intrudeListenStatus = useSelector((state: RootState) => state.listen)

  //// ?
  const audioPlayer = useRef<HTMLAudioElement>(null)
  const localAudio = useRef<HTMLAudioElement>(null)
  const remoteAudio = useRef<HTMLAudioElement>(null)
  const localVideo = useRef<HTMLVideoElement>(null)
  const remoteVideo = useRef<HTMLVideoElement>(null)

  //// ?
  useIsomorphicLayoutEffect(() => {
    dispatch.player.updatePlayer({
      audioPlayer: audioPlayer,
      localAudio: localAudio,
      localVideo: localVideo,
      remoteVideo: remoteVideo,
      remoteAudio: remoteAudio,
    })
  }, [])

  const toggleVideo = () => {
    const { isVideoEnabled } = store.getState().currentCall
    store.dispatch.currentCall.setVideoEnabled(!isVideoEnabled)
    eventDispatch('phone-island-toggle-video', { enableVideo: !isVideoEnabled })
  }

  return (
    <>
      {/* remote video */}
      <div className='pi-flex pi-flex-col pi-relative'>
        <video
          autoPlay
          muted={true}
          ref={remoteVideo}
          className='pi-rounded-3xl bg-gray-500 pi-max-h-[18rem]'
        ></video>
        {/* local video */}
        <video
          muted={true}
          autoPlay
          ref={localVideo}
          className='pi-max-w-32 pi-max-h-32 pi-absolute pi-top-5 pi-right-5 pi-rounded-lg bg-gray-500'
        ></video>
      </div>

      <div className='pi-flex pi-items-center pi-gap-6'>
        {/* mute button */}
        {!intrudeListenStatus?.isListen && (
          <Button
            variant='default'
            active={muted ? true : false}
            onClick={() => (muted ? unmuteCurrentCall() : muteCurrentCall())}
            data-tooltip-id='tooltip-mute'
            data-tooltip-content={muted ? `${t('Tooltip.Unmute')}` : `${t('Tooltip.Mute')}`}
          >
            {muted ? (
              <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faMicrophoneSlash} />
            ) : (
              <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faMicrophone} />
            )}
          </Button>
        )}
        {/* video button */}
        <Button
          variant='default'
          onClick={() => toggleVideo()}
          data-tooltip-id='tooltip-toggle-video'
          data-tooltip-content={
            isVideoEnabled ? t('Tooltip.Disable video') : t('Tooltip.Enable video')
          }
        >
          <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faVideo} />
        </Button>
        {/* //// kebab button */}

        {/* record call */}
        <Button
          active={isRecording}
          data-stop-propagation={true}
          variant='default'
          onClick={() => recordCurrentCall(isRecording)}
          data-tooltip-id='tooltip-record'
          data-tooltip-content={
            isRecording ? t('Tooltip.Stop recording') || '' : t('Tooltip.Record') || ''
          }
        >
          {isRecording ? (
            <FontAwesomeIcon icon={faStop} className='pi-h-6 pi-w-6' />
          ) : (
            <div className='custom-circle-dot-wrapper' data-stop-propagation={true}>
              <FontAwesomeIcon
                icon={faCircleDot}
                className='fa-circle-dot pi-text-white dark:pi-text-red-700'
              />
              <FontAwesomeIcon
                icon={faCircle}
                className='inner-dot pi-text-red-700 dark:pi-text-white'
              />
            </div>
          )}
        </Button>
        {/* hold */}
        {!(intrudeListenStatus?.isIntrude || intrudeListenStatus?.isListen) && (
          <Button
            variant='default'
            active={paused ? true : false}
            onClick={() => (paused ? unpauseCurrentCall() : pauseCurrentCall())}
            data-tooltip-id='tooltip-pause'
            data-tooltip-content={paused ? `${t('Tooltip.Play')}` : `${t('Tooltip.Pause')}`}
          >
            {paused ? (
              <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faPlay} />
            ) : (
              <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faPause} />
            )}
          </Button>
        )}
      </div>

      <Hangup />
    </>
  )
}

export default VideoView
