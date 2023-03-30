// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { motion } from 'framer-motion/dist/framer-motion'
import { Button } from './Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhone } from '@nethesis/nethesis-solid-svg-icons'
import { hangupCurrentCall } from '../lib/phone/call'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

/**
 * Return the status of the
 */
const Hangup: FC<HangupProps> = ({ clickCallback, isDestination }) => {
  const { view } = useSelector((state: RootState) => state.island)
  const { transferring } = useSelector((state: RootState) => state.currentCall)

  return (
    <div className={`pi-flex pi-justify-center ${transferring && 'pi-w-full'}`}>
      {/* The button to hangup the currentCall */}
      <motion.div
        className={`${transferring && 'pi-w-full'}`}
        animate={
          transferring || isDestination
            ? { width: view === 'transfer' ? '360px' : view === 'keypad' ? '290px' : '300px' }
            : { width: transferring ? '100%' : '48px' }
        }
      >
        <Button
          onClick={() =>
            (transferring || isDestination) && clickCallback ? clickCallback() : hangupCurrentCall()
          }
          variant='red'
          className='pi-gap-4 pi-font-medium pi-text-base pi-transition pi-min-w-12 pi-w-full'
        >
          <FontAwesomeIcon className='pi-rotate-135 pi-h-6 pi-w-6' icon={faPhone} />
          {(transferring || isDestination) && (
            <motion.div
              style={{ height: '17px' }}
              className='pi-whitespace-nowrap pi-overflow-hidden'
            >
              Hangup and transfer
            </motion.div>
          )}
        </Button>
      </motion.div>
    </div>
  )
}

export default Hangup

interface HangupProps {
  clickCallback?: () => void
  isDestination?: boolean
}
