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
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBackward,
  faPause,
  faForward,
  faCompactDisc,
  faPhone,
  faMicrophone,
  faMicrophoneSlash,
  faChevronDown,
  faPlay,
  faChevronUp,
} from '@nethesis/nethesis-solid-svg-icons'
import { motion, useDragControls, useAnimation } from 'framer-motion/dist/framer-motion'
import { useLongPress } from '../utils/useLongPress'
import Moment from 'react-moment'
import { useLocalStorage, getTranslateValues } from '../utils'
import { AudioBars } from './AudioBars'
import { Button } from './Button'
import {
  hangupCurrentCall,
  answerIncomingCall,
  muteCurrentCall,
  unmuteCurrentCall,
  pauseCurrentCall,
  unpauseCurrentCall,
} from '../lib/phone/call'
import {
  faPause as faPauseRegular,
  faMicrophone as faMicrophoneRegular,
  faRightLeft as faRightLeftRegualar,
  faChevronDown as faChevronDownRegular,
} from '@nethesis/nethesis-regular-svg-icons'

const StyledDynamicIslandMotion = motion(StyledDynamicIsland)
const StyledMusicIconBarMotion = motion(StyledMusicIconBar)
const StyledMusicAlbumArtThumbMotion = motion(StyledAlbumArtThumb)
const StyledMusicIconMotion = motion(StyledMusicIcon)
const StyledArtistDetailsMotion = motion(StyledArtistDetails)

import { useIsomorphicLayoutEffect } from '../utils'

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
  // Get the currentCall info
  const { incoming, accepted, outgoing, displayName, number, startTime, muted, paused } =
    useSelector((state: RootState) => state.currentCall)

  const { localAudio: storeLocalAudio, remoteAudio: storeRemoteAudio } = useSelector(
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

  const dispatch = useDispatch()

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
      borderRadius: '99px',
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
    function audioStreamListener() {
      storeRemoteAudio?.addEventListener('play', () => {
        if (navigator.userAgent.indexOf('Firefox') > -1) {
          // @ts-ignore
          setAudioStream(storeRemoteAudio.mozCaptureStream())
        } else {
          // @ts-ignore
          setAudioStream(storeRemoteAudio.captureStream())
        }
      })
    }
    audioStreamListener()
    return () => {
      storeRemoteAudio?.removeEventListener('play', audioStreamListener)
    }
  }, [storeRemoteAudio])

  const localAudio = useRef<HTMLAudioElement>(null)
  const remoteAudio = useRef<HTMLAudioElement>(null)
  const localVideo = useRef<HTMLVideoElement>(null)
  const remoteVideo = useRef<HTMLVideoElement>(null)

  useIsomorphicLayoutEffect(() => {
    dispatch.player.updatePlayer({
      localAudio: localAudio.current,
      localVideo: localVideo.current,
      remoteVideo: remoteVideo.current,
      remoteAudio: remoteAudio.current,
    })
  }, [])

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
          className='font-sans absolute pointer-events-auto overflow-hidden'
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
              {(incoming || (outgoing && !accepted)) && (
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
                className='z-10 h-12 w-12 bg-gray-300 rounded-sm'
                animate={isOpen ? 'open' : 'closed'}
                variants={iconVariants}
              />
            </div>
            <div>
              {isOpen && (
                <StyledArtistDetailsMotion initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <StyledSongName>{displayName && displayName}</StyledSongName>
                  <StyledArtistName>
                    {accepted ? (
                      <Moment
                        date={startTime || new Date().getTime() / 1000}
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
            {accepted && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <AudioBars audioStream={audioStream} />
              </motion.div>
            )}
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
            <motion.div className='grid gap-y-5' initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
                  <Button variant='neutral'>
                    <FontAwesomeIcon size='xl' icon={faChevronDownRegular} />
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
                  <FontAwesomeIcon className='rotate-135 w-6 h-6' icon={faPhone} />
                </Button>
                {isAnswerVisible() && (
                  <Button onClick={handleAnswer} variant='green'>
                    <FontAwesomeIcon className='w-6 h-6' icon={faPhone} />
                  </Button>
                )}
              </motion.div>
            </motion.div>
          )}
        </StyledDynamicIslandMotion>
      )}
      <div className='hidden'>
        <audio autoPlay ref={localAudio}></audio>
        <audio autoPlay ref={remoteAudio}></audio>
        <video muted={true} autoPlay ref={localVideo}></video>
        <video autoPlay ref={remoteVideo}></video>
      </div>
    </div>
  )
}

Island.displayName = 'Island'
