// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { motion } from 'framer-motion/dist/framer-motion'
import { Button } from './Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhone } from '@fortawesome/free-solid-svg-icons'
import { hangupCurrentCall, hangupCurrentPhysicalRecording } from '../lib/phone/call'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { Dispatch } from '../store'
import { Tooltip } from 'react-tooltip/dist/react-tooltip.min.cjs'
import { hangupAllExtensions } from '../lib/phone/call'
import { useTranslation } from 'react-i18next'
import DropdownContent from './SwitchInputView/DropdownContent'

/**
 * Return the status of the
 */
const Hangup: FC<HangupProps> = ({ clickCallback, isDestination, description, isPhysicalRecording }) => {
  const { transferring, incoming, accepted } = useSelector((state: RootState) => state.currentCall)
  const dispatch = useDispatch<Dispatch>()
  const { isOpen } = useSelector((state: RootState) => state.island)

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
        setTimeout(() => {
          dispatch.alerts.removeAlert('call_transfered')
        }, 2000)
      }, 300)
    }
  }

  const { t } = useTranslation()

  // Phone island footer section
  return (
    <>
      <div
        className={` ${
          transferring
            ? 'pi-grid pi-w-full pi-space-x-2 pi-justify-start'
            : 'pi-flex pi-justify-center'
        }`}
      >
        {/* The button to hangup the currentCall */}
        <motion.div
          className={`${
            transferring && description
              ? 'pi-grid pi-grid-cols-[12rem,1rem] pi-ml-4 pi-justify-start'
              : 'pi-flex pi-w-12'
          } `}
        >
          <Button
            onClick={() => !isPhysicalRecording ? handleHangup() : hangupCurrentPhysicalRecording()}
            variant='red'
            className='pi-gap-4 pi-font-medium pi-text-base pi-transition pi-min-w-12 pi-w-full'
            data-tooltip-id={
              description && transferring ? 'tooltip-top-transfer' : 'tooltip-left-transfer'
            }
            data-tooltip-content={
              description && transferring ? description : `${t('Tooltip.Hangup')}`
            }
            // data-tooltip-placement="top"
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
          {isOpen && accepted && (
            <div
              className={`${
                transferring && description
                  ? 'pi-grid pi-grid-cols-1 pi-ml-8'
                  : 'pi-flex pi-items-center pi-justify-end pi-ml-16'
              }`}
            >
              <DropdownContent data-stop-propagation={true}></DropdownContent>
            </div>
          )}
        </motion.div>
      </div>
      <Tooltip className='pi-z-20' id='tooltip-left-transfer' place='left' />
      <Tooltip className='pi-z-20' id='tooltip-top-transfer' place='top' />
    </>
  )
}

export default Hangup

interface HangupProps {
  clickCallback?: () => void
  isDestination?: boolean
  description?: any
  isPhysicalRecording?: boolean
}
