// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { StyledDetails, StyledCallView, StyledTopContent } from '../../styles/Island.styles'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhone, faEarListen, faHandPointUp } from '@fortawesome/free-solid-svg-icons'
import { Button } from '../'
import Timer from './Timer'
import Number from './Number'
import DisplayName from './DisplayName'
import { AudioBars } from '../'
import { answerIncomingCall } from '../../lib/phone/call'
import Avatar from './Avatar'
import Actions from './Actions'
import Hangup from '../Hangup'

function isAnswerVisible(outgoing: boolean, accepted: boolean): boolean {
  return !outgoing && !accepted
}

/**
 * The main view to manage calls, the starting point for calls actions flows
 */
const CallView: FC<CallViewProps> = () => {
  // Get multiple values from currentCall state
  const { incoming, accepted, outgoing, startTime, paused } = useSelector(
    (state: RootState) => state.currentCall,
  )
  // Get isOpen and view from island state
  const { isOpen } = useSelector((state: RootState) => state.island)

  // Retrieve the audio stream from the webrtc state
  const { remoteAudioStream } = useSelector((state: RootState) => state.webrtc)

  const intrudeListenStatus = useSelector((state: RootState) => state.listen)

  return (
    <div className='pi-bg-red pi-content-center pi-justify-center'>
      <StyledCallView incoming={incoming} accepted={accepted} outgoing={outgoing} isOpen={isOpen}>
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
          ) : (
            <Avatar />
          )}
          {isOpen ? (
            intrudeListenStatus?.isIntrude ? (
              <StyledDetails>
                <span className='pi-justify-center pi-w-fit pi-relative pi-inline-block pi-font-bold pi-text-base'>
                  {' '}
                  Intrude
                  {intrudeListenStatus?.isIntrudeExtension
                    ? ` - ${intrudeListenStatus?.isIntrudeExtension}`
                    : ''}
                </span>
                {accepted ? (
                  <Timer startTime={startTime} />
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
                  Listen
                  {intrudeListenStatus?.isListenExtension
                    ? ` - ${intrudeListenStatus?.isListenExtension}`
                    : ''}
                </span>
                {accepted ? (
                  <Timer startTime={startTime} />
                ) : intrudeListenStatus?.isListenExtension ? (
                  `${intrudeListenStatus?.isListenExtension}`
                ) : (
                  ''
                )}{' '}
              </StyledDetails>
            ) : (
              <StyledDetails>
                <DisplayName />
                {accepted ? <Timer startTime={startTime} /> : <Number />}
              </StyledDetails>
            )
          ) : null}
          {/* The display name when collepsed */}
          {!isOpen && !accepted && <DisplayName />}
          {/* The timer when collapsed */}
          {!isOpen && accepted && <Timer startTime={startTime} />}
          {accepted && remoteAudioStream && (
            <AudioBars
              audioStream={remoteAudioStream}
              paused={paused}
              size={isOpen ? 'large' : 'small'}
            />
          )}
        </StyledTopContent>
        {isOpen && (
          <div className='pi-grid pi-gap-y-5'>
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
              <Hangup description='Hangup and transfer' />
              {/* )} */}
              {/* The button to answer the incoming call */}
              {isAnswerVisible(outgoing, accepted) && (
                <Button onClick={answerIncomingCall} variant='green'>
                  <FontAwesomeIcon className='pi-w-6 pi-h-6' icon={faPhone} />
                </Button>
              )}
            </div>
          </div>
        )}
      </StyledCallView>
    </div>
  )
}

export default CallView

export interface CallViewProps {}
