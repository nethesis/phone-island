import React, { FC, memo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Button } from '../../Button'

interface SideViewButtonProps {
  onClick: () => void
  tooltipId: string
  tooltipContent: string
  icon: IconDefinition
  active?: boolean
  disabled?: boolean
}

export const SideViewButton: FC<SideViewButtonProps> = memo(({
  onClick,
  tooltipId,
  tooltipContent,
  icon,
  active = false,
  disabled = false,
}) => {
  return (
    <Button
      active={active}
      data-stop-propagation={true}
      variant='transparentSideView'
      onClick={onClick}
      data-tooltip-id={tooltipId}
      data-tooltip-content={tooltipContent}
      disabled={disabled}
      className={disabled ? 'pi-cursor-auto' : ''}
    >
      <FontAwesomeIcon icon={icon} className='pi-h-5 pi-w-5' />
    </Button>
  )
})

SideViewButton.displayName = 'SideViewButton'
