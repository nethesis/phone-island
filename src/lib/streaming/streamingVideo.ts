// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Live video sessions of the "rtsp" video sources (door intercoms).
 *
 * One WHEP session per source is shared by all the views showing it: the incoming call preview
 * and the answered streaming view may be mounted at the same time during the island transitions
 * (and twice in React strict mode), but the gateway sees a single session per call.
 *
 * The device is pulled over the customer uplink only while someone watches: the session is
 * closed when the last view releases it, after a short grace time that bridges the switch
 * between two views of the same call, or at once when the streaming call is over.
 * Sessions are only opened for the source of the current streaming call.
 */

import { store } from '../../store'
import { getStreamingToken, getWhepUrl, StreamingRequestError } from '../../services/user'
import { eventDispatch } from '../../utils/genericFunctions/eventDispatch'
import { findVideoSourceByNumber } from '../../utils/streaming/videoSource'
import { WhepPlayer, WhepPlayerState, WhepToken, WhepTokenError } from './whepPlayer'

// Bridges the island view changes of the same call (incoming preview -> answered view)
const RELEASE_GRACE_MS = 1500

export interface StreamingVideoSnapshot {
  state: WhepPlayerState
  stream: MediaStream | null
}

type Listener = (snapshot: StreamingVideoSnapshot) => void

interface Entry {
  sourceId: string
  whep: string | null
  player: WhepPlayer
  snapshot: StreamingVideoSnapshot
  listeners: Listener[]
  stopTimer: ReturnType<typeof setTimeout> | null
  // stream of a reconnection, shown once it decodes its first frame (meanwhile the views keep
  // the last frame of the previous one instead of turning black)
  pendingStream: MediaStream | null
}

export const initialStreamingVideoState: WhepPlayerState = {
  status: 'connecting',
  failure: null,
  hasAudio: false,
  hasPicture: false,
}

const entries: Record<string, Entry> = {}
// WHEP requests in flight per source, outliving the entries: the player of a new entry waits
// for those of the stopped one (e.g. its POST still in flight), one gateway session at a time
const pendingRequests: Record<string, Set<Promise<void>>> = {}
let unsubscribeStore: (() => void) | null = null

// Token provider of a source, using the CTI REST API
export const fetchStreamingToken = async (sourceId: string): Promise<WhepToken> => {
  try {
    const data = await getStreamingToken(sourceId)
    return { token: data.token, whep: data.whep, expiresIn: data.expires_in }
  } catch (error) {
    const status = error instanceof StreamingRequestError ? error.status : undefined
    const code = error instanceof StreamingRequestError ? error.code : undefined
    if (status === 403) {
      throw new WhepTokenError('streaming token forbidden', true, 'forbidden')
    }
    if (status === 429 && code === 'too_many_sessions') {
      throw new WhepTokenError('too many streaming sessions', true, 'busy')
    }
    if (status === 429) {
      // too_many_requests: retry later, with the backoff
      throw new WhepTokenError('streaming token rate limited', false, 'unreachable', true)
    }
    if (status === 400 || status === 404) {
      throw new WhepTokenError(`streaming token error ${status}`, true, 'error')
    }
    // network errors, 5xx: retry
    throw new WhepTokenError(`streaming token error ${status ?? ''}`, false, 'unreachable')
  }
}

// True while the current call is a streaming call from (or to) the given source
const isStreamingCallOf = (sourceId: string) => {
  const state = store.getState()
  if (!state.island.isFromStreaming) return false
  const source = findVideoSourceByNumber(
    state.streaming.videoSources,
    state.currentCall.streamingSourceNumber,
  )
  return source?.id === sourceId
}

const notify = (entry: Entry) => {
  entry.listeners.slice().forEach((listener) => listener(entry.snapshot))
}

const createEntry = (sourceId: string, whep: string | null): Entry => {
  const entry: Entry = {
    sourceId,
    whep,
    snapshot: { state: initialStreamingVideoState, stream: null },
    listeners: [],
    stopTimer: null,
    pendingStream: null,
    player: null as unknown as WhepPlayer,
  }
  entry.player = new WhepPlayer({
    fetchToken: async () => {
      const token = await fetchStreamingToken(sourceId)
      // the WHEP path returned with the token wins over the one of the sources list
      return { ...token, whep: token.whep || whep || '' }
    },
    resolveUrl: getWhepUrl,
    pending: (pendingRequests[sourceId] = pendingRequests[sourceId] || new Set()),
    onStateChange: (state) => {
      if (entries[sourceId] !== entry) return
      let stream = entry.snapshot.stream
      if (state.status === 'playing' && entry.pendingStream) {
        stream = entry.pendingStream
        entry.pendingStream = null
      }
      entry.snapshot = { state, stream }
      notify(entry)
      eventDispatch('phone-island-streaming-video-status', {
        source: sourceId,
        status: state.status,
        failure: state.failure,
      })
    },
    onStream: (stream) => {
      if (entries[sourceId] !== entry) return
      if (stream && entry.snapshot.stream && entry.snapshot.state.status !== 'playing') {
        // reconnecting: keep the last frame until the new stream plays
        entry.pendingStream = stream === entry.snapshot.stream ? null : stream
        return
      }
      entry.pendingStream = null
      if (entry.snapshot.stream === stream) return
      entry.snapshot = { ...entry.snapshot, stream }
      notify(entry)
    },
  })
  return entry
}

const clearStopTimer = (entry: Entry) => {
  if (entry.stopTimer) {
    clearTimeout(entry.stopTimer)
    entry.stopTimer = null
  }
}

// Closes the sessions as soon as their streaming call is over, whatever ended it
// (local or remote hangup, call rejected, island reset...)
const watchCallEnd = () => {
  if (unsubscribeStore) return
  unsubscribeStore = store.subscribe(() => {
    Object.keys(entries).forEach((id) => {
      if (!isStreamingCallOf(id)) stopEntry(entries[id])
    })
  })
}

const stopEntry = (entry: Entry) => {
  clearStopTimer(entry)
  if (entries[entry.sourceId] === entry) {
    delete entries[entry.sourceId]
  }
  if (!Object.keys(entries).length && unsubscribeStore) {
    unsubscribeStore()
    unsubscribeStore = null
  }
  // DELETE of the gateway session, then close of the peer connection
  entry.player.stop()
  if (entry.listeners.length) {
    entry.snapshot = { state: initialStreamingVideoState, stream: null }
    notify(entry)
  }
}

/**
 * Watches the live video of a source: starts its session (or joins the running one) and calls
 * the listener on every change. Returns the function to stop watching.
 */
export const watchStreamingVideo = (
  sourceId: string,
  whep: string | null,
  listener: Listener,
): (() => void) => {
  if (!isStreamingCallOf(sourceId)) {
    listener({ state: initialStreamingVideoState, stream: null })
    return () => {}
  }
  let entry = entries[sourceId]
  if (entry && entry.whep !== whep) {
    // the source was reconfigured
    stopEntry(entry)
    entry = undefined as unknown as Entry
  }
  if (!entry) {
    entry = createEntry(sourceId, whep)
    entries[sourceId] = entry
    watchCallEnd()
    entry.player.start()
  }
  clearStopTimer(entry)
  entry.listeners.push(listener)
  listener(entry.snapshot)

  const current = entry
  let released = false
  return () => {
    if (released) return
    released = true
    current.listeners = current.listeners.filter((l) => l !== listener)
    if (current.listeners.length || entries[sourceId] !== current) return
    if (isStreamingCallOf(sourceId)) {
      // another view of the same call may take it over
      clearStopTimer(current)
      current.stopTimer = setTimeout(() => {
        current.stopTimer = null
        if (!current.listeners.length) stopEntry(current)
      }, RELEASE_GRACE_MS)
    } else {
      stopEntry(current)
    }
  }
}

/**
 * Closes the live video session of a source, or of all the sources (e.g. when the call ends)
 */
export const stopStreamingVideo = (sourceId?: string) => {
  Object.keys(entries).forEach((id) => {
    if (sourceId === undefined || id === sourceId) {
      stopEntry(entries[id])
    }
  })
}

/**
 * The live video sessions currently open (debug)
 */
export const getStreamingVideoSessions = () =>
  Object.keys(entries).map((id) => ({
    source: id,
    status: entries[id].snapshot.state.status,
    viewers: entries[id].listeners.length,
  }))
