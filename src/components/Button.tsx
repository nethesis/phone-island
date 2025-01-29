// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC, ReactNode, ComponentPropsWithRef } from 'react'
import { classNames } from '../utils'

interface ButtonProps extends ComponentPropsWithRef<'button'> {
  children: ReactNode
  variant: 'red' | 'green' | 'default' | 'neutral' | 'transparent' | 'transparentSettings'
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
    base: 'pi-flex pi-font-light pi-content-center pi-items-center pi-justify-center pi-tracking-wide pi-duration-200 pi-transform pi-outline-none focus:pi-ring-2 focus:pi-z-20 focus:pi-ring-offset-2 disabled:pi-opacity-75 pi-border pi-border-transparent focus:pi-ring-offset-white dark:focus:pi-ring-offset-black pi-text-sm pi-leading-4 pi-col-start-auto pi-transition-color pi-shrink-0',
    variant: {
      red: 'dark:pi-bg-red-500 pi-bg-red-700 hover:pi-bg-red-700 dark:hover:pi-bg-red-300 focus:pi-ring-emerald-500 dark:focus:ring-emerald-300 pi-text-white dark:pi-text-gray-950 pi-h-12 pi-w-12 pi-rounded-full',
      green:
        'pi-bg-green-700 dark:pi-bg-green-500 hover:pi-bg-green-600 dark:hover:pi-bg-green-300 focus:pi-ring-green-500 focus:dark:pi-ring-200 pi-text-white dark:pi-text-gray-950 pi-h-12 pi-w-12 pi-rounded-full',
      default:
        'hover:pi-bg-gray-500 dark:hover:pi-bg-gray-50 focus:pi-ring-emerald-500 dark:focus:pi-ring-emerald-300 pi-text-white dark:pi-text-gray-950 pi-h-12 pi-w-12 pi-rounded-full',
      neutral:
        'pi-bg-transparent enabled:hover:pi-bg-gray-500 enabled:hover:pi-border-gray-500 pi-border pi-border-gray-700 focus:pi-ring-0 pi-h-12 pi-w-12 pi-rounded-full',
      transparent:
        'pi-bg-transparent dark:enabled:hover:pi-bg-gray-600/30 enabled:hover:pi-bg-gray-200/70 focus:pi-ring-offset-gray-200 dark:focus:pi-ring-gray-500 dark:focus:pi-ring-gray-500 focus:pi-ring-gray-400 dark:pi-text-white pi-h-12 pi-w-12 pi-rounded-full',
      transparentSettings:
        'pi-bg-transparent dark:enabled:hover:pi-bg-gray-600/30 enabled:hover:pi-bg-gray-200/70 focus:pi-ring-offset-gray-200 dark:focus:pi-ring-gray-500 dark:focus:pi-ring-gray-500 focus:pi-ring-gray-400 dark:pi-text-white pi-h-8 pi-w-8 pi-rounded',
    },
    background: {
      base: {
        default: 'pi-bg-gray-700 dark:pi-bg-gray-300',
      },
      active: {
        default: 'pi-bg-gray-500 dark:pi-bg-gray-50',
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
