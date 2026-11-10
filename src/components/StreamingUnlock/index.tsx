// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faCircleNotch,
  faLockOpen,
  faTriangleExclamation,
  faUnlock,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import { Button } from '../Button'
import { CustomThemedTooltip } from '../CustomThemedTooltip'
import type { VideoSourceGateType, VideoSourceType } from '../../models/streaming'
import { StreamingRequestError } from '../../services/user'
import { openStreamingGate } from '../../utils/streaming/streamingUtils'
import { getVideoSourceGates, isDtmfGate } from '../../utils/streaming/videoSource'

// How long the result of an opening stays visible
const SUCCESS_FEEDBACK_MS = 2000
const ERROR_FEEDBACK_MS = 5000

interface Feedback {
  gateId: string
  ok: boolean
  message: string
  // a hint (e.g. the call must be answered first), not the result of an opening
  hint?: boolean
}

/**
 * Unlock button of a video source.
 *
 * One gate: the button opens it. Several gates: the button expands in place into one small
 * labelled button per gate (no popup, so it also fits the compact incoming call layout).
 * The result of the opening is shown on the button and in a small message next to it.
 * DTMF gates are sent by the PBX into the call: until the call is answered they look disabled
 * and only show a hint (the tones would get lost).
 */
export const StreamingUnlock: FC<StreamingUnlockProps> = ({
  source,
  size = 'small',
  tooltipId,
  tooltipPlace = 'left',
  feedbackPlacement = 'below',
  onChoose,
  onChooserChange,
}) => {
  const { t } = useTranslation()
  const gates = getVideoSourceGates(source)
  const callAnswered = useSelector((state: RootState) => state.currentCall.accepted)
  const [choosing, setChoosing] = useState(false)
  const [pendingGate, setPendingGate] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    }
  }, [])

  // a different source (or a reconfigured one) closes the chooser
  useEffect(() => {
    setChoosing(false)
    setFeedback(null)
  }, [source.id])

  useEffect(() => {
    onChooserChange?.(choosing)
  }, [choosing])

  useEffect(() => () => onChooserChange?.(false), [])

  if (gates.length === 0) return null

  const answerToOpen = t('VideoStreaming.Answer the call to open')
  const needsAnswer = (gate: VideoSourceGateType) => !callAnswered && isDtmfGate(gate)

  const errorMessage = (error: any) => {
    const code = error instanceof StreamingRequestError ? error.code : undefined
    const status = error instanceof StreamingRequestError ? error.status : undefined
    if (code === 'gate_timeout' || status === 504) {
      return t('VideoStreaming.The gate did not respond in time')
    }
    if (code === 'gate_unreachable') {
      return t('VideoStreaming.The gate is unreachable')
    }
    if (code === 'call_not_answered') {
      return answerToOpen
    }
    if (status === 403) {
      return t('VideoStreaming.You are not allowed to open this gate')
    }
    return t('VideoStreaming.Unable to open the gate')
  }

  const showFeedback = (next: Feedback) => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    setFeedback(next)
    feedbackTimer.current = setTimeout(
      () => {
        feedbackTimer.current = null
        if (!mounted.current) return
        setFeedback(null)
        // a successful opening closes the chooser
        if (next.ok) setChoosing(false)
      },
      next.ok ? SUCCESS_FEEDBACK_MS : ERROR_FEEDBACK_MS,
    )
  }

  const openGate = async (gate: VideoSourceGateType) => {
    if (pendingGate !== null) return
    if (needsAnswer(gate)) {
      showFeedback({ gateId: gate.id, ok: false, hint: true, message: answerToOpen })
      return
    }
    setPendingGate(gate.id)
    setFeedback(null)
    try {
      await openStreamingGate(source.id, gate.id)
      if (!mounted.current) return
      showFeedback({ gateId: gate.id, ok: true, message: t('VideoStreaming.Opened') })
    } catch (error) {
      console.error('Error opening the gate:', error)
      if (!mounted.current) return
      showFeedback({ gateId: gate.id, ok: false, message: errorMessage(error) })
    } finally {
      if (mounted.current) setPendingGate(null)
    }
  }

  const iconSize = size === 'large' ? 'pi-h-6 pi-w-6' : 'pi-h-5 pi-w-5'
  const gateIcon = (gateId: string, base = size === 'large' ? faLockOpen : faUnlock) => {
    if (pendingGate === gateId) return faCircleNotch
    if (feedback?.gateId === gateId && !feedback.hint) {
      return feedback.ok ? faCheck : faTriangleExclamation
    }
    return base
  }
  const gateIconClass = (gateId: string) =>
    pendingGate === gateId
      ? 'pi-animate-spin'
      : feedback?.gateId === gateId && !feedback.hint
      ? feedback.ok
        ? 'pi-text-green-500 dark:pi-text-green-600'
        : 'pi-text-red-500 dark:pi-text-red-600'
      : ''
  const gateName = (gate: VideoSourceGateType) => gate.name || source.description || gate.id
  const gateTitle = (gate: VideoSourceGateType) =>
    needsAnswer(gate) ? answerToOpen : `${t('VideoStreaming.Open')}: ${gateName(gate)}`
  // not the disabled attribute: the hint must still show on hover and on click
  const waitingClasses = '!pi-opacity-40 !pi-cursor-not-allowed'

  const feedbackClasses =
    feedbackPlacement === 'above' ? 'pi-bottom-full pi-mb-2' : 'pi-top-full pi-mt-2'

  return (
    <div
      className='pi-relative pi-flex pi-min-w-0 pi-items-center pi-gap-1.5'
      data-stop-propagation={true}
    >
      {!choosing ? (
        <Button
          variant='default'
          onClick={() => {
            if (gates.length === 1) {
              openGate(gates[0])
            } else {
              onChoose?.()
              setChoosing(true)
            }
          }}
          disabled={pendingGate !== null}
          aria-label={t('VideoStreaming.Open door') || 'Open door'}
          aria-disabled={gates.length === 1 && needsAnswer(gates[0]) ? true : undefined}
          className={gates.length === 1 && needsAnswer(gates[0]) ? waitingClasses : ''}
          data-streaming-unlock={gates.length === 1 ? 'single' : 'multiple'}
          data-tooltip-id={tooltipId}
          data-tooltip-content={
            gates.length === 1
              ? gateTitle(gates[0])
              : t('VideoStreaming.Choose the gate to open') || ''
          }
        >
          <FontAwesomeIcon
            className={`${iconSize} ${gates.length === 1 ? gateIconClass(gates[0].id) : ''}`}
            icon={
              gates.length === 1 ? gateIcon(gates[0].id) : size === 'large' ? faLockOpen : faUnlock
            }
          />
        </Button>
      ) : (
        <>
          <div className='pi-flex pi-min-w-0 pi-items-center pi-gap-1.5 pi-max-w-[18rem] pi-overflow-x-auto pi-scrollbar-none'>
            {gates.map((gate) => (
              <button
                key={gate.id}
                type='button'
                data-stop-propagation={true}
                data-streaming-gate={gate.id}
                onClick={() => openGate(gate)}
                disabled={pendingGate !== null}
                aria-disabled={needsAnswer(gate) ? true : undefined}
                title={gateTitle(gate)}
                className={`${
                  needsAnswer(gate) ? waitingClasses : ''
                } pi-flex pi-flex-shrink-0 pi-items-center pi-gap-1.5 pi-rounded-full pi-px-3 ${
                  size === 'large' ? 'pi-h-12 pi-text-sm' : 'pi-h-10 pi-text-xs'
                } pi-font-medium pi-bg-phoneIslandActive dark:pi-bg-phoneIslandActiveDark hover:pi-bg-gray-500 dark:hover:pi-bg-gray-50 pi-text-primaryInvert dark:pi-text-primaryInvertDark pi-transition-colors pi-duration-200 disabled:pi-cursor-not-allowed focus:pi-outline-none focus:pi-ring-2 focus:pi-ring-emerald-500 dark:focus:pi-ring-emerald-300`}
              >
                <FontAwesomeIcon
                  className={`pi-h-3.5 pi-w-3.5 ${gateIconClass(gate.id)}`}
                  icon={gateIcon(gate.id, faUnlock)}
                />
                <span className='pi-max-w-[7rem] pi-truncate'>{gateName(gate)}</span>
              </button>
            ))}
          </div>
          <Button
            variant='transparent'
            className={size === 'large' ? '!pi-h-10 !pi-w-10' : '!pi-h-8 !pi-w-8'}
            onClick={() => {
              setChoosing(false)
              setFeedback(null)
            }}
            aria-label={t('Common.Close') || 'Close'}
            data-tooltip-id={tooltipId}
            data-tooltip-content={t('Common.Close') || 'Close'}
          >
            <FontAwesomeIcon className='pi-h-4 pi-w-4' icon={faXmark} />
          </Button>
        </>
      )}

      {feedback && (
        <div
          role={feedback.ok || feedback.hint ? 'status' : 'alert'}
          data-streaming-unlock-feedback={feedback.ok ? 'ok' : feedback.hint ? 'hint' : 'error'}
          className={`pi-absolute pi-right-0 ${feedbackClasses} pi-z-20 pi-max-w-[16rem] pi-whitespace-nowrap pi-truncate pi-rounded-md pi-px-2.5 pi-py-1 pi-text-xs pi-font-medium pi-shadow-md ${
            feedback.ok
              ? 'pi-bg-green-600 pi-text-white dark:pi-bg-green-400 dark:pi-text-gray-950'
              : feedback.hint
              ? 'pi-bg-gray-700 pi-text-white dark:pi-bg-gray-200 dark:pi-text-gray-950'
              : 'pi-bg-red-600 pi-text-white dark:pi-bg-red-400 dark:pi-text-gray-950'
          }`}
        >
          {feedback.message}
        </div>
      )}
      {tooltipId && <CustomThemedTooltip className='pi-z-20' id={tooltipId} place={tooltipPlace} />}
    </div>
  )
}

export interface StreamingUnlockProps {
  source: VideoSourceType
  size?: 'small' | 'large'
  tooltipId?: string
  tooltipPlace?: 'top' | 'right' | 'bottom' | 'left'
  // where the result message appears, relative to the buttons
  feedbackPlacement?: 'above' | 'below'
  // called when the gate chooser opens (e.g. to expand a collapsed island to make room)
  onChoose?: () => void
  // called when the gate chooser opens or closes (e.g. to give it the room of the caller name)
  onChooserChange?: (open: boolean) => void
}

export default StreamingUnlock
