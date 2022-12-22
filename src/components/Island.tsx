// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useRef, useEffect } from 'react'
import {
  StyledAlbumArtThumb,
  StyledArtistDetails,
  StyledArtistName,
  StyledDynamicIsland,
  StyledDynamicIslandTopContent,
  StyledMusicIcon,
  StyledMusicIconBar,
  StyledPlayBar,
  StyledPlayBarWrapper,
  StyledSongControls,
  StyledSongControlsWrappers,
  StyledSongName,
} from '../styles/Island.styles'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBackward,
  faPause,
  faForward,
  faCompactDisc,
  faPhone,
  faMicrophone,
  faRightLeft,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons'
import { motion, useDragControls, useAnimation } from 'framer-motion/dist/framer-motion'
import { hangupCurrentCall, answerIncomingCall } from '../lib/phone/call'
import { useLongPress } from '../utils/useLongPress'
import Moment from 'react-moment'
import { useLocalStorage } from '../utils/useLocalStorage'

import { AudioBars } from './AudioBars'

import { getTranslateValues } from '../utils/getTranslate'
import { Button } from './Button'

const StyledDynamicIslandMotion = motion(StyledDynamicIsland)
const StyledMusicIconBarMotion = motion(StyledMusicIconBar)
const StyledMusicAlbumArtThumbMotion = motion(StyledAlbumArtThumb)
const StyledMusicIconMotion = motion(StyledMusicIcon)
const StyledArtistDetailsMotion = motion(StyledArtistDetails)

interface IslandProps {
  always?: boolean
}

interface PositionTypes {
  x: number
  y: number
}

interface PhoneIslandStorageTypes {
  position: PositionTypes
}

const ISLAND_STARTING_POSITION = {
  x: 0,
  y: 0,
}

export const Island = ({ always }: IslandProps) => {
  const [isOpen, setIsOpen] = useState(true)
  const { incoming, accepted, outgoing, displayName, number, startTime } = useSelector(
    // ADD ACCEPTED
    (state: RootState) => state.currentCall,
  )

  const { audio } = useSelector(
    // ADD ACCEPTED
    (state: RootState) => state.player,
  )
  const controls = useDragControls()

  const [phoneIslandStorage, setPhoneIslandStorage] =
    useLocalStorage<PhoneIslandStorageTypes | null>('phone-island', null)

  const islandRef = useRef<any>(null)

  const islandContainerRef = useRef<any>(null)

  const [position, setPosition] = useState<PositionTypes | null>(
    phoneIslandStorage && phoneIslandStorage.position ? phoneIslandStorage.position : null,
  )

  const [moved, setMoved] = useState<boolean>(false)

  function isAnswerVisible() {
    return !outgoing && !accepted
  }

  function startDrag(event) {
    controls.start(event)
  }

  function handleAnswer(event) {
    answerIncomingCall()
  }

  function handleHangup(event) {
    event.stopPropagation()
    hangupCurrentCall()
  }

  const onLongPress = () => {
    console.log('long press trigger')
  }

  const islandClick = () => {
    setIsOpen(!isOpen)
  }

  function innerXPosition(x) {
    // Get horizontal constraints
    const xConstraintPosition =
      islandContainerRef.current.offsetWidth / 2 - islandRef.current.offsetWidth / 2

    // Return the X position inside the constraints
    return x > 0 && x > xConstraintPosition
      ? xConstraintPosition
      : x < 0 && x < -xConstraintPosition
      ? -xConstraintPosition
      : x
  }

  function innerYPosition(y) {
    // Get vertical constraints
    const yConstraintPosition =
      islandContainerRef.current.offsetHeight / 2 - islandRef.current.offsetHeight / 2

    // Return the Y position inside the constraints
    return y > 0 && y > yConstraintPosition
      ? yConstraintPosition
      : y < 0 && y < -yConstraintPosition
      ? -yConstraintPosition
      : y
  }

  const onDragEnd = () => {
    // Get initial translation values
    let { x, y }: any = getTranslateValues(islandRef.current)

    // Round position
    x = innerXPosition(Math.round(x))
    y = innerYPosition(Math.round(y))

    // Save the new position to localstorage
    setPhoneIslandStorage({
      position: {
        x,
        y,
      },
    })
    // Set position to variable
    setPosition({
      x,
      y,
    })
  }

  function resetMoved() {
    setMoved(false)
  }

  function dragStarted() {
    setMoved(true)
  }

  const longPressEvent = useLongPress(onLongPress, islandClick, moved, resetMoved, {
    shouldPreventDefault: true,
    delay: 250,
  })

  const variants = {
    openIncoming: {
      width: '418px',
      height: '96px',
      borderRadius: '20px',
    },
    openAccepted: {
      width: '348px',
      height: '236px',
      borderRadius: '20px',
    },
    closed: {
      width: '156px',
      height: '36px',
      borderRadius: '999px',
    },
  }

  const iconVariants = {
    open: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      margin: '0 auto',
    },
    closed: {
      width: '20px',
      height: '20px',
      borderRadius: '4px',
    },
  }

  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    const audioStreamListener = audio?.addEventListener('play', () => {
      if (navigator.userAgent.indexOf('Firefox') > -1) {
        // @ts-ignore
        setAudioStream(audio.mozCaptureStream())
      } else {
        // @ts-ignore
        setAudioStream(audio.captureStream())
      }
    })

    return () => {
      // @ts-ignore
      audio?.removeEventListener('play', audioStreamListener)
    }
  }, [audio])

  return (
    <div
      ref={islandContainerRef}
      className='absolute min-w-full min-h-full left-0 top-0 overflow-hidden pointer-events-none flex items-center justify-center content-center phone-island-container z-1000'
    >
      {/* <div className='bg-black h-72 w-72 flex justify-center '>
        <AudioBars audioStream={audioStream} />
      </div> */}

      {(incoming || outgoing || accepted || always) && (
        <StyledDynamicIslandMotion
          className='font-sans absolute pointer-events-auto'
          incoming={incoming}
          accepted={accepted}
          outgoing={outgoing}
          isOpen={isOpen}
          animate={
            isOpen && (incoming || outgoing) && !accepted
              ? 'openIncoming'
              : isOpen && accepted
              ? 'openAccepted'
              : 'closed'
          }
          variants={variants}
          drag
          onPointerDown={startDrag}
          onDragStart={dragStarted}
          dragTransition={{
            power: 0,
          }}
          initial={{
            x: position?.x || ISLAND_STARTING_POSITION.x,
            y: position?.y || ISLAND_STARTING_POSITION.y,
          }}
          style={{
            padding: isOpen ? '24px' : '8px 16px',
          }}
          dragControls={controls}
          dragConstraints={islandContainerRef}
          onDragEnd={onDragEnd}
          ref={islandRef}
          {...longPressEvent}
        >
          <StyledDynamicIslandTopContent
            isOpen={isOpen}
            incoming={incoming}
            accepted={accepted}
            outgoing={outgoing}
          >
            <div className='relative w-12 h-12'>
              {(incoming || outgoing) && (
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
              <StyledMusicAlbumArtThumbMotion
                className='z-10 h-12 w-12'
                animate={isOpen ? 'open' : 'closed'}
                variants={iconVariants}
                src='https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80'
              />
            </div>
            <div>
              {isOpen && (
                <StyledArtistDetailsMotion initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <StyledSongName>{displayName && displayName}</StyledSongName>
                  <StyledArtistName>
                    {accepted ? (
                      <Moment
                        date={startTime}
                        interval={1000}
                        format='hh:mm:ss'
                        trim='mid'
                        unix
                        durationFromNow
                      />
                    ) : (
                      <>{number && number}</>
                    )}
                  </StyledArtistName>
                </StyledArtistDetailsMotion>
              )}
            </div>
            {accepted && <AudioBars audioStream={audioStream} />}
            {/* <StyledMusicIconMotion animate={{ opacity: isOpen ? [0, 1] : 1 }}>
              <StyledMusicIconBarMotion
                initial={{ height: '0' }}
                animate={{ height: '100%' }}
                transition={{ duration: 1, delay: 0.5, repeat: Infinity }}
              />
              <StyledMusicIconBarMotion
                initial={{ height: '0' }}
                animate={{ height: '100%' }}
                transition={{ duration: 1, delay: 0.75, repeat: Infinity }}
              />
              <StyledMusicIconBarMotion
                initial={{ height: '0' }}
                animate={{ height: '75%' }}
                transition={{ duration: 1, delay: 0.3, repeat: Infinity }}
              />
            </StyledMusicIconMotion> */}
          </StyledDynamicIslandTopContent>
          {isOpen && (
            <div className='grid gap-y-5'>
              {/* <StyledPlayBarWrapper>
                <span>2:30</span>
                <StyledPlayBar />
                <span>-1:35</span>
              </StyledPlayBarWrapper>
              <StyledSongControlsWrappers>
                <StyledSongControls>
                  <FontAwesomeIcon size='2x' icon={faBackward} />
                  <FontAwesomeIcon size='3x' icon={faPause} />
                  <FontAwesomeIcon size='2x' icon={faForward} />
                </StyledSongControls>
                <div>
                  <FontAwesomeIcon size='2x' icon={faCompactDisc} />
                </div>
              </StyledSongControlsWrappers> */}
              {accepted && (
                <div className='grid grid-cols-4 auto-cols-max gap-y-5 justify-items-center place-items-center justify-center'>
                  <Button variant='default'>
                    <FontAwesomeIcon size='xl' icon={faPause} />
                  </Button>
                  <Button variant='default'>
                    <FontAwesomeIcon size='xl' icon={faMicrophone} />
                  </Button>
                  <Button variant='default'>
                    <FontAwesomeIcon size='xl' icon={faRightLeft} />
                  </Button>
                  <Button variant='neutral'>
                    <FontAwesomeIcon size='xl' icon={faChevronDown} />
                  </Button>
                </div>
              )}
              <motion.div
                className={`grid ${
                  isAnswerVisible()
                    ? 'grid-cols-2'
                    : accepted
                    ? 'grid-cols-1 justify-items-center'
                    : 'grid-cols-1 justify-items-end'
                } gap-3.5`}
                animate={{ opacity: 1 }}
              >
                <Button onClick={handleHangup} variant='red'>
                  <FontAwesomeIcon className='rotate-135' size='2x' icon={faPhone} />
                </Button>
                {isAnswerVisible() && (
                  <Button onClick={handleAnswer} variant='green'>
                    <FontAwesomeIcon size='2x' icon={faPhone} />
                  </Button>
                )}
              </motion.div>
            </div>
          )}
        </StyledDynamicIslandMotion>
      )}
      <audio id='audio' className='hidden' autoPlay></audio>
      <video id='localVideo' className='hidden' muted={true} autoPlay></video>
      <video id='remoteVideo' className='hidden' autoPlay></video>
    </div>
  )
}

Island.displayName = 'Island'
