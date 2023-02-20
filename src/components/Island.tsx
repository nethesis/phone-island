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

  const controls = useDragControls()

  const [phoneIslandStorage, setPhoneIslandStorage] =
    useLocalStorage<PhoneIslandStorageTypes | null>('phone-island', null)

  const islandRef = useRef<any>(null)

  const islandContainerRef = useRef<any>(null)

  const [position, setPosition] = useState<PositionTypes | null>(
    phoneIslandStorage && phoneIslandStorage.position ? phoneIslandStorage.position : null,
  )

  const [moved, setMoved] = useState<boolean>(false)

  const dispatch = useDispatch<Dispatch>()

  function startDrag(event) {
    controls.start(event)
  }

  const onLongPress = () => {
    console.log('long press trigger')
  }

  const islandClick = () => {
    dispatch.island.toggleIsOpen()
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
