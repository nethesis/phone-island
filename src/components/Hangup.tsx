// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { motion } from 'framer-motion/dist/framer-motion'
import { Button } from './Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhone } from '@nethesis/nethesis-solid-svg-icons'
import { hangupCurrentCall } from '../lib/phone/call'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { Dispatch } from '../store'
import { Tooltip } from 'react-tooltip/dist/react-tooltip.min.cjs'
import { hangupAllExtensions } from '../lib/phone/call'

/**
 * Return the status of the
 */
const Hangup: FC<HangupProps> = ({ clickCallback, isDestination, description }) => {
  const { transferring, incoming } = useSelector((state: RootState) => state.currentCall)
  const dispatch = useDispatch<Dispatch>()

  function handleHangup() {
    if (incoming) {
      hangupAllExtensions()
    } else {
      hangupCurrentCall()
    }
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

  return (
    <>
      <div className={`pi-flex pi-justify-center ${transferring && 'pi-w-full'}`}>
        {/* The button to hangup the currentCall */}
        <motion.div className={`${transferring && description ? 'pi-w-full' : 'pi-w-12'}`}>
          <Button
            onClick={() => handleHangup()}
            variant='red'
            className='pi-gap-4 pi-font-medium pi-text-base pi-transition pi-min-w-12 pi-w-full'
            data-tooltip-id='tooltip'
            data-tooltip-content={description && transferring ? description : 'Hangup'}
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
        </motion.div>
      </div>
      <Tooltip className='pi-z-20' id='tooltip' place='bottom' />
    </>
  )
}

export default Hangup

interface HangupProps {
  clickCallback?: () => void
  isDestination?: boolean
  description?: string
}
