// src/components/CustomThemedTooltip.tsx
import React, { FC, ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { Tooltip, type ITooltip } from 'react-tooltip'

interface CustomThemedTooltipProps {
  id: string
  place?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
  openOnClick?: boolean
  clickable?: boolean
  globalCloseEvents?: ITooltip['globalCloseEvents']
  offset?: number
  maxWidth?: string
  children?: ReactNode
}

export const CustomThemedTooltip: FC<CustomThemedTooltipProps> = ({
  id,
  place = 'bottom',
  className = '',
  openOnClick,
  clickable,
  globalCloseEvents,
  offset,
  maxWidth = '185px',
  children,
}) => {
  const { theme } = useSelector((state: RootState) => state.darkTheme)

  const tooltipStyle =
    theme === 'dark'
      ? {
          backgroundColor: 'rgb(243, 244, 246)',
          color: 'rgb(17, 24, 39)',
          fontSize: '0.875rem',
          fontWeight: 400,
          lineHeight: '1.25rem',
          padding: '0.375rem 0.625rem',
          maxWidth,
          borderRadius: '4px',
        }
      : {
          backgroundColor: 'rgb(31, 41, 55)',
          color: 'rgb(249, 250, 251)',
          fontSize: '0.875rem',
          fontWeight: 400,
          lineHeight: '1.25rem',
          padding: '0.375rem 0.625rem',
          maxWidth,
          borderRadius: '4px',
        }

  return (
    <Tooltip
      id={id}
      place={place}
      className={`pi-z-1000 ${className}`}
      opacity={1}
      style={tooltipStyle}
      openOnClick={openOnClick}
      clickable={clickable}
      globalCloseEvents={globalCloseEvents}
      offset={offset}
    >
      {children}
    </Tooltip>
  )
}
