// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useMemo } from 'react'
import { Button } from '../Button'
import { useDispatch } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhone, faArrowLeft, faMobile, faHeadset } from '@fortawesome/free-solid-svg-icons'
import { clickTransferOrConference, isInsideConferenceList } from '../../lib/phone/call'
import { Dispatch } from '../../store'
import { useTranslation } from 'react-i18next'
import { CustomThemedTooltip } from '../CustomThemedTooltip'
import { PhonebookContact } from '../../types/phonebook'
import { faOfficePhone } from '@nethesis/nethesis-solid-svg-icons'

export const SelectContactNumberView: FC<SelectContactNumberViewProps> = ({ contact }) => {
  const dispatch = useDispatch<Dispatch>()
  const { t } = useTranslation()

  type PhoneNumber = {
    number: string
    type: string
  }

  const phoneNumbers = useMemo(() => {
    const phoneNumbers: PhoneNumber[] = []

    const phoneTypes = ['extension', 'workphone', 'cellphone']

    for (const type of phoneTypes) {
      const phoneNumber = contact?.[type]
      if (phoneNumber) {
        phoneNumbers.push({
          number: phoneNumber,
          type: type,
        })
      }
    }
    return phoneNumbers
  }, [contact])

  function getPhoneIcon(type: string) {
    switch (type) {
      case 'extension':
        return faHeadset
      case 'workphone':
        return faOfficePhone
      case 'cellphone':
        return faMobile
      default:
        return faPhone
    }
  }

  return (
    <>
      <div className='pi-relative pi-flex pi-flex-col'>
        {/* Top section */}
        <div className='pi-relative pi-z-50'>
          <div className='pi-flex pi-items-center pi-gap-2 pi-text-gray-900 dark:pi-text-gray-50'>
            <Button
              onClick={() => dispatch.island.setContactListView('main')}
              variant='transparent'
              data-tooltip-id='tooltip-back-to-transfer-results'
              data-tooltip-content={t('Common.Back') || ''}
            >
              <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faArrowLeft} />
            </Button>
            <h1 className='pi-text-lg pi-font-medium pi-leading-7'>
              {contact?.displayName || '-'}
            </h1>
          </div>
        </div>
        <div className='pi-z-30 pi-h-6 pi-pointer-events-none pi-bg-transparent pi-mt-7 pi-pr-4'></div>
        <div style={{ marginTop: '-22px' }} className='pi-flex pi-flex-col pi-gap-7'>
          {/* List section */}
          <div
            style={{ height: '17rem' }}
            className='pi-relative pi-w-full pi-flex pi-flex-col pi-gap-1 pi-overflow-y-auto pi-overflow-x-hidden pi-scrollbar-thin pi-scrollbar-thumb-gray-400 pi-scrollbar-thumb-rounded-full pi-scrollbar-thumb-opacity-50 dark:pi-scrollbar-track-gray-900 pi-scrollbar-track-gray-200 pi-scrollbar-track-rounded-full pi-scrollbar-track-opacity-25'
          >
            {/* Phone numbers of phonebook contact */}
            {phoneNumbers.map((phoneNumber, i) => (
              <div
                key={i}
                className='pi-flex pi-items-center pi-w-full pi-justify-between pi-px-3 pi-py-1 pi-rounded-md hover:pi-bg-gray-200 hover:dark:pi-bg-gray-800'
              >
                <div className='pi-flex pi-items-center pi-gap-4'>
                  <div className='pi-relative pi-block pi-shrink-0 pi-h-12 pi-w-12 pi-text-base pi-bg-gray-700 dark:pi-bg-gray-200 pi-rounded-full'>
                    <div className='pi-text-white dark:pi-text-gray-950 pi-w-full pi-h-full pi-fill-white pi-flex pi-justify-center pi-items-center'>
                      <FontAwesomeIcon
                        icon={getPhoneIcon(phoneNumber.type)}
                        className='pi-h-6 pi-w-6'
                        aria-hidden='true'
                      />
                    </div>
                  </div>
                  <div>
                    <div
                      style={{ maxWidth: '196px' }}
                      data-stop-propagation={true}
                      className='pi-h-fit pi-truncate pi-text-sm pi-font-medium'
                    >
                      {t(`Phone.${phoneNumber.type}`)}
                    </div>
                    <div className='pi-text-sm pi-text-gray-700 dark:pi-text-gray-300'>
                      {phoneNumber.number}
                    </div>
                  </div>
                </div>
                <div className='pi-flex pi-gap-3.5'>
                  <Button
                    onClick={() => clickTransferOrConference(phoneNumber.number, dispatch)}
                    variant='green'
                    data-tooltip-id='transfer-list-tooltip-left'
                    data-tooltip-content={
                      isInsideConferenceList()
                        ? t('Conference.Add participant')
                        : t('Tooltip.Transfer call')
                    }
                  >
                    <FontAwesomeIcon className='pi-h-6 pi-w-6' icon={faPhone} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <CustomThemedTooltip id={`tooltip-back-to-transfer-results`} place='right' />
      <CustomThemedTooltip className='pi-z-1000' id='transfer-list-tooltip-left' place='left' />
    </>
  )
}

interface SelectContactNumberViewProps {
  contact?: PhonebookContact
}
