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
import { RecorderView } from './RecorderView'
import IslandMotions from './IslandMotion'
import IslandDrag from './IslandDrag'
import { PhysicalRecorderView } from './PhysicalRecorderView'
import { SettingsView } from './SettingsView'
import { SwitchDeviceView } from './SwitchDeviceView'
import { isBackCallActive } from '../utils/genericFunctions/isBackCallVisible'
import VideoView from './VideoView'
import { WaitingConferenceView } from './ConferenceView'
import { store } from '../store'
import { ContactListView } from './ContactView/ContactListView'
import StreamingAnswerView from './StreamingAnswerView'
import { OperatorBusyView } from './OperatorBusyView'
import { TranscriptionView } from './TranscriptionView'

/**
 * Provides the Island logic
 *
 * @param showAlways Sets the Island ever visible
 */
export const Island: FC<IslandProps> = ({ showAlways, uaType, urlParamWithEvent }) => {
  // Get the currentCall info
  const { incoming, accepted, outgoing } = useSelector((state: RootState) => state.currentCall)

  const { view, sideViewIsVisible, transcriptionViewIsVisible, avoidToShow, previousView } = useSelector(
    (state: RootState) => state.island,
  )
  const { recording } = useSelector((state: RootState) => ({
    recording: state.physicalRecorder.recording,
  }))

  // Get activeAlertsCount from island store
  const { activeAlertsCount } = useSelector((state: RootState) => state.alerts.status)

  // Get audioPlayerLoop value from player store
  const { audioPlayerLoop } = useSelector((state: RootState) => state.player)
  const { isActive } = useSelector((state: RootState) => state.conference)

  // Get user information for device logic
  const { default_device, endpoints, username } = useSelector((state: RootState) => state.currentUser)
  const { extensions } = useSelector((state: RootState) => state.users)

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
    const { isActive, conferenceStartedFrom, isOwnerInside } = store.getState().conference
    const { username } = store.getState().currentUser
    // Check and switch the view
    if ((incoming || outgoing) && isActive && conferenceStartedFrom === username && isOwnerInside) {
      dispatch.island.setIslandView('waitingConference')
    } else if ((incoming || outgoing) && !avoidToShow) {
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

  // Check if there's an online NethLink device
  const hasOnlineNethlink = () => {
    if (!extensions || !username) return false

    // Get all extensions for current user
    const userExtensions: any = Object.values(extensions).filter(
      (ext) => ext?.username === username,
    )

    // Check if any extension is nethlink type and online
    return userExtensions?.some((ext) => {
      const endpointExtension = endpoints?.extension.find(
        (endpoint) => endpoint.id === ext?.exten,
      )
      return endpointExtension?.type === 'nethlink' && ext?.status !== 'offline'
    })
  }

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
        view === 'physicalPhoneRecorder' ||
        (view === 'waitingConference' && isActive) ||
        (view === 'transfer' && isActive) ||
        (view === 'settings' && isActive) ||
        (view === 'operatorBusy' &&
          ((uaType === 'mobile' && hasOnlineNethlink()) ||
            (uaType === 'desktop' &&
              (default_device?.type === 'webrtc' ||
                (default_device?.type === undefined && !hasOnlineNethlink()) ||
                (!hasOnlineNethlink() && default_device?.type === 'physical'))))) ||
        (view === 'settings' && (previousView === 'recorder' || previousView === 'player'))) &&
        !avoidToShow && (
          <>
            <IslandDrag islandContainerRef={islandContainerRef}>
              {/* Add background call visibility logic */}
              <BackCall isVisible={isBackCallActive()} />
              <SideView isVisible={sideViewIsVisible} uaType={uaType} />
              <TranscriptionView isVisible={transcriptionViewIsVisible} />
              <IslandMotions>
                {/* The views logic */}
                <AlertGuard uaType={uaType}>
                  {(() => {
                    const views = {
                      call: CallView ? <CallView /> : null,
                      keypad: KeyboardView ? <KeyboardView /> : null,
                      transfer: ContactListView ? <ContactListView /> : null,
                      player: AudioPlayerView ? <AudioPlayerView /> : null,
                      recorder: RecorderView ? <RecorderView /> : null,
                      physicalPhoneRecorder: PhysicalRecorderView ? <PhysicalRecorderView /> : null,
                      settings: SettingsView ? <SettingsView /> : null,
                      video: VideoView ? <VideoView /> : null,
                      switchDevice: SwitchDeviceView ? <SwitchDeviceView /> : null,
                      waitingConference: WaitingConferenceView ? <WaitingConferenceView /> : null,
                      streamingAnswer: StreamingAnswerView ? <StreamingAnswerView /> : null,
                      operatorBusy: OperatorBusyView ? <OperatorBusyView /> : null,
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
  uaType?: string
  urlParamWithEvent?: boolean
}
