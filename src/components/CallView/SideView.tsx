import React, { FC } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpRightFromSquare, faDisplay, faRecordVinyl,faVideo } from '@fortawesome/free-solid-svg-icons'
import { faArrowsRepeat } from '@nethesis/nethesis-solid-svg-icons'

const SideView: FC<SideViewTypes> = ({ isVisible }) => {
  const dispatch = useDispatch<Dispatch>()
  const { isOpen } = useSelector((state: RootState) => state.island)

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
            <Button variant='transparentSettings'>
              <FontAwesomeIcon className='pi-h-5 pi-w-5' icon={faRecordVinyl} />
              
            </Button>
            <Button variant='transparentSettings'>
              <FontAwesomeIcon className='pi-h-5 pi-w-5' icon={faVideo} />
            </Button>
            <Button variant='transparentSettings'>
              <FontAwesomeIcon className='pi-h-5 pi-w-5' icon={faArrowsRepeat} />
            </Button>
            <Button variant='transparentSettings'>
              <FontAwesomeIcon className='pi-h-5 pi-w-5' icon={faArrowUpRightFromSquare} />
            </Button>
            <Button variant='transparentSettings'>
              <FontAwesomeIcon className='pi-h-5 pi-w-5' icon={faDisplay} />
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
