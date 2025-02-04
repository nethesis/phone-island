import React, { FC } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowUpRightFromSquare,
  faDisplay,
  faVideo,
} from '@fortawesome/free-solid-svg-icons'
import { faArrowsRepeat, faRecord } from '@nethesis/nethesis-solid-svg-icons'

const SideView: FC<SideViewTypes> = ({ isVisible }) => {
  const dispatch = useDispatch<Dispatch>()
  const { isOpen } = useSelector((state: RootState) => state.island)

  const closeSideViewAndLaunchEvent = (viewType: any) => {
    dispatch.island.toggleSideViewVisible(false)
    if (viewType !== null) {
      dispatch.island.setIslandView(viewType)
    }
  }

  return (
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
          }}
          initial={{ x: 0 }}
          animate={{ x: 4 }}
          exit={{
            x: 0,
            transitionEnd: {
              display: 'none',
            },
          }}
          transition={{ duration: 0 }}
        >
          <div className='pi-flex pi-flex-col pi-items-center pi-gap-3.5 pi-flex-1 pi-ml-[2.2rem]'>
            {/* Recording button */}
            <Button variant='transparentSettings'>
              <FontAwesomeIcon className='pi-h-5 pi-w-5 pi-text-white' icon={faRecord} />
            </Button>
            {/* Video button */}
            <Button
              variant='transparentSettings'
              onClick={() => closeSideViewAndLaunchEvent('video')}
            >
              <FontAwesomeIcon className='pi-h-5 pi-w-5 pi-text-white' icon={faVideo} />
            </Button>
            {/* Switch device button */}
            <Button variant='transparentSettings'>
              <FontAwesomeIcon className='pi-h-5 pi-w-5 pi-text-white' icon={faArrowsRepeat} />
            </Button>
            {/* Share button */}
            <Button variant='transparentSettings'>
              <FontAwesomeIcon
                className='pi-h-5 pi-w-5 pi-text-white'
                icon={faArrowUpRightFromSquare}
              />
            </Button>
            <Button variant='transparentSettings'>
              <FontAwesomeIcon className='pi-h-5 pi-w-5 pi-text-white' icon={faDisplay} />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SideView

interface SideViewTypes {
  isVisible: boolean
}
