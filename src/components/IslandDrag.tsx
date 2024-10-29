// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type ReactNode, FC, useState, useRef, MutableRefObject } from 'react'
import { RootState, Dispatch, store } from '../store'
import { useSelector, useDispatch } from 'react-redux'
import { motion, useDragControls } from 'framer-motion'
import { useLongPress, useLocalStorage, styleTransformValues } from '../utils'
import { xPosition, yPosition } from '../lib/island/island'

export const IslandDrag: FC<IslandDragProps> = ({ children, islandContainerRef }) => {
  const { startPosition } = useSelector((state: RootState) => state.island)

  // Initialize the moved property
  const [moved, setMoved] = useState<boolean>(false)

  // Initialize dispatch
  const dispatch = useDispatch<Dispatch>()

  // Initialize Island drag controls
  const controls = useDragControls()

  // Initialize Island storage
  const [phoneIslandStorage, setPhoneIslandStorage] =
    useLocalStorage<PhoneIslandStorageTypes | null>('phone-island', null)

  // The Island reference
  const islandRef = useRef<any>(null)

  // Initialize position or get from storage
  const [position, setPosition] = useState<PositionTypes | null>(
    phoneIslandStorage && phoneIslandStorage.position ? phoneIslandStorage.position : null,
  )

  // Handles the drag started event
  function handleStartDrag(event) {
    controls.start(event)
  }
  // Handles log press event
  const handleLongPress = () => {}

  // Handle Island click
  const handleIslandClick = () => {
    // Only if phone island is close is possible to open it trough the click
    const isPhoneIslandAlreadyOpen = store?.getState()?.island?.isOpen
    !isPhoneIslandAlreadyOpen && dispatch.island.handleToggleIsOpen()
  }

  // Handles drag end event
  const handleDragEnd = () => {
    // Get initial transform values
    let { x, y }: any = styleTransformValues(islandRef.current)
    // Round position
    x = xPosition(Math.round(x), islandRef.current, islandContainerRef.current)
    y = yPosition(Math.round(y), islandRef.current, islandContainerRef.current)
    // Save the new position to localstorage
    setPhoneIslandStorage({
      position: {
        x,
        y,
      },
    })
    // Set position to variable
    setPosition({
      x,
      y,
    })
  }

  // Handles drag started event
  function handleDragStarted() {
    setMoved(true)
  }

  // Initialize the longPressEvent object
  const longPressEvent = useLongPress(
    handleLongPress,
    handleIslandClick,
    moved,
    () => setMoved(false),
    {
      shouldPreventDefault: true,
      delay: 250,
    },
  )

  return (
    <motion.div
      drag
      onPointerDown={(e) => controls.start(e)}
      onDragStart={handleDragStarted}
      dragTransition={{ power: 0 }}
      initial={{
        x: position?.x || startPosition.x,
        y: position?.y || startPosition.y,
      }}
      dragControls={controls}
      dragListener={false}
      dragConstraints={islandContainerRef}
      onDragEnd={handleDragEnd}
      ref={islandRef}
      {...longPressEvent}
      className='pi-absolute'
    >
      {children && children}
    </motion.div>
  )
}

export default IslandDrag

export interface IslandDragProps {
  children: ReactNode
  islandContainerRef: MutableRefObject<HTMLDivElement>
}

interface PhoneIslandStorageTypes {
  position: PositionTypes
}

interface PositionTypes {
  x: number
  y: number
}
