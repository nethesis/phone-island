// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useMemo, useCallback, memo } from 'react'
import { useSelector } from 'react-redux'
import { RootState, Dispatch } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPhone,
  faEarListen,
  faHandPointUp,
  faArrowLeft,
  faCircle,
  faUnlock,
} from '@fortawesome/free-solid-svg-icons'
import { Button } from '../'
import Timer from './Timer'
import Number from './Number'
import DisplayName from './DisplayName'
import { AudioBars } from '../'
import { answerIncomingCall } from '../../lib/phone/call'
import Avatar from './Avatar'
import Actions from './Actions'
import Hangup from '../Hangup'
import { useTranslation } from 'react-i18next'
import { faOfficePhone } from '@nethesis/nethesis-solid-svg-icons'
import { isPhysical } from '../../lib/user/default_device'
import { CustomThemedTooltip } from '../CustomThemedTooltip'
import StreamingImage from '../StreamingImage'
import VideoStreamingSkeleton from '../VideoStreamingSkeleton'
import VideoStreamingEmptyState from '../VideoStreamingEmptyState'
import { handleStreamingUnlock } from '../../utils'
import { useDispatch } from 'react-redux'

function isAnswerVisible(outgoing: boolean, accepted: boolean): boolean {
  return !outgoing && !accepted
}

const Details = memo(({ children }: { children: React.ReactNode }) => (
  <div className='pi-grid pi-self-center pi-gap-1 pi-grid-cols-1 pi-grid-rows-2'>{children}</div>
))
Details.displayName = 'Details'

/**
 * The main view to manage calls, the starting point for calls actions flows
 */
const CallView: FC<CallViewProps> = () => {
  const { t } = useTranslation()

  const currentCall = useSelector((state: RootState) => state.currentCall)
  const {
    incoming,
    accepted,
    outgoing,
    startTime,
    paused,
    number,
    isRecording,
    username,
    streamingSourceNumber,
  } = currentCall

  const { isOpen, isFromStreaming } = useSelector((state: RootState) => state.island)
  const { remoteAudioStream } = useSelector((state: RootState) => state.webrtc)
  const listenState = useSelector((state: RootState) => state.listen)
  const { isListen, isIntrude, isListenExtension, isIntrudeExtension } = listenState
  const { data: alertsData } = useSelector((state: RootState) => state.alerts)
  const currentUser = useSelector((state: RootState) => state.currentUser)
  const { videoSources, sourceImages } = useSelector((state: RootState) => state.streaming)

  const activeAlerts = useMemo(
    () => Object.values(alertsData).filter((alert: any) => alert.active),
    [alertsData],
  )

  const latestAlert = useMemo(
    () => (activeAlerts.length > 0 ? activeAlerts[activeAlerts.length - 1] : null),
    [activeAlerts],
  )

  const shouldShowStreamingImage = useMemo(
    () => isFromStreaming && streamingSourceNumber && !accepted,
    [isFromStreaming, streamingSourceNumber, accepted],
  )

  const hasValidUsername = useMemo(() => username !== '' && username !== 'undefined', [username])

  const renderLandlinePhoneDiv = useCallback(
    () => (
      <div className='pi-text-gray-600 dark:pi-text-gray-300 pi-font-normal pi-text-sm pi-flex pi-items-center pi-truncate'>
        <FontAwesomeIcon size='sm' icon={faOfficePhone} className='pi-mr-1' />
        <span className='pi-max-w-16 pi-truncate'>
          {currentUser?.default_device?.description || t('Common.Physical phone')}
        </span>
      </div>
    ),
    [currentUser?.default_device?.description, t],
  )

  const renderPulseIcon = useCallback(
    (color: string) => {
      const sizeClasses = !isOpen ? 'pi-h-6 pi-w-6' : 'pi-h-12 pi-w-12'
      const innerSizeClasses = !isOpen ? 'pi-h-4 pi-w-4 pi-rounded-full' : 'pi-h-8'
      const animationSizeClasses = !isOpen ? 'pi-h-6 pi-w-6' : 'pi-w-8 pi-h-8'
      const colorClasses = color === 'red' ? 'pi-bg-red-400' : 'pi-bg-green-400'
      const textColorClasses = color === 'red' ? 'pi-text-red-500' : 'pi-text-green-500'

      return (
        <div className={`${sizeClasses} pi-flex pi-justify-center pi-items-center`}>
          <div
            className={`${innerSizeClasses} pi-w-fit pi-flex pi-justify-center pi-items-center pi-gap-1 pi-overflow-hidden`}
          >
            <span
              className={`${animationSizeClasses} pi-animate-ping pi-absolute pi-inline-flex pi-rounded-full ${colorClasses} pi-opacity-75`}
            ></span>
            <FontAwesomeIcon
              className={`pi-w-4 pi-h-6 pi-rotate-45 ${textColorClasses}`}
              icon={faCircle}
            />
          </div>
        </div>
      )
    },
    [isOpen],
  )

  const callViewClasses = useMemo(() => {
    let baseClasses = 'pi-grid pi-items-center'

    if (isOpen) {
      baseClasses = 'pi-grid pi-items-start'

      if (accepted) {
        baseClasses += ' pi-grid-rows-[72px_1fr]'
      } else if (incoming) {
        baseClasses += ' pi-grid-cols-[256px_114px]'
      } else if (outgoing) {
        baseClasses += ' pi-grid-cols-[1fr_84px]'
      }
    }

    return shouldShowStreamingImage ? 'pi-flex pi-flex-col' : baseClasses
  }, [isOpen, accepted, incoming, outgoing, shouldShowStreamingImage])

  const topContentClasses = useMemo(() => {
    let columns = ''

    if (isOpen && !accepted && outgoing) {
      columns = 'pi-grid-cols-[48px_1fr]'
    } else if (isOpen && !accepted && incoming) {
      columns = 'pi-grid-cols-[48px_1fr_1px]'
    } else if (isOpen && accepted) {
      columns = 'pi-grid-cols-[48px_164px_48px]'
    } else if (!isOpen && !accepted) {
      columns = 'pi-grid-cols-[24px_102px]'
    } else {
      columns = 'pi-grid-cols-[24px_66px_24px]'
    }

    return `pi-grid ${columns} pi-gap-${isOpen ? '5' : '3'} pi-items-${isOpen ? 'start' : 'center'
      } pi-justify-center pi-w-full`
  }, [isOpen, accepted, incoming, outgoing])

  const getGridClasses = useMemo(() => {
    if (shouldShowStreamingImage) return 'pi-grid-cols-3'
    if (isAnswerVisible(outgoing, accepted)) return 'pi-grid-cols-2'
    if (accepted) return 'pi-grid-cols-1 pi-justify-items-center'
    return 'pi-grid-cols-1 pi-justify-items-end'
  }, [shouldShowStreamingImage, outgoing, accepted])

  const renderStatusIcon = useCallback(() => {
    const iconSizeClass = isOpen
      ? 'pi-relative pi-z-30 pi-h-12 pi-w-12 pi-rounded-sm pi-bg-cover'
      : 'pi-relative pi-z-30 pi-h-6 pi-w-6 pi-rounded-sm pi-bg-cover'

    if (isListen) {
      return <FontAwesomeIcon className={iconSizeClass} icon={faEarListen} />
    }

    if (isIntrude) {
      return <FontAwesomeIcon className={iconSizeClass} icon={faHandPointUp} />
    }

    if (number !== '' && hasValidUsername) {
      return <Avatar />
    }

    if (incoming && !hasValidUsername) {
      return <FontAwesomeIcon className={`${iconSizeClass} pi--rotate-45`} icon={faArrowLeft} />
    }

    if (accepted && !outgoing && !hasValidUsername) {
      return <FontAwesomeIcon className={`${iconSizeClass} pi--rotate-45`} icon={faArrowLeft} />
    }

    if (outgoing && !hasValidUsername) {
      return (
        <FontAwesomeIcon className={`${iconSizeClass} pi-rotate-[135deg]`} icon={faArrowLeft} />
      )
    }

    return null
  }, [isOpen, isListen, isIntrude, number, hasValidUsername, incoming, outgoing, accepted])

  const renderDetails = useCallback(() => {
    if (!isOpen) return null

    if (isIntrude) {
      return (
        <Details>
          <span className='pi-justify-center pi-w-fit pi-relative pi-inline-block pi-font-bold pi-text-base'>
            {t('Common.Intrude')}
            {isIntrudeExtension ? ` - ${isIntrudeExtension}` : ''}
          </span>
          {accepted ? (
            !isPhysical() ? (
              <Timer startTime={startTime} isNotAlwaysWhite />
            ) : (
              renderLandlinePhoneDiv()
            )
          ) : isIntrudeExtension ? (
            `${isIntrudeExtension}`
          ) : (
            ''
          )}
        </Details>
      )
    }

    if (isListen) {
      return (
        <Details>
          <span className='pi-justify-center pi-w-fit pi-relative pi-inline-block pi-font-bold pi-text-base'>
            {t('Common.Listen')}
            {isListenExtension ? ` - ${isListenExtension}` : ''}
          </span>
          {accepted ? (
            !isPhysical() ? (
              <Timer startTime={startTime} isNotAlwaysWhite />
            ) : (
              renderLandlinePhoneDiv()
            )
          ) : isListenExtension ? (
            `${isListenExtension}`
          ) : (
            ''
          )}
        </Details>
      )
    }

    return (
      <Details>
        <DisplayName />
        {accepted ? (
          !isPhysical() ? (
            <Timer startTime={startTime} isNotAlwaysWhite />
          ) : (
            renderLandlinePhoneDiv()
          )
        ) : (
          <Number />
        )}
      </Details>
    )
  }, [
    isOpen,
    isIntrude,
    isListen,
    accepted,
    startTime,
    isIntrudeExtension,
    isListenExtension,
    t,
    renderLandlinePhoneDiv,
  ])

  const renderAudioIndicator = useCallback(() => {
    if (accepted && isRecording) {
      return renderPulseIcon('red')
    }

    if (accepted && remoteAudioStream && !isPhysical()) {
      return (
        <AudioBars
          audioStream={remoteAudioStream}
          paused={paused}
          size={isOpen ? 'large' : 'small'}
        />
      )
    }

    if (accepted && isPhysical()) {
      return renderPulseIcon('green')
    }

    return null
  }, [accepted, isRecording, remoteAudioStream, isOpen, paused, renderPulseIcon])

  if (latestAlert !== null) {
    return null
  }

  // Initialize useDispatch
  const dispatch = useDispatch<Dispatch>()

  const setVideoStreamingAnswer = () => {
    answerIncomingCall()
    // Set view as video streaming answer with a small delay
    setTimeout(() => {
      dispatch.island.setIslandView('streamingAnswer')
    }, 100)
  }

  const renderStreamingContent = useCallback(() => {
    // Show skeleton while videoSources are loading or if streaming source number is not set yet
    if (!videoSources || Object.keys(videoSources).length === 0 || !streamingSourceNumber) {
      return <VideoStreamingSkeleton className="pi-w-full pi-h-40 pi-mt-4" />
    }

    // Find the streaming source
    const source = Object.values(videoSources).find(
      (source) => source.extension === streamingSourceNumber,
    )

    // If source doesn't exist, show empty state
    if (!source) {
      return <VideoStreamingEmptyState className="pi-w-full pi-h-40 pi-mt-4" />
    }

    // Check if image is available
    const hasImage = sourceImages[source.id] || source.image

    // If no image available, show empty state
    if (!hasImage) {
      return <VideoStreamingEmptyState className="pi-w-full pi-h-40 pi-mt-4" />
    }

    // If we have an image, show StreamingImage component
    return <StreamingImage />
  }, [streamingSourceNumber, videoSources, sourceImages])

  return (
    <div className='pi-bg-red pi-content-center pi-justify-center'>
      <div className={callViewClasses}>
        {shouldShowStreamingImage ? (
          <>
            <div className='pi-flex pi-items-center pi-justify-between'>
              <div className='pi-flex pi-items-center pi-gap-4'>
                {renderStatusIcon()}
                <div className='pi-flex pi-flex-col pi-justify-center pi-space-y-2'>
                  <DisplayName />
                  <Number />
                </div>
              </div>

              <div className='pi-flex pi-gap-2'>
                <Hangup description={t('Tooltip.Hangup')} />
                <Button
                  onClick={() => setVideoStreamingAnswer()}
                  variant='green'
                  data-tooltip-id='tooltip-answer'
                  data-tooltip-content={t('Tooltip.Answer') || ''}
                >
                  <FontAwesomeIcon className='pi-w-5 pi-h-5' icon={faPhone} />
                </Button>
                <Button
                  variant='default'
                  onClick={handleStreamingUnlock}
                  data-tooltip-id='tooltip-unlock'
                  data-tooltip-content={t('VideoStreaming.Unlock streaming') || 'Unlock streaming'}
                >
                  <FontAwesomeIcon className='pi-w-5 pi-h-5' icon={faUnlock} />
                </Button>
              </div>
            </div>

            {renderStreamingContent()}
          </>
        ) : (
          <>
            <div className={topContentClasses}>
              {renderStatusIcon()}
              {renderDetails()}

              {!isOpen && !accepted && <DisplayName />}
              {!isOpen && accepted && <Timer startTime={startTime} isNotAlwaysWhite />}

              {renderAudioIndicator()}
            </div>

            {isOpen && (
              <>
                <div className={`${!(isListen || isIntrude) ? 'pi-grid pi-gap-y-5' : ''}`}>
                  {accepted && <Actions />}
                  <div className={`pi-grid ${getGridClasses} pi-gap-3.5`}>
                    <Hangup description={t('Tooltip.Hangup and transfer')} />

                    {isAnswerVisible(outgoing, accepted) && (
                      <Button
                        onClick={answerIncomingCall}
                        variant='green'
                        data-tooltip-id='tooltip-answer-left'
                        data-tooltip-content={t('Tooltip.Answer') || ''}
                      >
                        <FontAwesomeIcon className='pi-w-6 pi-h-6' icon={faPhone} />
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
      <CustomThemedTooltip id='tooltip-answer-left' place='left' />
      <CustomThemedTooltip id='tooltip-answer' place='left' />
      <CustomThemedTooltip id='tooltip-unlock' place='left' />
    </div>
  )
}

export default memo(CallView)

export interface CallViewProps { }
