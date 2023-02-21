// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { StyledDetails, StyledCallView, StyledTopContent } from '../../styles/Island.styles'
import { motion } from 'framer-motion/dist/framer-motion'
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

const CallViewMotion = motion(StyledCallView)
const DetailsMotion = motion(StyledDetails)

function isAnswerVisible(outgoing: boolean, accepted: boolean): boolean {
  return !outgoing && !accepted
}

/**
 * The CallView component
 */
const CallView: FC<CallViewProps> = () => {
  // Get multiple values from currentCall store
  const { incoming, accepted, outgoing } = useSelector((state: RootState) => state.currentCall)
  // Get isOpen and view from island store
  const { isOpen } = useSelector((state: RootState) => state.island)

  // Retrieve the audio stream from the webrtc store
  const { remoteAudioStream } = useSelector((state: RootState) => state.webrtc)

  return (
    <CallViewMotion incoming={incoming} accepted={accepted} outgoing={outgoing} isOpen={isOpen}>
      <StyledTopContent isOpen={isOpen} incoming={incoming} accepted={accepted} outgoing={outgoing}>
        <Avatar />
        {isOpen && (
          <DetailsMotion>
            <DisplayName />
            {/* The timer when expanded */}
            {accepted ? <Timer /> : <Number />}
          </DetailsMotion>
        )}
        {/* The display name when collepsed */}
        {!isOpen && !accepted && <DisplayName />}
        {/* The timer when collapsed */}
        {!isOpen && accepted && <Timer />}
        {accepted && remoteAudioStream && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AudioBars audioStream={remoteAudioStream} size={isOpen ? 'large' : 'small'} />
          </motion.div>
        )}
      </StyledTopContent>
      {isOpen && (
        <motion.div className='grid gap-y-5' initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {accepted && <Actions />}
          <motion.div
            className={`grid ${
              isAnswerVisible(outgoing, accepted)
                ? 'grid-cols-2'
                : accepted
                ? 'grid-cols-1 justify-items-center'
                : 'grid-cols-1 justify-items-end'
            } gap-3.5`}
            animate={{ opacity: 1 }}
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
          </motion.div>
        </motion.div>
      )}
    </CallViewMotion>
  )
}

export default CallView

export interface CallViewProps {}
