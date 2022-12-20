// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC, ReactNode, ComponentPropsWithRef } from 'react'

interface ButtonProps extends ComponentPropsWithRef<'button'> {
  children: ReactNode
  variant: 'red' | 'green' | 'default' | 'neutral'
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export const Button: FC<ButtonProps> = ({ children, variant, ...props }) => {
  const styles = {
    base: 'flex content-center items-center justify-center font-medium tracking-wide transition-colors duration-200 transform focus:outline-none focus:ring-2 focus:z-20 focus:ring-offset-2 disabled:opacity-75 text-white border border-transparent focus:ring-offset-black rounded-full text-sm leading-4 h-12 w-12 col-start-auto',
    variant: {
      red: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      default: 'bg-gray-700 hover:bg-gray-800 focus:ring-gray-600',
      neutral: 'bg-transparent hover:bg-gray-500 border border-gray-600 focus:ring-0',
    },
  }

  return (
    <button data-stop-propagation={true} className={classNames(styles.base, variant && styles.variant[variant])} {...props}>
      {children}
    </button>
  )
}
