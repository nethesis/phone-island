// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC, ReactNode, ComponentPropsWithRef } from 'react'
import { classNames } from '../utils'

interface ButtonProps extends ComponentPropsWithRef<'button'> {
  children: ReactNode
  variant: 'red' | 'green' | 'default' | 'neutral' | 'transparent'
  active?: boolean
}

export const Button: FC<ButtonProps> = ({
  children,
  variant,
  active = false,
  className = '',
  ...props
}) => {
  const classes = {
    base: 'pi-flex pi-font-sans pi-font-light pi-content-center pi-items-center pi-justify-center pi-tracking-wide pi-duration-200 pi-transform pi-outline-none focus:pi-ring-2 focus:pi-z-20 focus:pi-ring-offset-2 disabled:pi-opacity-75 pi-text-white pi-border pi-border-transparent focus:pi-ring-offset-black pi-rounded-full pi-text-sm pi-leading-4 pi-h-12 pi-w-12 pi-col-start-auto pi-transition-color pi-shrink-0',
    variant: {
      red: 'pi-bg-red-600 enabled:hover:pi-bg-red-700 focus:pi-ring-red-500',
      green: 'pi-bg-green-600 enabled:hover:pi-bg-green-700 focus:pi-ring-green-500',
      default: 'enabled:hover:pi-bg-gray-500 focus:pi-ring-gray-500',
      neutral:
        'pi-bg-transparent enabled:hover:pi-bg-gray-500 enabled:hover:pi-border-gray-500 pi-border pi-border-gray-700 focus:pi-ring-0',
      transparent: 'pi-bg-transparent enabled:hover:pi-bg-gray-500 focus:pi-ring-gray-500',
    },
    background: {
      base: {
        default: 'pi-bg-gray-700',
      },
      active: {
        default: 'pi-bg-gray-500',
      },
    },
  }

  return (
    <>
      <button
        data-stop-propagation={true}
        className={classNames(
          active && classes.background.active[variant]
            ? classes.background.active[variant]
            : classes.background.base[variant] && classes.background.base[variant],
          classes.base,
          variant && classes.variant[variant],
          className && className,
        )}
        {...props}
      >
        {children}
      </button>
    </>
  )
}
