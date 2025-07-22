import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState, store } from '../../../store'
import { getAvailableDevices } from '../../../utils/deviceUtils'
import JanusLib from '../../../lib/webrtc/janus.js'
import { checkWebCamPermission } from '../../../lib/devices/devices'
import { eventDispatch } from '../../../utils'

export const useSideViewLogic = (uaType?: string) => {
  const dispatch = useDispatch<Dispatch>()
  const userInformation = useSelector((state: RootState) => state.currentUser)
  const allUsersInformation = useSelector((state: RootState) => state.users)
  const paramUrlData = useSelector((state: RootState) => state.paramUrl)
  const videoInputDevices = store.select.mediaDevices.videoInputDevices(store.getState())
  const janus = useRef<any>(JanusLib)
  const conversations = useSelector((state: RootState) => state.currentUser.conversations)

  const [availableDevices, setAvailableDevices] = useState([])
  const [isVideoCallButtonVisible, setIsVideoCallButtonVisible] = useState(true)

  const closeSideViewAndLaunchEvent = useCallback(
    (viewType: any) => {
      dispatch.island.toggleSideViewVisible(false)
      if (viewType === 'openUrl') {
        const activeConversation = Object.values(conversations).find(
          (conv) => Object.keys(conv).length > 0,
        )
        const conversationData = activeConversation ? Object.values(activeConversation)[0] : null

        if (conversationData?.connected && conversationData?.direction === 'in') {
          if (paramUrlData.onlyQueues && conversationData?.throughQueue) {
            // Open URL only for queue calls when onlyQueues is true
            const eventData = {
              counterpartNum: conversationData.counterpartNum,
              counterpartName: conversationData.counterpartName,
              owner: conversationData.owner,
              uniqueId: conversationData.uniqueId,
              throughQueue: conversationData.throughQueue,
              throughTrunk: conversationData.throughTrunk,
              direction: conversationData.direction,
              connected: conversationData.connected,
              url: paramUrlData.url,
            }
            eventDispatch('phone-island-url-parameter-opened', eventData)
          } else if (
            !paramUrlData.onlyQueues &&
            (conversationData?.throughTrunk || conversationData?.throughQueue)
          ) {
            // Open URL for both trunk and queue calls when onlyQueues is false
            const eventData = {
              counterpartNum: conversationData.counterpartNum,
              counterpartName: conversationData.counterpartName,
              owner: conversationData.owner,
              uniqueId: conversationData.uniqueId,
              throughQueue: conversationData.throughQueue,
              throughTrunk: conversationData.throughTrunk,
              direction: conversationData.direction,
              connected: conversationData.connected,
              url: paramUrlData.url,
            }
            eventDispatch('phone-island-url-parameter-opened', eventData)
          }
        }
      } else if (viewType !== null) {
        dispatch.island.setIslandView(viewType)
      }
    },
    [dispatch.island, conversations, paramUrlData],
  )

  const checkCameraPermission = useCallback(async () => {
    if (videoInputDevices.length > 0) {
      const isWebCamAccepted = await checkWebCamPermission()
      setIsVideoCallButtonVisible(isWebCamAccepted)
      return isWebCamAccepted
    } else {
      setIsVideoCallButtonVisible(false)
      return false
    }
  }, [videoInputDevices.length])

  const goToVideoCall = useCallback(async () => {
    const cameraPermission = await checkCameraPermission()
    if (cameraPermission) {
      closeSideViewAndLaunchEvent('video')
      store.dispatch.currentCall.updateCurrentCall({
        isLocalVideoEnabled: true,
        isStartingVideoCall: true,
      })
    }
  }, [checkCameraPermission, closeSideViewAndLaunchEvent])

  const goToScreenSharing = useCallback(() => {
    closeSideViewAndLaunchEvent('video')
    store.dispatch.screenShare.update({
      isStartingScreenShare: true,
    })
  }, [closeSideViewAndLaunchEvent])

  const permissions = useMemo(
    () => userInformation?.profile?.macro_permissions || {},
    [userInformation?.profile?.macro_permissions],
  )

  const userCapabilities = useMemo(
    () => ({
      canRecord: permissions?.settings?.permissions?.recording?.value || false,
      canShareScreen:
        janus.current.webRTCAdapter.browserDetails.browser !== 'safari' &&
        (permissions?.nethvoice_cti?.permissions?.screen_sharing?.value || false),
      canSwitchDevice: availableDevices?.length > 0,
      showUrlButton: userInformation?.default_device?.type !== 'nethlink' && uaType === 'desktop',
    }),
    [
      permissions?.settings?.permissions?.recording?.value,
      permissions?.nethvoice_cti?.permissions?.screen_sharing?.value,
      availableDevices?.length,
      userInformation?.default_device?.type,
      uaType,
    ],
  )

  const isUrlButtonEnabled = useMemo(() => {
    const activeConversation = Object.values(conversations).find(
      (conv) => Object.keys(conv).length > 0,
    )
    const conversationData = activeConversation ? Object.values(activeConversation)[0] : null

    // If param url type is 'never', return false
    if (paramUrlData.openParamUrlType === 'never') {
      return false;
    }


    if (!conversationData?.connected || conversationData?.direction !== 'in') {
      return false;
    }

    // open param url type is set to 'button'
    if (paramUrlData.openParamUrlType === 'button') {
      if (paramUrlData.onlyQueues && conversationData?.throughQueue) {
        return true;
      } else if (!paramUrlData.onlyQueues && (conversationData?.throughTrunk || conversationData?.throughQueue)) {
        return true;
      }
    }

    return false;
  }, [conversations, paramUrlData.onlyQueues, paramUrlData.openParamUrlType])

  useEffect(() => {
    if (userInformation && allUsersInformation) {
      const devices = getAvailableDevices(userInformation, allUsersInformation)
      setAvailableDevices(devices)
    }
  }, [userInformation, allUsersInformation])

  return {
    userInformation,
    availableDevices,
    videoInputDevices,
    isVideoCallButtonVisible,
    isUrlButtonEnabled,
    hasValidUrl: paramUrlData.hasValidUrl,
    ...userCapabilities,
    goToVideoCall,
    goToScreenSharing,
    closeSideViewAndLaunchEvent,
  }
}
