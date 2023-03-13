// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC, ReactNode, ComponentPropsWithRef } from 'react'
import { classNames } from '../utils'

interface ButtonProps extends ComponentPropsWithRef<'button'> {
  children: ReactNode
  variant: 'red' | 'green' | 'default' | 'neutral' | 'transparent'
  active?: boolean
}

export const Button: FC<ButtonProps> = ({ children, variant, active = false, className = '', ...props }) => {
  const styles = {
    base: 'flex font-sans font-light content-center items-center justify-center tracking-wide duration-200 transform outline-none focus:ring-2 focus:z-20 focus:ring-offset-2 disabled:opacity-75 text-white border border-transparent focus:ring-offset-black rounded-full text-sm leading-4 h-12 w-12 col-start-auto transition-color shrink-0',
    variant: {
      red: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      default: 'hover:bg-gray-500 focus:ring-gray-500',
      neutral:
        'bg-transparent hover:bg-gray-500 hover:border-gray-500 border border-gray-700 focus:ring-0',
      transparent: 'bg-transparent hover:bg-gray-500 focus:ring-gray-500',
    },
    background: {
      base: {
        default: 'bg-gray-700',
      },
      active: {
        default: 'bg-gray-500',
      },
    },
  }

  return (
    <>
      <button
        data-stop-propagation={true}
        className={classNames(
          active && styles.background.active[variant]
            ? styles.background.active[variant]
            : styles.background.base[variant] && styles.background.base[variant],
          styles.base,
          variant && styles.variant[variant],
          className && className
        )}
        {...props}
      >
        {children}
      </button>
    </>
  )
}
