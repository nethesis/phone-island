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
  const videoInputDevices = store.select.mediaDevices.videoInputDevices(store.getState())
  const janus = useRef<any>(JanusLib)

  const [availableDevices, setAvailableDevices] = useState([])
  const [isVideoCallButtonVisible, setIsVideoCallButtonVisible] = useState(true)

  const closeSideViewAndLaunchEvent = useCallback(
    (viewType: any) => {
      dispatch.island.toggleSideViewVisible(false)
      if (viewType === 'openUrl') {
        eventDispatch('phone-island-url-parameter-opened', {})
      } else if (viewType !== null) {
        dispatch.island.setIslandView(viewType)
      }
    },
    [dispatch.island],
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
    ...userCapabilities,
    goToVideoCall,
    goToScreenSharing,
    closeSideViewAndLaunchEvent,
  }
}
