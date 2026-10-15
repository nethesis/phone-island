// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, memo, useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faCopy, faEllipsis } from '@fortawesome/free-solid-svg-icons'
import { RootState } from '../../store'
import { CustomThemedTooltip } from '../CustomThemedTooltip'

const NUMBER_POPOVER_ID = 'tooltip-number-popover'
const COPIED_FEEDBACK_MS = 2000

const copyWithTextarea = (text: string): boolean => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-1000px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  let copied = false
  try {
    copied = document.execCommand('copy')
  } catch (error) {
    copied = false
  }
  document.body.removeChild(textarea)
  return copied
}

const copyToClipboard = async (text: string): Promise<boolean> => {
  if (navigator?.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      return copyWithTextarea(text)
    }
  }
  return copyWithTextarea(text)
}

const NumberPopover: FC = () => {
  const { t } = useTranslation()
  const { number } = useSelector((state: RootState) => state.currentCall)
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    setCopied(false)
  }, [number])

  const handleCopy = useCallback(async () => {
    if (!number) return
    const success = await copyToClipboard(number)
    if (!success || !isMountedRef.current) return
    setCopied(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) setCopied(false)
    }, COPIED_FEEDBACK_MS)
  }, [number])

  if (!number) return null

  return (
    <span className='pi-inline-flex pi-flex-none pi-items-center' data-stop-propagation={true}>
      <button
        type='button'
        className='pi-inline-flex pi-flex-none pi-items-center pi-justify-center pi-h-6 pi-w-6 pi--m-1 pi-p-1 pi-rounded-md pi-bg-transparent pi-text-gray-700 dark:pi-text-gray-200 hover:pi-bg-gray-200/70 dark:hover:pi-bg-gray-700/70 focus:pi-outline-none focus-visible:pi-ring-2 focus-visible:pi-ring-emerald-500'
        data-tooltip-id={NUMBER_POPOVER_ID}
        data-stop-propagation={true}
        aria-label={t('Call.Show number') || ''}
      >
        <FontAwesomeIcon icon={faEllipsis} className='pi-h-4 pi-w-4' data-stop-propagation={true} />
      </button>
      <CustomThemedTooltip
        id={NUMBER_POPOVER_ID}
        place='bottom'
        openOnClick
        clickable
        globalCloseEvents={{ clickOutsideAnchor: true, escape: true }}
      >
        <div className='pi-flex pi-items-center pi-gap-2' data-stop-propagation={true}>
          <span className='pi-whitespace-nowrap' data-stop-propagation={true}>
            {number}
          </span>
          <button
            type='button'
            onClick={handleCopy}
            className={`pi-inline-flex pi-items-center pi-justify-center pi-h-4 pi-w-4 pi-p-0 pi-bg-transparent focus:pi-outline-none ${
              copied ? 'pi-text-inherit' : 'pi-text-emerald-500 dark:pi-text-emerald-700'
            }`}
            data-stop-propagation={true}
            aria-label={(copied ? t('Call.Copied') : t('Call.Copy number')) || ''}
          >
            <FontAwesomeIcon
              icon={copied ? faCheck : faCopy}
              className='pi-h-4 pi-w-4'
              data-stop-propagation={true}
            />
          </button>
        </div>
      </CustomThemedTooltip>
    </span>
  )
}

export default memo(NumberPopover)
