import { store } from '../../store'
import { openVideoSource, StreamingRequestError } from '../../services/user'
import { eventDispatch } from '../genericFunctions/eventDispatch'
import { findVideoSourceByNumber, getVideoSourceGates } from './videoSource'

/**
 * Opens a gate of a video source and dispatches the result events.
 * Without a gate id the server opens the first gate (older servers have only one).
 *
 * @throws StreamingRequestError (or a network error) when the gate could not be opened
 */
export const openStreamingGate = async (sourceId: string, gateId?: string) => {
  const gate = gateId ? gateId : undefined
  try {
    await openVideoSource(gate ? { id: sourceId, gate } : { id: sourceId })
    eventDispatch('phone-island-streaming-gate-opened', { source: sourceId, gate: gate || null })
  } catch (error: any) {
    eventDispatch('phone-island-streaming-gate-open-failed', {
      source: sourceId,
      gate: gate || null,
      status: error instanceof StreamingRequestError ? error.status ?? null : null,
      code: error instanceof StreamingRequestError ? error.code ?? null : null,
      message: error?.message || '',
    })
    throw error
  }
}

/**
 * Handle streaming source unlock/door opening
 *
 * @param gateId the gate to open, the first gate of the source when omitted
 */
export const handleStreamingUnlock = async (gateId?: string | unknown) => {
  const { streamingSourceNumber } = store.getState().currentCall
  const { videoSources } = store.getState().streaming

  const source = findVideoSourceByNumber(videoSources, streamingSourceNumber)
  if (!source) return

  // also used directly as a click handler: ignore the event argument
  const requestedGate = typeof gateId === 'string' ? gateId : undefined
  const gate = requestedGate ?? getVideoSourceGates(source)[0]?.id

  try {
    await openStreamingGate(source.id, gate)
    console.debug('Door unlocked successfully')
  } catch (error) {
    console.error('Error unlocking door:', error)
  }
}
