// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useRef, useEffect, useLayoutEffect, type FC } from 'react'

import {
  StyledAvatar,
  StyledDetails,
  StyledCallView,
  StyledTopContent,
} from '../../styles/Island.styles'

// Import call actions methods
import {
  muteCurrentCall,
  unmuteCurrentCall,
  pauseCurrentCall,
  unpauseCurrentCall,
} from '../../lib/phone/call'
import { motion } from 'framer-motion/dist/framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../../store'

// Import FontAwesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPause as faPauseRegular,
  faMicrophone as faMicrophoneRegular,
  faRightLeft as faRightLeftRegualar,
} from '@nethesis/nethesis-light-svg-icons'
import { faPhone, faMicrophoneSlash, faPlay } from '@nethesis/nethesis-solid-svg-icons'

// Import common components
import { Button } from '../'

// Import the CallView components
import Timer from './Timer'
import DisplayName from './DisplayName'
import { AudioBars } from '../'

import { hangupCurrentCall, answerIncomingCall } from '../../lib/phone/call'

// Import custom icons
import PhoneKeyboardLight from '../../static/icons/PhoneKeyboardLight'
import PhoneKeyboardSolid from '../../static/icons/PhoneKeyboardSolid'

const CallViewMotion = motion(StyledCallView)
const AvatarMotion = motion(StyledAvatar)
const DetailsMotion = motion(StyledDetails)

const iconVariants = {
  open: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
  },
  closed: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
  },
}

function isAnswerVisible(outgoing: boolean, accepted: boolean): boolean {
  return !outgoing && !accepted
}

/**
 * The CallView component
 */

const CallView: FC<CallViewProps> = () => {
  // Get multiple values from currentCall store
  const { incoming, accepted, outgoing, number, startTime, muted, paused, username } = useSelector(
    (state: RootState) => state.currentCall,
  )
  // Get isOpen and view from island store
  const { isOpen, view } = useSelector((state: RootState) => state.island)
  // Get avatars from avatars store
  const { avatars } = useSelector((state: RootState) => state.avatars)

  const dispatch = useDispatch<Dispatch>()

  function openKeyboard() {
    dispatch.island.setIslandView(view !== 'keyboard' ? 'keyboard' : 'call')
  }

  // Retrieve the audio stream from the webrtc store
  const { remoteAudioStream } = useSelector((state: RootState) => state.webrtc)

  return (
    <CallViewMotion
      incoming={incoming}
      accepted={accepted}
      outgoing={outgoing}
      isOpen={isOpen}
    >
      <StyledTopContent isOpen={isOpen} incoming={incoming} accepted={accepted} outgoing={outgoing}>
        <motion.div
          className='relative'
          animate={isOpen ? 'open' : 'closed'}
          variants={iconVariants}
        >
          {(incoming || (outgoing && !accepted)) && (
            // The background pulse effect
            <motion.div
              style={{
                animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                borderRadius: '4px',
              }}
              animate={isOpen ? 'open' : 'closed'}
              variants={iconVariants}
              className={`rounded-xl bg-white absolute opacity-60 -z-10 top-0 left-0 animate-ping h-12 w-12`}
            ></motion.div>
          )}
          <AvatarMotion
            className='z-10 h-12 w-12 bg-gray-300 rounded-sm'
            style={{
              backgroundImage: `url(${avatars && avatars[username] && avatars[username]})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
            }}
            animate={isOpen ? 'open' : 'closed'}
            variants={iconVariants}
          />
        </motion.div>
        {isOpen && (
          <DetailsMotion>
            <DisplayName />
            {/* The timer when expanded */}
            <Timer />
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
          {accepted && (
            <div className='grid grid-cols-4 auto-cols-max gap-y-5 justify-items-center place-items-center justify-center'>
              <Button
                variant='default'
                active={paused ? true : false}
                onClick={() => (paused ? unpauseCurrentCall() : pauseCurrentCall())}
              >
                {paused ? (
                  <FontAwesomeIcon size='xl' icon={faPlay} />
                ) : (
                  <FontAwesomeIcon size='xl' icon={faPauseRegular} />
                )}
              </Button>
              <Button
                variant='default'
                active={muted ? true : false}
                onClick={() => (muted ? unmuteCurrentCall() : muteCurrentCall())}
              >
                {muted ? (
                  <FontAwesomeIcon size='xl' icon={faMicrophoneSlash} />
                ) : (
                  <FontAwesomeIcon size='xl' icon={faMicrophoneRegular} />
                )}
              </Button>
              <Button variant='default'>
                <FontAwesomeIcon size='xl' icon={faRightLeftRegualar} />
              </Button>
              <Button variant='default' onClick={openKeyboard}>
                {view === 'keyboard' ? <PhoneKeyboardSolid /> : <PhoneKeyboardLight />}
              </Button>
            </div>
          )}
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
