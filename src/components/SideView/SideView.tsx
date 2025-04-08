import React, { FC, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState, store } from '../../store'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDisplay,
  faStop,
  faVideo,
  faVideoSlash,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { faArrowsRepeat, faRecord } from '@nethesis/nethesis-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import { recordCurrentCall } from '../../lib/phone/call'
import { CustomThemedTooltip } from '../CustomThemedTooltip'
import { getAvailableDevices } from '../../utils/deviceUtils'
import { JanusTypes } from '../../types/webrtc'
import JanusLib from '../../lib/webrtc/janus.js'
import { checkWebCamPermission } from '../../lib/devices/devices'
import { check } from 'prettier'

const SideView: FC<SideViewTypes> = ({ isVisible }) => {
  const dispatch = useDispatch<Dispatch>()
  const { isOpen } = useSelector((state: RootState) => state.island)
  const { isRecording } = useSelector((state: RootState) => state.currentCall)
  const userInformation = useSelector((state: RootState) => state.currentUser)
  const allUsersInformation = useSelector((state: RootState) => state.users)
  const { t } = useTranslation()
  const [availableDevices, setAvailableDevices] = useState([])
  const videoInputDevices = store.select.mediaDevices.videoInputDevices(store.getState())
  const janus = useRef<JanusTypes>(JanusLib)

  const closeSideViewAndLaunchEvent = (viewType: any) => {
    dispatch.island.toggleSideViewVisible(false)
    if (viewType !== null) {
      dispatch.island.setIslandView(viewType)
    }
  }

  const [isVideoCallButtonVisible, setIsVideoCallButtonVisible] = useState(true)

  const goToVideoCall = async () => {
    let cameraPermission = await checkCameraPermission()
    if (cameraPermission) {
      closeSideViewAndLaunchEvent('video')

      store.dispatch.currentCall.updateCurrentCall({
        isLocalVideoEnabled: true,
        isStartingVideoCall: true,
      })
    }
  }

  const checkCameraPermission = async () => {
    if (videoInputDevices.length > 0) {
      const isWebCamAccepted = await checkWebCamPermission()
      if (isWebCamAccepted) {
        setIsVideoCallButtonVisible(true)
        return true
      } else {
        setIsVideoCallButtonVisible(false)
        return false
      }
    } else {
      setIsVideoCallButtonVisible(false)
      return false
    }
  }

  const goToScreenSharing = () => {
    closeSideViewAndLaunchEvent('video')

    store.dispatch.screenShare.update({
      isStartingScreenShare: true,
    })
  }

  useEffect(() => {
    // check available devices

    setAvailableDevices(getAvailableDevices(userInformation, allUsersInformation))
  }, [])

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`pi-absolute pi-h-full pi-bg-gray-700 pi-flex pi-flex-col pi-items-center pi-text-gray-50 dark:pi-text-gray-50 -pi-mr-10 pi-right-0 -pi-z-10 pi-pointer-events-auto ${
              isOpen ? 'pi-py-6' : 'pi-py-4'
            }`}
            style={{
              borderTopRightRadius: '20px',
              borderBottomRightRadius: '20px',
              width: '80px',
              transformOrigin: 'right',
            }}
            initial={{ x: -76 }}
            animate={{
              x: 4,
              transition: {
                duration: 0.2,
                ease: 'easeOut',
              },
            }}
            exit={{
              x: -76,
              transition: {
                duration: 0.2,
                ease: 'easeIn',
              },
            }}
          >
            <div className='pi-flex pi-flex-col pi-items-center pi-gap-3.5 pi-flex-1 pi-ml-9'>
              {/* Recording button */}
              {userInformation?.profile?.macro_permissions?.settings?.permissions?.recording
                ?.value && (
                <Button
                  active={isRecording}
                  data-stop-propagation={true}
                  variant='transparentSideView'
                  onClick={() => recordCurrentCall(isRecording)}
                  data-tooltip-id='tooltip-record'
                  data-tooltip-content={
                    isRecording ? t('Tooltip.Stop recording') || '' : t('Tooltip.Record') || ''
                  }
                >
                  {isRecording ? (
                    <FontAwesomeIcon icon={faStop} className='pi-h-5 pi-w-5 pi-text-white' />
                  ) : (
                    <FontAwesomeIcon className='pi-h-5 pi-w-5 pi-text-white' icon={faRecord} />
                  )}
                </Button>
              )}
              {/* Videocall button - show only if there are video devices */}
              {videoInputDevices?.length > 0 && (
                <Button
                  variant='transparentSideView'
                  onClick={() => goToVideoCall()}
                  data-tooltip-id='tooltip-video'
                  data-tooltip-content={`${
                    isVideoCallButtonVisible
                      ? t('Tooltip.Enable camera') || ''
                      : t('Tooltip.Enable camera permission') || ''
                  }`}
                  disabled={!isVideoCallButtonVisible}
                  className={`${!isVideoCallButtonVisible ? 'pi-cursor-auto' : ''}`}
                >
                  <FontAwesomeIcon
                    className='pi-h-5 pi-w-5 pi-text-white'
                    icon={isVideoCallButtonVisible ? faVideo : faVideoSlash}
                  />
                </Button>
              )}
              {/* Share screen button */}
              {janus.current.webRTCAdapter.browserDetails.browser !== 'safari' &&
                userInformation?.profile?.macro_permissions?.nethvoice_cti?.permissions
                  ?.screen_sharing?.value && (
                  <Button
                    variant='transparentSideView'
                    onClick={() => goToScreenSharing()}
                    data-tooltip-id='tooltip-screen-share'
                    data-tooltip-content={t('Tooltip.Share screen') || ''}
                  >
                    <FontAwesomeIcon className='pi-h-5 pi-w-5 pi-text-white' icon={faDisplay} />
                  </Button>
                )}
              {/* Switch device button - show only if there are available devices */}
              {availableDevices?.length > 0 && (
                <Button
                  variant='transparentSideView'
                  data-tooltip-id='tooltip-switch-device'
                  data-tooltip-content={t('Tooltip.Switch device') || ''}
                  onClick={() => closeSideViewAndLaunchEvent('switchDevice')}
                >
                  <FontAwesomeIcon className='pi-h-5 pi-w-5 pi-text-white' icon={faArrowsRepeat} />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <CustomThemedTooltip id='tooltip-record' place='left' />
      <CustomThemedTooltip id='tooltip-video' place='left' />
      <CustomThemedTooltip id='tooltip-screen-share' place='left' />
      <CustomThemedTooltip id='tooltip-switch-device' place='left' />
    </>
  )
}

export default SideView

interface SideViewTypes {
  isVisible: boolean
}
