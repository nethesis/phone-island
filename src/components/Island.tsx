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
import SideView from './SideView/SideView'
import ViewsTransition from './ViewsTransition'
import { TransferListView } from './TransferView'
import { RecorderView } from './RecorderView'
import IslandMotions from './IslandMotion'
import IslandDrag from './IslandDrag'
import Close from './Close'
import { PhysicalRecorderView } from './PhysicalRecorderView'
import { SettingsView } from './SettingsView'
import { VideoView } from './VideoView'
import { SwitchDeviceView } from './SwitchDeviceView'
import { isBackCallActive } from '../utils/genericFunctions/isBackCallVisible'

/**
 * Provides the Island logic
 *
 * @param showAlways Sets the Island ever visible
 */
export const Island: FC<IslandProps> = ({ showAlways }) => {
  // Get the currentCall info
  const { incoming, accepted, outgoing } = useSelector((state: RootState) => state.currentCall)

  const { view, sideViewIsVisible, avoidToShow } = useSelector((state: RootState) => state.island)
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

  useIsomorphicLayoutEffect(() => {
    dispatch.player.updatePlayer({
      audioPlayer: audioPlayer,
      localAudio: localAudio,
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
        view === 'physicalPhoneRecorder') &&
        !avoidToShow && (
          <>
            <IslandDrag islandContainerRef={islandContainerRef}>
              {/* Add background call visibility logic */}
              <BackCall isVisible={isBackCallActive()} />
              <SideView isVisible={sideViewIsVisible} />
              <IslandMotions>
                {/* The views logic */}
                <AlertGuard>
                  {(() => {
                    const views = {
                      call: CallView ? <CallView /> : null,
                      keypad: KeyboardView ? <KeyboardView /> : null,
                      transfer: TransferListView ? <TransferListView /> : null,
                      player: AudioPlayerView ? <AudioPlayerView /> : null,
                      recorder: RecorderView ? <RecorderView /> : null,
                      physicalPhoneRecorder: PhysicalRecorderView ? <PhysicalRecorderView /> : null,
                      settings: SettingsView ? <SettingsView /> : null,
                      video: VideoView ? <VideoView /> : null,
                      switchDevice: SwitchDeviceView ? <SwitchDeviceView /> : null,
                    }

                    return currentView in views && views[currentView as keyof typeof views] ? (
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
      </div>
    </div>
  )
}

Island.displayName = 'Island'

interface IslandProps {
  showAlways?: boolean
}
