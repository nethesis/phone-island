// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, ComponentProps, Fragment } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { CustomThemedTooltip } from './CustomThemedTooltip'
import { Button } from './Button'

const Dropdown: FC<DropdownProps> = ({
  items,
  buttonTooltip,
  buttonTooltipPlace = 'bottom',
  buttonContent,
}) => {
  return (
    <>
      <Menu
        as='div'
        className='pi-relative'
        data-stop-propagation={true}
        data-tooltip-id='tooltip-button'
        data-tooltip-content={buttonTooltip}
      >
        <MenuButton as='div' data-stop-propagation={true}>
          {buttonContent || (
            <Button variant='default'>
              <FontAwesomeIcon
                className='pi-h-6 pi-w-6'
                icon={faEllipsis}
                data-stop-propagation={true}
              />
            </Button>
          )}
        </MenuButton>

        <Transition
          as={Fragment}
          enter='transition ease-out duration-100'
          enterFrom='transform opacity-0 scale-95'
          enterTo='transform opacity-100 scale-100'
          leave='transition ease-in duration-75'
          leaveFrom='transform opacity-100 scale-100'
          leaveTo='transform opacity-0 scale-95'
        >
          <MenuItems
            className={`pi-right-0 pi-bottom-14 pi-max-h-48 pi-z-50 pi-absolute pi-w-56 pi-origin-top-right pi-rounded-md pi-shadow-lg pi-ring-1 dark:pi-bg-gray-950 pi-bg-gray-50 pi-ring-black pi-ring-opacity-5 pi-focus:outline-none pi-cursor-auto pi-border-gray-300 dark:pi-border-gray-600 pi-border pi-py-2 pi-overflow-y-auto pi-scrollbar-thin pi-scrollbar-thumb-gray-400 pi-dark:scrollbar-thumb-gray-400 pi-scrollbar-thumb-rounded-full pi-scrollbar-thumb-opacity-50 dark:pi-scrollbar-track-gray-900 pi-scrollbar-track-gray-200 pi-dark:scrollbar-track-gray-900 pi-scrollbar-track-rounded-full pi-scrollbar-track-opacity-25 pi-text-sm`}
            data-stop-propagation={true}
          >
            <div data-stop-propagation={true}>
              <>
                {' '}
                {items.map((item) => (
                  <MenuItem key={item.id} disabled={item.disabled}>
                    {({ active, disabled }: any) => (
                      <div
                        className={`pi-flex pi-items-center pi-p-3 ${
                          active ? 'pi-bg-gray-200 dark:pi-bg-gray-700' : ''
                        } ${
                          disabled ? 'pi-opacity-50 pi-cursor-not-allowed' : 'pi-cursor-pointer'
                        }`}
                        onClick={() => item.onClick()}
                        data-stop-propagation={true}
                      >
                        {item.icon && (
                          <FontAwesomeIcon
                            size='lg'
                            icon={item.icon}
                            className={`dark:pi-text-gray-100 pi-text-gray-600 pi-mr-2 pi-w-4 pi-h-4`}
                          />
                        )}
                        <div
                          className={`${
                            active
                              ? 'dark:pi-text-gray-50 pi-text-gray-900'
                              : 'dark:pi-text-gray-50 pi-text-gray-700'
                          }`}
                        >
                          {item.label}
                        </div>
                      </div>
                    )}
                  </MenuItem>
                ))}
              </>
            </div>
          </MenuItems>
        </Transition>
      </Menu>
      <CustomThemedTooltip id='tooltip-button' place={buttonTooltipPlace} />
    </>
  )
}

interface DropdownProps extends ComponentProps<'div'> {
  items: DropdownItem[]
  buttonTooltip?: string | null
  buttonTooltipPlace?: 'bottom' | 'top' | 'right' | 'left' | undefined
  buttonContent?: React.ReactNode
}

interface DropdownItem {
  id: string
  label: string
  onClick: () => void
  icon?: IconDefinition
  disabled?: boolean
}

export default Dropdown
