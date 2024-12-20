// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { StyledDetails, StyledCallView, StyledTopContent } from '../../styles/Island.styles'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPhone,
  faEarListen,
  faHandPointUp,
  faArrowLeft,
  faCircle,
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
import { Tooltip } from 'react-tooltip'

function isAnswerVisible(outgoing: boolean, accepted: boolean): boolean {
  return !outgoing && !accepted
}

/**
 * The main view to manage calls, the starting point for calls actions flows
 */
const CallView: FC<CallViewProps> = () => {
  // Get multiple values from currentCall state
  const { incoming, accepted, outgoing, startTime, paused, number, isRecording } = useSelector(
    (state: RootState) => state.currentCall,
  )

  const currentCallDetails: any = useSelector((state: RootState) => state.currentCall)
  // Get isOpen and view from island state
  const { isOpen } = useSelector((state: RootState) => state.island)

  // Retrieve the audio stream from the webrtc state
  const { remoteAudioStream } = useSelector((state: RootState) => state.webrtc)

  const intrudeListenStatus = useSelector((state: RootState) => state.listen)
  const { isListen, isIntrude } = useSelector((state: RootState) => state.listen)
  const { data } = useSelector((state: RootState) => state.alerts)

  const { t } = useTranslation()
  const activeAlerts = Object.values(data).filter((alert: any) => alert.active)
  const latestAlert = activeAlerts.length > 0 ? activeAlerts[activeAlerts.length - 1] : null

  return (
    <>
    {/* Avoid alert message and incoming call message for slow connections */}
      {latestAlert !== null ? null : (
        <div className='pi-bg-red pi-content-center pi-justify-center'>
          <StyledCallView
            incoming={incoming}
            accepted={accepted}
            outgoing={outgoing}
            isOpen={isOpen}
          >
            <StyledTopContent
              isOpen={isOpen}
              incoming={incoming}
              accepted={accepted}
              outgoing={outgoing}
            >
              {intrudeListenStatus?.isListen ? (
                <FontAwesomeIcon
                  className={`${
                    isOpen
                      ? 'pi-relative pi-z-30 pi-h-12 pi-w-12 pi-rounded-sm pi-bg-cover'
                      : 'pi-relative pi-z-30 pi-h-6 pi-w-6 pi-rounded-sm pi-bg-cover'
                  }`}
                  icon={faEarListen}
                />
              ) : intrudeListenStatus?.isIntrude ? (
                <FontAwesomeIcon
                  // className='pi-relative pi-z-30 pi-h-12 pi-w-12 pi-rounded-sm pi-bg-cover'
                  className={`${
                    isOpen
                      ? 'pi-relative pi-z-30 pi-h-12 pi-w-12 pi-rounded-sm pi-bg-cover'
                      : 'pi-relative pi-z-30 pi-h-6 pi-w-6 pi-rounded-sm pi-bg-cover'
                  }`}
                  icon={faHandPointUp}
                />
              ) : number !== '' &&
                currentCallDetails?.username !== '' &&
                currentCallDetails?.username !== 'undefined' ? (
                <Avatar />
              ) : incoming &&
                (currentCallDetails?.username === '' ||
                  currentCallDetails?.username === 'undefined') ? (
                <FontAwesomeIcon
                  // className='pi-relative pi-z-30 pi-h-12 pi-w-12 pi-rounded-sm pi-bg-cover'
                  className={`${
                    isOpen
                      ? 'pi-relative pi-z-30 pi-h-12 pi-w-12 pi-rounded-sm pi-bg-cover pi--rotate-45'
                      : 'pi-relative pi-z-30 pi-h-6 pi-w-6 pi-rounded-sm pi-bg-cover pi--rotate-45'
                  }`}
                  icon={faArrowLeft}
                />
              ) : accepted &&
                !outgoing &&
                (currentCallDetails?.username === '' ||
                  currentCallDetails?.username === 'undefined') ? (
                <FontAwesomeIcon
                  // className='pi-relative pi-z-30 pi-h-12 pi-w-12 pi-rounded-sm pi-bg-cover'
                  className={`${
                    isOpen
                      ? 'pi-relative pi-z-30 pi-h-12 pi-w-12 pi-rounded-sm pi-bg-cover pi--rotate-45'
                      : 'pi-relative pi-z-30 pi-h-6 pi-w-6 pi-rounded-sm pi-bg-cover pi--rotate-45'
                  }`}
                  icon={faArrowLeft}
                />
              ) : outgoing &&
                (currentCallDetails?.username === '' ||
                  currentCallDetails?.username === 'undefined') ? (
                // set a loading avatar when the call is not attached to a user
                <FontAwesomeIcon
                  className={`${
                    isOpen
                      ? 'pi-relative pi-z-30 pi-h-12 pi-w-12 pi-rounded-sm pi-bg-cover pi-rotate-[135deg]'
                      : 'pi-relative pi-z-30 pi-h-6 pi-w-6 pi-rounded-sm pi-bg-cover pi-rotate-[135deg]'
                  }`}
                  icon={faArrowLeft}
                />
              ) : outgoing &&
                accepted &&
                (currentCallDetails?.username === '' ||
                  currentCallDetails?.username === 'undefined') ? (
                // set a loading avatar when the call is not attached to a user
                <FontAwesomeIcon
                  className={`${
                    isOpen
                      ? 'pi-relative pi-z-30 pi-h-12 pi-w-12 pi-rounded-sm pi-bg-cover pi-rotate-[135deg]'
                      : 'pi-relative pi-z-30 pi-h-6 pi-w-6 pi-rounded-sm pi-bg-cover pi-rotate-[135deg]'
                  }`}
                  icon={faArrowLeft}
                />
              ) : (
                <></>
              )}
              {isOpen ? (
                intrudeListenStatus?.isIntrude ? (
                  <StyledDetails>
                    <span className='pi-justify-center pi-w-fit pi-relative pi-inline-block pi-font-bold pi-text-base'>
                      {' '}
                      {t('Common.Intrude')}
                      {intrudeListenStatus?.isIntrudeExtension
                        ? ` - ${intrudeListenStatus?.isIntrudeExtension}`
                        : ''}
                    </span>
                    {accepted ? (
                      <Timer startTime={startTime} isHome />
                    ) : intrudeListenStatus?.isIntrudeExtension ? (
                      `${intrudeListenStatus?.isIntrudeExtension}`
                    ) : (
                      ''
                    )}
                  </StyledDetails>
                ) : intrudeListenStatus?.isListen ? (
                  <StyledDetails>
                    <span className='pi-justify-center pi-w-fit pi-relative pi-inline-block pi-font-bold pi-text-base'>
                      {' '}
                      {t('Common.Listen')}
                      {intrudeListenStatus?.isListenExtension
                        ? ` - ${intrudeListenStatus?.isListenExtension}`
                        : ''}
                    </span>
                    {accepted ? (
                      <Timer startTime={startTime} isHome />
                    ) : intrudeListenStatus?.isListenExtension ? (
                      `${intrudeListenStatus?.isListenExtension}`
                    ) : (
                      ''
                    )}{' '}
                  </StyledDetails>
                ) : (
                  <StyledDetails>
                    <DisplayName />
                    {accepted ? <Timer startTime={startTime} isHome /> : <Number />}
                  </StyledDetails>
                )
              ) : null}
              {/* The display name when collepsed */}
              {!isOpen && !accepted && <DisplayName />}
              {/* The timer when collapsed */}
              {!isOpen && accepted && <Timer startTime={startTime} isHome />}
              {accepted && isRecording ? (
                <>
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
                </>
              ) : accepted && remoteAudioStream ? (
                <>
                  <AudioBars
                    audioStream={remoteAudioStream}
                    paused={paused}
                    size={isOpen ? 'large' : 'small'}
                  />
                </>
              ) : (
                <></>
              )}
            </StyledTopContent>
            {isOpen && (
              <div className={`${!(isListen || isIntrude) ? 'pi-grid pi-gap-y-5' : ''} `}>
                {accepted && <Actions />}
                <div
                  className={`pi-grid ${
                    isAnswerVisible(outgoing, accepted)
                      ? 'pi-grid-cols-2'
                      : accepted
                      ? 'pi-grid-cols-1 pi-justify-items-center'
                      : 'pi-grid-cols-1 pi-justify-items-end'
                  } pi-gap-3.5`}
                >
                  {/* The button to hangup the currentCall */}
                  {/* {incoming || outgoing ? (
            <Button onClick={hangupCurrentCall} variant='red'>
              <FontAwesomeIcon className='pi-rotate-135 pi-w-6 pi-h-6' icon={faPhone} />
            </Button>
          ) : ( */}
                  <Hangup description={t('Tooltip.Hangup and transfer')} />
                  {/* )} */}
                  {/* The button to answer the incoming call */}
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
            )}
          </StyledCallView>
          <Tooltip className='pi-z-20' id='tooltip-answer-left' place='left' />
        </div>
      )}
    </>
  )
}

export default CallView

export interface CallViewProps {}
