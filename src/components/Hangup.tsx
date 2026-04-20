// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { motion } from 'framer-motion'
import { Button } from './Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownLeftAndUpRightToCenter, faGear, faPhone, faUpRightAndDownLeftFromCenter } from '@fortawesome/free-solid-svg-icons'
import { endConference, hangupCurrentCall, hangupCurrentPhysicalRecording } from '../lib/phone/call'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { Dispatch } from '../store'
import { hangupAllExtensions } from '../lib/phone/call'
import { useTranslation } from 'react-i18next'
import { eventDispatch } from '../utils'
import { CustomThemedTooltip } from './CustomThemedTooltip'

/**
 * Return the status of the
 */
const Hangup: FC<HangupProps> = ({
  clickCallback,
  isDestination,
  description,
  isPhysicalRecording,
  buttonsVariant = 'transparent',
  showFullscreenButton = false,
  isExtraLarge = false,
  onToggleExtraLarge,
}) => {
  const { transferring, incoming, accepted } = useSelector((state: RootState) => state.currentCall)
  const dispatch = useDispatch<Dispatch>()
  const { isOpen, sideViewIsVisible, view } = useSelector((state: RootState) => state.island)
  const { isActive, conferenceStartedFrom } = useSelector((state: RootState) => state.conference)
  const { username } = useSelector((state: RootState) => state.currentUser)

  function handleHangup() {
    if (incoming) {
      hangupAllExtensions()
    } else {
      hangupCurrentCall()
    }

    // Delay the dispatch actions
    setTimeout(() => {
      dispatch.listen.setUpdateIntrudeStatus(false, '')
      dispatch.listen.setUpdateListenStatus(false, '')
    }, 2000)

    // Show confirmation message when a call is transferred
    if (transferring) {
      setTimeout(() => {
        dispatch.alerts.setAlert('call_transfered')
        eventDispatch('phone-island-call-transfer-successfully-popup-open', {})
        setTimeout(() => {
          dispatch.alerts.removeAlert('call_transfered')
          eventDispatch('phone-island-call-transfer-successfully-popup-close', {})
        }, 2000)
      }, 300)
    }
  }

  const { t } = useTranslation()
  const showSecondaryControls = (isOpen && accepted) || (view === 'waitingConference' && isOpen)
  const useCompactLayout = !transferring

  // Helper function to determine tooltip content
  const getToggleTooltipContent = () => {
    if (view === 'streamingAnswer') {
      return isExtraLarge ? t('Tooltip.Decrease') : t('Tooltip.Increase')
    }
    return t('Tooltip.Toggle fullscreen')
  }

  // Close side view and open settings view
  const closeSideViewOpenSettings = () => {
    if (sideViewIsVisible) {
      eventDispatch('phone-island-sideview-close', {})
    }
    eventDispatch('phone-island-transcription-close', {})
    dispatch.island.setIslandView('settings')
  }

  // Phone island footer section
  return (
    <>
      <div
        className={` ${transferring
          ? 'pi-grid pi-w-full pi-space-x-2 pi-justify-start'
          : 'pi-flex pi-justify-center'
          }`}
      >
        {/* The button to hangup the currentCall */}
        <motion.div
          className={`${transferring && description
            ? 'pi-grid pi-grid-cols-4 pi-ml-4 pi-justify-start'
            : useCompactLayout && showSecondaryControls
              ? 'pi-relative pi-flex pi-h-12 pi-w-64 pi-items-center pi-justify-center pi-overflow-hidden'
              : 'pi-flex pi-w-12 pi-items-center pi-justify-center'
            } `}
        >
          {/* collapse phone island button */}
          {showSecondaryControls && !showFullscreenButton && (
            <div className={useCompactLayout ? 'pi-absolute pi-left-0 pi-top-0 pi-grid pi-grid-cols-1' : 'pi-grid pi-grid-cols-1'}>
              <Button
                variant={buttonsVariant}
                onClick={() => dispatch.island.handleToggleIsOpen()}
                data-tooltip-id='tooltip-open-close-phone-island'
                data-tooltip-content={
                  isOpen ? t('Tooltip.Collapse') || '' : t('Tooltip.Open') || ''
                }
              >
                <FontAwesomeIcon icon={faDownLeftAndUpRightToCenter} className='pi-w-6 pi-h-6' />
              </Button>
            </div>
          )}

          {/* expand/compress button for streaming */}
          {showSecondaryControls && showFullscreenButton && (
            <div className={useCompactLayout ? 'pi-absolute pi-left-0 pi-top-0 pi-grid pi-grid-cols-1' : 'pi-grid pi-grid-cols-1'}>
              <Button
                variant={buttonsVariant}
                onClick={onToggleExtraLarge}
                data-tooltip-id='tooltip-toggle-fullscreen-hangup'
                data-tooltip-content={getToggleTooltipContent()}
              >
                <FontAwesomeIcon
                  className='pi-h-6 pi-w-6'
                  icon={isExtraLarge ? faDownLeftAndUpRightToCenter : faUpRightAndDownLeftFromCenter}
                />
              </Button>
            </div>
          )}

          <Button
            onClick={() => {
              if (isPhysicalRecording) {
                eventDispatch('phone-island-sideview-close', {})
                eventDispatch('phone-island-transcription-close', {})
                hangupCurrentPhysicalRecording()
              } else if (isActive) {
                if (conferenceStartedFrom === username && view === 'waitingConference') {
                  eventDispatch('phone-island-sideview-close', {})
                  eventDispatch('phone-island-transcription-close', {})
                  endConference()
                } else {
                  eventDispatch('phone-island-sideview-close', {})
                  eventDispatch('phone-island-transcription-close', {})
                  handleHangup()
                }
              } else {
                eventDispatch('phone-island-sideview-close', {})
                eventDispatch('phone-island-transcription-close', {})
                handleHangup()
              }
            }}
            variant='red'
            className={`${transferring && description
              ? 'pi-gap-4 pi-font-medium pi-text-base pi-transition pi-min-w-12 pi-w-full pi-col-span-2'
              : useCompactLayout && showSecondaryControls
                ? 'pi-relative pi-z-10 pi-gap-4 pi-font-medium pi-text-base pi-transition pi-h-12 pi-w-12 pi-min-w-12 pi-overflow-hidden'
                : 'pi-gap-4 pi-font-medium pi-text-base pi-transition pi-min-w-12 pi-w-full'
              }`}
            data-tooltip-id={
              (description && transferring) || (view === 'waitingConference' && isActive)
                ? 'tooltip-top-transfer'
                : 'tooltip-left-transfer'
            }
            data-tooltip-content={
              description && transferring
                ? description
                : view === 'waitingConference' && isActive
                  ? t('Conference.End conference')
                  : `${t('Tooltip.Hangup')}`
            }
          >
            <FontAwesomeIcon className='pi-rotate-135 pi-h-6 pi-w-6' icon={faPhone} />
            {transferring && description && (
              <motion.div
                style={{ height: '17px' }}
                className='pi-whitespace-nowrap pi-overflow-hidden'
              >
                {description}
              </motion.div>
            )}
          </Button>
          {showSecondaryControls && (
            <Button
              variant={buttonsVariant}
              onClick={() => closeSideViewOpenSettings()}
              data-tooltip-id='tooltip-settings-view'
              data-tooltip-content={t('Tooltip.Go to settings') || ''}
              className={`${transferring && description
                ? 'pi-ml-5'
                : useCompactLayout
                  ? 'pi-absolute pi-right-0 pi-top-0 pi-justify-end'
                  : 'pi-justify-end pi-ml-16'
                } pi-flex pi-items-center`}
            >
              <FontAwesomeIcon icon={faGear} className={`pi-h-6 pi-w-6`} />
            </Button>
          )}
        </motion.div>
      </div>
      <CustomThemedTooltip className='pi-z-20' id='tooltip-left-transfer' place='left' />
      <CustomThemedTooltip className='pi-z-20' id='tooltip-top-transfer' place='top' />
      <CustomThemedTooltip className='pi-z-20' id='tooltip-open-close-phone-island' place='right' />
      <CustomThemedTooltip className='pi-z-20' id='tooltip-settings-view' place='left' />
      <CustomThemedTooltip className='pi-z-20' id='tooltip-toggle-fullscreen-hangup' place='top' />
    </>
  )
}

export default Hangup

interface HangupProps {
  clickCallback?: () => void
  isDestination?: boolean
  description?: any
  isPhysicalRecording?: boolean
  buttonsVariant?:
  | 'transparent'
  | 'default'
  | 'red'
  | 'green'
  | 'neutral'
  | 'transparentSideView'
  | 'transparentSettings'
  showFullscreenButton?: boolean
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  isExtraLarge?: boolean
  onToggleExtraLarge?: () => void
}
