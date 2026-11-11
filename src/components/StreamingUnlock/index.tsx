// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
import type { ITooltip } from 'react-tooltip'
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
 * The result of the opening replaces the name of its gate, or (one gate) is shown in a small
 * message attached to the button.
 * DTMF gates are sent by the PBX into the call: until the call is answered they look disabled
 * and only show a hint (the tones would get lost).
 * With a gatesContainer (the compact incoming call layout) the labelled gates and the results
 * are shown in that element, a row of their own, and the button becomes the close button.
 */
export const StreamingUnlock: FC<StreamingUnlockProps> = ({
  source,
  size = 'small',
  tooltipId,
  tooltipPlace = 'left',
  feedbackPlacement = 'below',
  onChoose,
  onChooserChange,
  gatesContainer,
}) => {
  const { t } = useTranslation()
  const gates = getVideoSourceGates(source)
  const callAnswered = useSelector((state: RootState) => state.currentCall.accepted)
  const [choosing, setChoosing] = useState(false)
  const [pendingGate, setPendingGate] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // width of the pressed gate: its result keeps it, the row does not jump
  const pressedWidth = useRef<number | undefined>(undefined)
  const mounted = useRef(true)
  // the gates and the results go in the gatesContainer row
  const rowMode = gatesContainer !== undefined
  const rowOpen = choosing || (rowMode && feedback !== null)

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
    onChooserChange?.(rowOpen)
  }, [rowOpen])

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
      // the single button already shows the hint in its tooltip
      if (!choosing && tooltipId) return
      showFeedback({ gateId: gate.id, ok: false, hint: true, message: answerToOpen })
      return
    }
    setPendingGate(gate.id)
    setFeedback(null)
    try {
      await openStreamingGate(source.id, gate.id)
      if (!mounted.current) return
      // the PBX only sends the command: whether the door opened is unknown
      showFeedback({ gateId: gate.id, ok: true, message: t('VideoStreaming.Command sent') })
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
  // gates without a name are "Door", numbered by position when there are several of them
  const unnamedGates = gates.filter((gate) => !gate.name)
  const unnamedNumber = (gate: VideoSourceGateType) =>
    unnamedGates.length > 1 ? unnamedGates.indexOf(gate) + 1 : 0
  const gateName = (gate: VideoSourceGateType) =>
    gate.name ||
    (unnamedNumber(gate)
      ? t('VideoStreaming.Door number', { number: unnamedNumber(gate) })
      : t('VideoStreaming.Door'))
  // "Open <name>", or "Open door" ("Open door 2") for a gate without a name
  const openLabel = (gate: VideoSourceGateType) =>
    gate.name
      ? t('VideoStreaming.Open gate name', { name: gate.name })
      : unnamedNumber(gate)
      ? t('VideoStreaming.Open door number', { number: unnamedNumber(gate) })
      : t('VideoStreaming.Open door')
  const gateTitle = (gate: VideoSourceGateType) =>
    needsAnswer(gate) ? answerToOpen : openLabel(gate)
  // chooser gates: the full name (the label may be truncated) and what a click does
  const gateTooltip = (gate: VideoSourceGateType) =>
    needsAnswer(gate) ? `${gateName(gate)}: ${answerToOpen}` : openLabel(gate)
  const gatesTooltipId = `${tooltipId || 'tooltip-streaming-unlock'}-gates`
  // not the disabled attribute: the hint must still show on hover and on click
  const waitingClasses = '!pi-opacity-40 !pi-cursor-not-allowed'

  // centred on the single button, not at the edge of the bar
  const feedbackClasses = `pi-left-1/2 -pi-translate-x-1/2 ${
    feedbackPlacement === 'above' ? 'pi-bottom-full pi-mb-2' : 'pi-top-full pi-mt-2'
  }`
  const feedbackColors = (shown: Feedback) =>
    shown.ok
      ? 'pi-bg-green-600 pi-text-white dark:pi-bg-green-400 dark:pi-text-gray-950'
      : shown.hint
      ? 'pi-bg-gray-700 pi-text-white dark:pi-bg-gray-200 dark:pi-text-gray-950'
      : 'pi-bg-red-600 pi-text-white dark:pi-bg-red-400 dark:pi-text-gray-950'
  const feedbackAttributes = (shown: Feedback) => ({
    role: shown.ok || shown.hint ? 'status' : 'alert',
    'data-streaming-unlock-feedback': shown.ok ? 'ok' : shown.hint ? 'hint' : 'error',
  })
  const closeChooser = () => {
    setChoosing(false)
    setFeedback(null)
  }

  const gateButtons = (
    <div
      className={`pi-flex pi-min-w-0 pi-items-center pi-gap-1.5 ${
        rowMode
          ? 'pi-w-full pi-overflow-x-auto pi-scrollbar-none'
          : size === 'large'
          ? // answered call bar: the room left by the other buttons, more lines if needed
            'pi-max-w-full pi-flex-wrap pi-justify-center'
          : 'pi-max-w-[18rem] pi-overflow-x-auto pi-scrollbar-none'
      }`}
    >
      {gates.map((gate) => {
        // the result replaces the name of its gate
        const result = feedback?.gateId === gate.id ? feedback : null
        // over the picture the result may be truncated: the full text in the tooltip
        const resultTooltip = result && !rowMode
        return (
          <button
            key={gate.id}
            type='button'
            data-stop-propagation={true}
            data-streaming-gate={gate.id}
            onClick={(event) => {
              pressedWidth.current = event.currentTarget.offsetWidth
              openGate(gate)
            }}
            disabled={pendingGate !== null}
            aria-disabled={needsAnswer(gate) ? true : undefined}
            data-tooltip-id={result && !resultTooltip ? undefined : gatesTooltipId}
            data-tooltip-content={
              result ? (resultTooltip ? result.message : undefined) : gateTooltip(gate)
            }
            style={resultTooltip ? { minWidth: pressedWidth.current } : undefined}
            className={`${
              needsAnswer(gate) ? (result ? '!pi-cursor-not-allowed' : waitingClasses) : ''
            } pi-flex pi-flex-shrink-0 pi-items-center pi-justify-center pi-gap-1.5 pi-rounded-full pi-px-3 ${
              size === 'large' ? 'pi-h-12' : 'pi-h-10'
            } pi-text-xs pi-font-medium ${
              result
                ? feedbackColors(result)
                : 'pi-bg-phoneIslandActive dark:pi-bg-phoneIslandActiveDark hover:pi-bg-gray-500 dark:hover:pi-bg-gray-50 pi-text-primaryInvert dark:pi-text-primaryInvertDark'
            } pi-transition-colors pi-duration-200 disabled:pi-cursor-not-allowed focus:pi-outline-none focus:pi-ring-2 focus:pi-ring-emerald-500 dark:focus:pi-ring-emerald-300`}
          >
            <FontAwesomeIcon
              className={`pi-h-3.5 pi-w-3.5 ${result ? '' : gateIconClass(gate.id)}`}
              icon={gateIcon(gate.id, faUnlock)}
            />
            {result ? (
              <span
                className={`${rowMode ? 'pi-max-w-[16rem]' : 'pi-max-w-[9rem]'} pi-truncate`}
                {...feedbackAttributes(result)}
              >
                {result.message}
              </span>
            ) : (
              <span className='pi-max-w-[9rem] pi-truncate'>{gateName(gate)}</span>
            )}
          </button>
        )
      })}
    </div>
  )

  return (
    <div
      className='pi-relative pi-flex pi-min-w-0 pi-items-center pi-gap-1.5'
      data-stop-propagation={true}
    >
      {rowMode && choosing ? (
        <Button
          variant='default'
          onClick={closeChooser}
          aria-label={t('Common.Close') || 'Close'}
          data-streaming-unlock='close'
          data-tooltip-id={tooltipId}
          data-tooltip-content={t('Common.Close') || 'Close'}
        >
          <FontAwesomeIcon className={iconSize} icon={faXmark} />
        </Button>
      ) : !choosing ? (
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
          aria-label={
            gates.length === 1 ? openLabel(gates[0]) : t('VideoStreaming.Open door') || 'Open door'
          }
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
          {gateButtons}
          {/* a filled round button like the others: visible on any picture */}
          <Button
            variant='default'
            className={`pi-flex-shrink-0 ${size === 'large' ? '' : '!pi-h-10 !pi-w-10'}`}
            onClick={closeChooser}
            aria-label={t('Common.Close') || 'Close'}
            data-streaming-unlock='close'
            data-tooltip-id={tooltipId}
            data-tooltip-content={t('Common.Close') || 'Close'}
          >
            <FontAwesomeIcon className={iconSize} icon={faXmark} />
          </Button>
        </>
      )}

      {feedback && !rowMode && !choosing && (
        <div
          {...feedbackAttributes(feedback)}
          className={`pi-absolute ${feedbackClasses} pi-z-20 pi-max-w-[16rem] pi-whitespace-nowrap pi-truncate pi-rounded-md pi-px-2.5 pi-py-1 pi-text-xs pi-font-medium pi-shadow-md ${feedbackColors(
            feedback,
          )}`}
        >
          {feedback.message}
        </div>
      )}
      {/* the row: the gates to choose from, or the result of the single gate under its button */}
      {gatesContainer &&
        rowOpen &&
        createPortal(
          <div className='pi-flex pi-w-full pi-min-w-0 pi-items-center' data-stop-propagation={true}>
            {choosing
              ? gateButtons
              : feedback && (
                  <div
                    {...feedbackAttributes(feedback)}
                    className={`pi-ml-auto pi-flex pi-h-8 pi-max-w-full pi-items-center pi-gap-1.5 pi-rounded-full pi-px-3 pi-text-xs pi-font-medium ${feedbackColors(
                      feedback,
                    )}`}
                  >
                    <FontAwesomeIcon
                      className='pi-h-3.5 pi-w-3.5 pi-flex-shrink-0'
                      icon={feedback.ok ? faCheck : faTriangleExclamation}
                    />
                    <span className='pi-truncate'>{feedback.message}</span>
                  </div>
                )}
          </div>,
          gatesContainer,
        )}
      {tooltipId && <CustomThemedTooltip className='pi-z-20' id={tooltipId} place={tooltipPlace} />}
      {/* over the picture, never over the call buttons: below the gates row, above the bar */}
      {gates.length > 1 && (
        <CustomThemedTooltip
          className='pi-z-20'
          id={gatesTooltipId}
          place={rowMode || feedbackPlacement === 'below' ? 'bottom' : 'top'}
          maxWidth='260px'
        />
      )}
    </div>
  )
}

export interface StreamingUnlockProps {
  source: VideoSourceType
  size?: 'small' | 'large'
  tooltipId?: string
  tooltipPlace?: ITooltip['place']
  // where the result message appears, relative to the buttons
  feedbackPlacement?: 'above' | 'below'
  // called when the gate chooser opens (e.g. to expand a collapsed island to make room)
  onChoose?: () => void
  // called when the gate chooser opens or closes (e.g. to give it the room of the caller name)
  onChooserChange?: (open: boolean) => void
  // element where the gates and the results are shown (a row below the buttons): the
  // chooser then never squeezes the buttons, null while the element is not mounted yet
  gatesContainer?: HTMLElement | null
}

export default StreamingUnlock
