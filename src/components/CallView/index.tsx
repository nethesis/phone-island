// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { StyledDetails, StyledCallView, StyledTopContent } from '../../styles/Island.styles'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhone } from '@nethesis/nethesis-solid-svg-icons'
import { Button } from '../'
import Timer from './Timer'
import Number from './Number'
import DisplayName from './DisplayName'
import { AudioBars } from '../'
import { hangupCurrentCall, answerIncomingCall } from '../../lib/phone/call'
import Avatar from './Avatar'
import Actions from './Actions'

function isAnswerVisible(outgoing: boolean, accepted: boolean): boolean {
  return !outgoing && !accepted
}

/**
 * The main view to manage calls, the starting point for calls actions flows
 */
const CallView: FC<CallViewProps> = () => {
  // Get multiple values from currentCall store
  const { incoming, accepted, outgoing } = useSelector((state: RootState) => state.currentCall)
  // Get isOpen and view from island store
  const { isOpen } = useSelector((state: RootState) => state.island)

  // Retrieve the audio stream from the webrtc store
  const { remoteAudioStream } = useSelector((state: RootState) => state.webrtc)

  return (
    <StyledCallView incoming={incoming} accepted={accepted} outgoing={outgoing} isOpen={isOpen}>
      <StyledTopContent isOpen={isOpen} incoming={incoming} accepted={accepted} outgoing={outgoing}>
        <Avatar />
        {isOpen && (
          <StyledDetails>
            <DisplayName />
            {/* The timer when expanded */}
            {accepted ? <Timer /> : <Number />}
          </StyledDetails>
        )}
        {/* The display name when collepsed */}
        {!isOpen && !accepted && <DisplayName />}
        {/* The timer when collapsed */}
        {!isOpen && accepted && <Timer />}
        {accepted && remoteAudioStream && (
          <AudioBars audioStream={remoteAudioStream} size={isOpen ? 'large' : 'small'} />
        )}
      </StyledTopContent>
      {isOpen && (
        <div className='grid gap-y-5'>
          {accepted && <Actions />}
          <div
            className={`grid ${
              isAnswerVisible(outgoing, accepted)
                ? 'grid-cols-2'
                : accepted
                ? 'grid-cols-1 justify-items-center'
                : 'grid-cols-1 justify-items-end'
            } gap-3.5`}
          >
            {/* The button to hangup the currentCall */}
            <Button onClick={hangupCurrentCall} variant='red'>
              <FontAwesomeIcon className='rotate-135 w-6 h-6' icon={faPhone} />
            </Button>
            {/* The button to answer the incoming call */}
            {isAnswerVisible(outgoing, accepted) && (
              <Button onClick={answerIncomingCall} variant='green'>
                <FontAwesomeIcon className='w-6 h-6' icon={faPhone} />
              </Button>
            )}
          </div>
        </div>
      )}
    </StyledCallView>
  )
}

export default CallView

export interface CallViewProps {}
