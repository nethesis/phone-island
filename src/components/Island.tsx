// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useRef, useEffect, type FC } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../store'
import { useLongPress } from '../utils/useLongPress'
import { motion } from 'framer-motion/dist/framer-motion'
import { useLocalStorage, getTranslateValues } from '../utils'
import { useIsomorphicLayoutEffect } from '../utils'
import CallView from './CallView'
import { useDragControls } from 'framer-motion/dist/framer-motion'

/**
 * The island starting position
 */
const ISLAND_STARTING_POSITION = {
  x: 0,
  y: 0,
}

/**
 * The Island component that provides the views and logic
 */
export const Island = ({ always }: IslandProps) => {
  // Get the currentCall info
  const { incoming, accepted, outgoing } =
    useSelector((state: RootState) => state.currentCall)

  // Get isOpen from island store
  const { isOpen } = useSelector((state: RootState) => state.island)

  // Initialize Island drag controls
  const controls = useDragControls()

  // Initialize Island storage
  const [phoneIslandStorage, setPhoneIslandStorage] =
    useLocalStorage<PhoneIslandStorageTypes | null>('phone-island', null)

  // The Island reference
  const islandRef = useRef<any>(null)

  // The Container reference
  const islandContainerRef = useRef<any>(null)

  // Initialize position or get from storage
  const [position, setPosition] = useState<PositionTypes | null>(
    phoneIslandStorage && phoneIslandStorage.position ? phoneIslandStorage.position : null,
  )

  // Initialize the moved property
  const [moved, setMoved] = useState<boolean>(false)

  const dispatch = useDispatch<Dispatch>()

  /**
   * Handles the drag started event
   */
  function handleStartDrag(event) {
    controls.start(event)
  }

  /**
   * Handles log press event
   */
  const handleLongPress = () => {
    console.log('long press trigger')
  }

  /**
   * Handle Island click
   */
  const handleIslandClick = () => {
    dispatch.island.toggleIsOpen()
  }

  /**
   * Retrieve the position on x axis
   */
  function innerXPosition(x: number) {
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

  /**
   * Retrieve the position on y axis
   */
  function innerYPosition(y: number) {
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

  /**
   * Handles drag end event
   */
  const handleDragEnd = () => {
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

  /**
   * Sets moved property to false
   */
  function resetMoved() {
    setMoved(false)
  }

  /**
   * Handles drag started event
   */
  function handleDragStarted() {
    setMoved(true)
  }

  /**
   * Initialize the long press object
   */
  const longPressEvent = useLongPress(handleLongPress, handleIslandClick, moved, resetMoved, {
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
      width: '168px',
      height: '40px',
      borderRadius: '99px',
    },
  }

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
      {(incoming || outgoing || accepted || always) && (
        <motion.div
          className='font-sans absolute pointer-events-auto overflow-hidden bg-black text-xs cursor-pointer text-white'
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
          onPointerDown={handleStartDrag}
          onDragStart={handleDragStarted}
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
          onDragEnd={handleDragEnd}
          ref={islandRef}
          {...longPressEvent}
        >
          <CallView />
        </motion.div>
      )}
      <div className='hidden'>
        <audio ref={localAudio}></audio>
        <audio autoPlay ref={remoteAudio}></audio>
        <video muted={true} autoPlay ref={localVideo}></video>
        <video autoPlay ref={remoteVideo}></video>
      </div>
    </div>
  )
}

Island.displayName = 'Island'

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
