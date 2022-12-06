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
} from '@fortawesome/free-solid-svg-icons'
import { motion, useDragControls, useTransform } from 'framer-motion/dist/framer-motion'
import { hangupCurrentCall, answerIncomingCall } from '../lib/phone/call'
import { useLongPress } from '../utils/useLongPress'
import Moment from 'react-moment'
import { useLocalStorage } from '../utils/useLocalStorage'

import { getTranslateValues } from '../utils/getTranslate'

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

const OPENED_ISLAND_PADDING = 24
const OPENED_ISLAND_WIDTH = 300
const ISLAND_STARTING_POSITION = {
  x: 0,
  y: 0,
}

const variants = {
  open: {
    width: `${OPENED_ISLAND_WIDTH}px`,
    height: 'auto',
    borderRadius: '20px',
  },
  closed: {
    width: '96px',
    height: '12px',
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
    width: '12px',
    height: '12px',
    borderRadius: '4px',
  },
}

export const Island = ({ always }: IslandProps) => {
  const [isOpen, setIsOpen] = useState(true)
  const { incoming, accepted, outgoing, displayName, number, startTime } = useSelector(
    (state: RootState) => state.currentCall,
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

  return (
    <div
      ref={islandContainerRef}
      className='absolute min-w-full min-h-full left-0 top-0 overflow-hidden pointer-events-none flex items-center justify-center content-center'
    >
      {(incoming || outgoing || accepted || always) && (
        <StyledDynamicIslandMotion
          className='font-sans absolute pointer-events-auto'
          isOpen={isOpen}
          openedIslandPadding={OPENED_ISLAND_PADDING}
          animate={isOpen ? 'open' : 'closed'}
          variants={variants}
          accepted={accepted}
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
          dragControls={controls}
          dragConstraints={islandContainerRef}
          onDragEnd={onDragEnd}
          ref={islandRef}
          {...longPressEvent}
        >
          <StyledDynamicIslandTopContent isOpen={isOpen}>
            <StyledMusicAlbumArtThumbMotion
              animate={isOpen ? 'open' : 'closed'}
              variants={iconVariants}
              src='https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80'
            />
            <div>
              {isOpen && (
                <StyledArtistDetailsMotion initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <StyledSongName>{displayName && displayName}</StyledSongName>
                  <StyledArtistName>{number && number}</StyledArtistName>
                </StyledArtistDetailsMotion>
              )}
            </div>
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
          {accepted && isOpen && (
            <>
              <div className='text-white justify-center items-center w-full text-center'>
                <Moment
                  date={startTime}
                  interval={1000}
                  format='hh:mm:ss'
                  trim
                  unix
                  durationFromNow
                />
              </div>
            </>
          )}
          {isOpen && (
            <>
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
              <div className={`flex ${isAnswerVisible() ? 'justify-between' : 'justify-around'}`}>
                <button
                  onClick={handleHangup}
                  data-stop-propagation={true}
                  className='flex content-center items-center justify-center font-medium tracking-wide transition-colors duration-200 transform focus:outline-none focus:ring-2 focus:z-20 focus:ring-offset-2 disabled:opacity-75 bg-red-600 text-white border border-transparent hover:bg-red-700 focus:ring-red-500 focus:ring-offset-black rounded-full p-2.5 text-sm leading-4 no-propagation'
                >
                  <FontAwesomeIcon className='rotate-135 no-propagation' size='2x' icon={faPhone} />
                </button>
                {isAnswerVisible() && (
                  <button
                    onClick={handleAnswer}
                    data-stop-propagation={true}
                    className='flex content-center items-center justify-center font-medium tracking-wide transition-colors duration-200 transform focus:outline-none focus:ring-2 focus:z-20 focus:ring-offset-2 disabled:opacity-75 bg-green-600 text-white border border-transparent hover:bg-green-700 focus:ring-green-500 focus:ring-offset-black rounded-full p-2.5 text-sm leading-4 z-1000 no-propagation'
                  >
                    <FontAwesomeIcon size='2x' icon={faPhone} />
                  </button>
                )}
              </div>
            </>
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
