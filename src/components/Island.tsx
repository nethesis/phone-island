// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useRef, useEffect, type FC } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../store'
import { useIsomorphicLayoutEffect } from '../utils'
import CallView from './CallView'
import KeyboardView from './KeypadView'
import AudioPlayerView from './AudioPlayerView'
import { AlertGuard } from './AlertGuard'
import BackCall from './CallView/BackCall'
import SideView from './CallView/SideView'
import ViewsTransition from './ViewsTransition'
import { TransferListView } from './TransferView'
import { RecorderView } from './RecorderView'
import IslandMotions from './IslandMotion'
import IslandDrag from './IslandDrag'
import Close from './Close'
import { PhysicalRecorderView } from './PhysicalRecorderView'
import { SettingsView } from './SettingsView'
import { VideoView } from './VideoView'

/**
 * Provides the Island logic
 *
 * @param showAlways Sets the Island ever visible
 */
export const Island: FC<IslandProps> = ({ showAlways }) => {
  // Get the currentCall info
  const { incoming, accepted, outgoing, transferring } = useSelector(
    (state: RootState) => state.currentCall,
  )

  // Get isOpen from island store
  const { view, sideViewIsVisible } = useSelector((state: RootState) => state.island)
  const { recording } = useSelector((state: RootState) => ({
    recording: state.physicalRecorder.recording,
  }))

  // Get activeAlertsCount from island store
  const { activeAlertsCount } = useSelector((state: RootState) => state.alerts.status)

  // Get audioPlayerLoop value from player store
  const { audioPlayerLoop } = useSelector((state: RootState) => state.player)

  // The Container reference
  const islandContainerRef = useRef<any>(null)

  // Initialize useDispatch
  const dispatch = useDispatch<Dispatch>()

  const audioPlayer = useRef<HTMLAudioElement>(null)
  const localAudio = useRef<HTMLAudioElement>(null)
  const remoteAudio = useRef<HTMLAudioElement>(null)
  const localVideo = useRef<HTMLVideoElement>(null)
  const remoteVideo = useRef<HTMLVideoElement>(null)

  useIsomorphicLayoutEffect(() => {
    dispatch.player.updatePlayer({
      audioPlayer: audioPlayer,
      localAudio: localAudio,
      localVideo: localVideo,
      remoteVideo: remoteVideo,
      remoteAudio: remoteAudio,
    })
  }, [])

  // Handle and apply view switch logic
  // ...set callview as the current view
  useEffect(() => {
    // Check and switch the view
    if (incoming || outgoing) {
      dispatch.island.setIslandView('call')
    }
  }, [incoming, outgoing])

  useEffect(() => {
    if (recording) {
      dispatch.island.setIslandView('physicalPhoneRecorder')
    }
  }, [view])

  const [currentView, setCurrentView] = useState<any>('')

  // Handle island view change
  useEffect(() => {
    setTimeout(() => {
      setCurrentView(view)
    }, 200)
  }, [view])

  return (
    <div
      ref={islandContainerRef}
      className='pi-absolute pi-min-w-full pi-min-h-full pi-left-0 pi-top-0 pi-overflow-hidden pi-pointer-events-none pi-flex pi-items-center pi-justify-center pi-content-center pi-phone-island-container pi-z-1000'
    >
      {(incoming ||
        outgoing ||
        accepted ||
        showAlways ||
        activeAlertsCount > 0 ||
        view === 'player' ||
        view === 'recorder' ||
        view === 'physicalPhoneRecorder') && (
        <>
          <IslandDrag islandContainerRef={islandContainerRef}>
            {/* Add background call visibility logic */}
            <BackCall isVisible={view === 'keypad' || view === 'transfer' || transferring} />
            <SideView isVisible={sideViewIsVisible} />
            <IslandMotions>
              {/* The views logic */}
              <AlertGuard>
                {(() => {
                  const views = {
                    call: <CallView />,
                    keypad: <KeyboardView />,
                    transfer: <TransferListView />,
                    player: <AudioPlayerView />,
                    recorder: <RecorderView />,
                    physicalPhoneRecorder: <PhysicalRecorderView />,
                    settings: <SettingsView />,
                    video: <VideoView />,
                  }

                  return currentView in views ? (
                    <ViewsTransition forView={currentView}>
                      {views[currentView as keyof typeof views]}
                    </ViewsTransition>
                  ) : (
                    <></>
                  )
                })()}
              </AlertGuard>
            </IslandMotions>
            <Close />
          </IslandDrag>
        </>
      )}
      <div className='pi-hidden'>
        <audio loop={audioPlayerLoop} ref={audioPlayer}></audio>
        <audio muted={true} ref={localAudio}></audio>
        <audio autoPlay ref={remoteAudio}></audio>
        <video muted={true} autoPlay ref={localVideo}></video>
        <video autoPlay muted={true} ref={remoteVideo}></video>
      </div>
    </div>
  )
}

Island.displayName = 'Island'

interface IslandProps {
  showAlways?: boolean
}
