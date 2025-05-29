import React, { FC, useCallback, useMemo, memo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { motion, AnimatePresence } from 'framer-motion'
import {
  faArrowUpRightFromSquare,
  faDisplay,
  faStop,
  faVideo,
  faVideoSlash,
} from '@fortawesome/free-solid-svg-icons'
import { faArrowsRepeat, faRecord } from '@nethesis/nethesis-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import { recordCurrentCall } from '../../lib/phone/call'
import { CustomThemedTooltip } from '../CustomThemedTooltip'
import { useSideViewLogic } from './hooks/useSideViewLogic'
import { SideViewButton } from './components/SideViewButton'

const ANIMATION_CONFIG = {
  initial: { x: -76 },
  animate: { x: 4, transition: { duration: 0.1, ease: 'easeOut' } },
  exit: { x: -76, transition: { duration: 0.1, ease: 'easeIn' } },
} as const

const STYLE_CONFIG = {
  borderTopRightRadius: '20px',
  borderBottomRightRadius: '20px',
  width: '80px',
  transformOrigin: 'right',
} as const

interface ButtonConfig {
  active?: boolean
  onClick: () => void | Promise<void>
  tooltipId: string
  tooltipContent: string
  icon: any
  disabled?: boolean
}

interface ButtonConfigWithKey extends ButtonConfig {
  key: string
}

const SideView: FC<SideViewTypes> = memo(({ isVisible }) => {
  const { isOpen } = useSelector((state: RootState) => state.island)
  const { isRecording } = useSelector((state: RootState) => state.currentCall)
  const { t } = useTranslation()

  const {
    videoInputDevices,
    isVideoCallButtonVisible,
    canRecord,
    canShareScreen,
    canSwitchDevice,
    showUrlButton,
    goToVideoCall,
    goToScreenSharing,
    closeSideViewAndLaunchEvent,
  } = useSideViewLogic()

  const handleRecordClick = useCallback(() => {
    recordCurrentCall(isRecording)
  }, [isRecording])

  const buttonConfigs = useMemo(() => {
    const configs: (ButtonConfigWithKey | false)[] = [
      canRecord && {
        key: 'record',
        active: isRecording,
        onClick: handleRecordClick,
        tooltipId: 'tooltip-record',
        tooltipContent: isRecording ? t('Tooltip.Stop recording') || '' : t('Tooltip.Record') || '',
        icon: isRecording ? faStop : faRecord,
      },
      videoInputDevices?.length > 0 && {
        key: 'video',
        onClick: goToVideoCall,
        tooltipId: 'tooltip-video',
        tooltipContent: isVideoCallButtonVisible
          ? t('Tooltip.Enable camera') || ''
          : t('Tooltip.Enable camera permission') || '',
        disabled: !isVideoCallButtonVisible,
        icon: isVideoCallButtonVisible ? faVideo : faVideoSlash,
      },
      canShareScreen && {
        key: 'screen-share',
        onClick: goToScreenSharing,
        tooltipId: 'tooltip-screen-share',
        tooltipContent: t('Tooltip.Share screen') || '',
        icon: faDisplay,
      },
      showUrlButton && {
        key: 'url',
        onClick: () => closeSideViewAndLaunchEvent('openUrl'),
        tooltipId: 'tooltip-open-url',
        tooltipContent: t('Tooltip.Open url') || '',
        icon: faArrowUpRightFromSquare,
      },
      canSwitchDevice && {
        key: 'switch-device',
        onClick: () => closeSideViewAndLaunchEvent('switchDevice'),
        tooltipId: 'tooltip-switch-device',
        tooltipContent: t('Tooltip.Switch device') || '',
        icon: faArrowsRepeat,
      },
    ]

    return configs.filter((config): config is ButtonConfigWithKey => Boolean(config))
  }, [
    canRecord,
    isRecording,
    handleRecordClick,
    t,
    videoInputDevices?.length,
    goToVideoCall,
    isVideoCallButtonVisible,
    canShareScreen,
    goToScreenSharing,
    showUrlButton,
    closeSideViewAndLaunchEvent,
    canSwitchDevice,
  ])

  const containerClassName = useMemo(
    () =>
      `pi-absolute pi-h-full pi-bg-surfaceSidebar dark:pi-bg-surfaceSidebarDark pi-flex pi-flex-col pi-items-center pi-text-iconWhite dark:pi-text-iconWhiteDark -pi-mr-10 pi-right-0 -pi-z-10 pi-pointer-events-auto ${
        isOpen ? 'pi-py-6' : 'pi-py-4'
      }`,
    [isOpen],
  )

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div className={containerClassName} style={STYLE_CONFIG} {...ANIMATION_CONFIG}>
            <div className='pi-flex pi-flex-col pi-items-center pi-gap-3.5 pi-flex-1 pi-ml-9'>
              {buttonConfigs.map(({ key, ...config }) => (
                <SideViewButton key={key} {...config} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CustomThemedTooltip id='tooltip-record' place='left' />
      <CustomThemedTooltip id='tooltip-video' place='left' />
      <CustomThemedTooltip id='tooltip-screen-share' place='left' />
      <CustomThemedTooltip id='tooltip-switch-device' place='left' />
      <CustomThemedTooltip id='tooltip-open-url' place='left' />
    </>
  )
})

SideView.displayName = 'SideView'

export default SideView

interface SideViewTypes {
  isVisible: boolean
}
