// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useRef, useEffect, type FC } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../store'
import {
  useLongPress,
  useIsomorphicLayoutEffect,
  useLocalStorage,
  styleTransformValues,
} from '../utils'
import { motion, useDragControls } from 'framer-motion/dist/framer-motion'
import CallView from './CallView'
import KeyboardView from './KeypadView'
import { xPosition, yPosition } from '../lib/island/island'
import { AlertGuard } from './AlertGuard'
import BackCall from './CallView/BackCall'
import ViewsTransition from './ViewsTransition'
import { TransferListView } from './TransferView'

/**
 * Provides the Island logic
 *
 * @param showAlways Sets the Island ever visible
 *
 */
export const Island: FC<IslandProps> = ({ showAlways }) => {
  // Get the currentCall info
  const { incoming, accepted, outgoing } = useSelector((state: RootState) => state.currentCall)
  // Get isOpen from island store
  const { isOpen, startPosition, view } = useSelector((state: RootState) => state.island)
  // Get activeAlertsCount from island store
  const { activeAlertsCount } = useSelector((state: RootState) => state.alerts.status)
  // Get variants from animations store
  const { variants } = useSelector((state: RootState) => state.animations)
  // Get audioPlayerLoop value from player store
  const { audioPlayerLoop } = useSelector((state: RootState) => state.player)

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
  // Initialize useDispatch
  const dispatch = useDispatch<Dispatch>()

  // Handles the drag started event
  function handleStartDrag(event) {
    controls.start(event)
  }
  // Handles log press event
  const handleLongPress = () => {}

  // Handle Island click
  const handleIslandClick = () => {
    dispatch.island.toggleIsOpen()
  }

  // Handles drag end event
  const handleDragEnd = () => {
    // Get initial transform values
    let { x, y }: any = styleTransformValues(islandRef.current)
    // Round position
    x = xPosition(Math.round(x), islandRef.current, islandContainerRef.current)
    y = yPosition(Math.round(y), islandRef.current, islandContainerRef.current)
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

  // Handles drag started event
  function handleDragStarted() {
    setMoved(true)
  }

  // Initialize the longPressEvent object
  const longPressEvent = useLongPress(
    handleLongPress,
    handleIslandClick,
    moved,
    () => setMoved(false),
    {
      shouldPreventDefault: true,
      delay: 250,
    },
  )

  const audioPlayer = useRef<HTMLAudioElement>(null)
  const localAudio = useRef<HTMLAudioElement>(null)
  const remoteAudio = useRef<HTMLAudioElement>(null)
  const localVideo = useRef<HTMLVideoElement>(null)
  const remoteVideo = useRef<HTMLVideoElement>(null)

  useIsomorphicLayoutEffect(() => {
    dispatch.player.updatePlayer({
      audioPlayer: audioPlayer.current,
      localAudio: localAudio.current,
      localVideo: localVideo.current,
      remoteVideo: remoteVideo.current,
      remoteAudio: remoteAudio.current,
    })
  }, [])

  // Handle and apply view switch logic
  useEffect(() => {
    if (incoming || outgoing) {
      dispatch.island.setIslandView('call')
    }
  }, [incoming, outgoing])

  const [currentView, setCurrentView] = useState<any>('')

  useEffect(() => {
    setTimeout(() => {
      setCurrentView(view)
    }, 200)
  }, [view])

  return (
    <div
      ref={islandContainerRef}
      className='pi-absolute pi-min-w-full pi-min-h-full pi-left-0 pi-top-0 pi-overflow-hidden pi-pointer-events-none pi-flex pi-items-center pi-justify-center pi-content-center phone-island-container pi-z-1000'
    >
      {(incoming || outgoing || accepted || showAlways || activeAlertsCount > 0) && (
        <>
          <motion.div
            drag
            onPointerDown={handleStartDrag}
            onDragStart={handleDragStarted}
            dragTransition={{
              power: 0,
            }}
            initial={{
              x: position?.x || startPosition.x,
              y: position?.y || startPosition.y,
            }}
            dragControls={controls}
            dragConstraints={islandContainerRef}
            onDragEnd={handleDragEnd}
            ref={islandRef}
            {...longPressEvent}
            className='pi-absolute'
          >
            {/* Add background call visibility logic */}
            <BackCall
              isVisible={
                view === 'keypad' || view === 'transfer_list' || view === 'transfer_actions'
              }
            />
            <motion.div
              className='pi-font-sans pi-pointer-events-auto pi-overflow-hidden pi-bg-black pi-text-xs pi-cursor-pointer pi-text-white'
              animate={
                view === 'call'
                  ? isOpen && (incoming || outgoing) && !accepted
                    ? // The call is incoming or outgoing
                      activeAlertsCount > 0
                      ? variants.callView.expandedIncomingWithAlerts
                      : variants.callView.expandedIncoming
                    : isOpen && accepted
                    ? // The call is accepted and the island is expanded
                      activeAlertsCount > 0
                      ? variants.callView.expandedAcceptedWithAlerts
                      : variants.callView.expandedAccepted
                    : activeAlertsCount > 0
                    ? variants.expandedWithAlerts
                    : variants.callView.collapsed
                  : view === 'keypad'
                  ? isOpen && activeAlertsCount > 0
                    ? variants.keypadView.expandedWithAlerts
                    : isOpen && activeAlertsCount === 0
                    ? variants.keypadView.expanded
                    : !isOpen
                    ? variants.keypadView.collapsed
                    : ''
                  : view === 'transfer_list'
                  ? isOpen && activeAlertsCount > 0
                    ? variants.transferListView.expandedWithAlerts
                    : isOpen && activeAlertsCount === 0
                    ? variants.transferListView.expanded
                    : !isOpen
                    ? variants.transferListView.collapsed
                    : ''
                  : ''
              }
            >
              {/* The views logic */}
              <AlertGuard>
                {currentView === 'call' ? (
                  <ViewsTransition forView='call'>
                    <CallView />
                  </ViewsTransition>
                ) : currentView === 'keypad' ? (
                  <ViewsTransition forView='keypad'>
                    <KeyboardView />
                  </ViewsTransition>
                ) : currentView === 'transfer_list' ? (
                  <ViewsTransition forView='transfer_list'>
                    <TransferListView />
                  </ViewsTransition>
                ) : (
                  <></>
                )}
              </AlertGuard>
            </motion.div>
          </motion.div>
        </>
      )}
      <div className='pi-hidden'>
        <audio loop={audioPlayerLoop} ref={audioPlayer}></audio>
        <audio muted={true} ref={localAudio}></audio>
        <audio autoPlay ref={remoteAudio}></audio>
        <video muted={true} autoPlay ref={localVideo}></video>
        <video autoPlay ref={remoteVideo}></video>
      </div>
    </div>
  )
}

Island.displayName = 'Island'

interface IslandProps {
  showAlways?: boolean
}

interface PositionTypes {
  x: number
  y: number
}

interface PhoneIslandStorageTypes {
  position: PositionTypes
}
