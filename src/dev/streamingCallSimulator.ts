// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * DEV-ONLY streaming (citofono) incoming-call simulator.
 *
 * Reproduces the incoming video-source state that is normally produced by
 * socket + streaming API (see src/components/Socket.tsx handleStreamingSource
 * and src/models/streaming.ts) by driving the Rematch store directly, so the
 * "citofono" incoming UI can be exercised without Janus / a real 2N intercom.
 *
 * This module is imported only by src/dev-widget-example.ts (the `npm run dev`
 * harness). It is NEVER bundled into the published NPM module or the CDN widget.
 *
 * Image sources (kind "image") show an inline placeholder frame. Live video sources
 * (kind "rtsp") open a real WHEP session: the token is requested to the configured CTI
 * server (POST /streaming/token), so pass the `sourceId` of an existing rtsp source of that
 * server to see its video (a fake id shows the "video not available" state).
 */

import { store } from '../store'

interface SimulateGate {
  id: string
  name: string
  type?: string
}

interface SimulateOptions {
  name?: string
  number?: string
  withImage?: boolean
  // image sources: one implicit gate (legacy cmdOpen), rtsp sources: see gates
  withUnlock?: boolean
  // "image" (default) or "rtsp" (live video)
  kind?: 'image' | 'rtsp'
  // id of the video source (rtsp: an existing source of the CTI server to see its video)
  sourceId?: string
  // WHEP path (rtsp only), the one returned with the token wins
  whep?: string
  // gates of the source, default: one gate when withUnlock, none otherwise
  gates?: SimulateGate[]
}

const DEFAULT_GATES: SimulateGate[] = [
  { id: '1', name: 'Porta', type: 'dtmf' },
  { id: '2', name: 'Cancello', type: 'url' },
]

const SOURCE_ID = 'dev-citofono-1'

// Long default name so the #7996 cropping regression is one click away.
const DEFAULT_NAME = 'Citofono Park Sud - Ingresso Principale Carraio Lato Nord'
const DEFAULT_NUMBER = '5003'

// Small inline placeholder "video frame" (no network needed).
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;base64,' +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
       <rect width="640" height="360" fill="#3f4756"/>
       <rect x="280" y="40" width="20" height="280" fill="#2b313c"/>
       <text x="320" y="200" fill="#cbd5e1" font-family="sans-serif" font-size="28"
             text-anchor="middle">DEV citofono preview</text>
     </svg>`,
  )

export function simulateIncomingCitofono(opts: SimulateOptions = {}) {
  const {
    name = DEFAULT_NAME,
    number = DEFAULT_NUMBER,
    withImage = true,
    withUnlock = true,
    kind = 'image',
    sourceId = SOURCE_ID,
  } = opts
  const isRtsp = kind === 'rtsp'
  const gates = opts.gates ?? (withUnlock ? DEFAULT_GATES.slice(0, 1) : [])

  const { dispatch } = store

  // 1. Register the streaming source (extension must match the call number).
  dispatch.streaming.updateVideoSources({
    [sourceId]: isRtsp
      ? {
          id: sourceId,
          extension: number,
          description: name,
          cmdOpen: gates.length ? 'dev-open-command' : '',
          frameRate: '1000',
          password: '',
          url: '',
          user: '',
          type: 'rtsp',
          whep: opts.whep || `/streaming-gw/${sourceId}/whep`,
          gates,
        }
      : {
          id: sourceId,
          extension: number,
          description: name,
          cmdOpen: withUnlock ? 'dev-open-command' : '',
          frameRate: '1',
          password: '',
          url: '',
          user: '',
          image: withImage ? PLACEHOLDER_IMAGE : undefined,
          ...(opts.gates ? { type: 'image' as const, whep: null, gates: opts.gates } : {}),
        },
  })

  if (withImage && !isRtsp) {
    dispatch.streaming.updateSourceImage({ source: sourceId, image: PLACEHOLDER_IMAGE })
  }

  // 2. Mark the call as coming from a streaming source and open the island.
  dispatch.island.setIsFromStreaming(true)
  dispatch.island.setIslandView('call')
  dispatch.island.toggleIsOpen(true)

  // 3. Put the call in the incoming-streaming state. We set `incoming` directly
  //    instead of going through checkIncomingUpdatePlay so it does not depend on
  //    a configured currentUser default_device.
  dispatch.currentCall.updateCurrentCall({
    incoming: true,
    incomingWebRTC: true,
    accepted: false,
    outgoing: false,
    displayName: name,
    number,
    username: '',
    streamingSourceNumber: number,
  })
}

export function answerCitofono() {
  store.dispatch.island.setIslandView('streamingAnswer')
  store.dispatch.currentCall.updateCurrentCall({
    incoming: false,
    accepted: true,
    acceptedWebRTC: true,
    startTime: String(Math.floor(Date.now() / 1000)),
  })
}

export function resetCitofono() {
  store.dispatch.currentCall.reset()
  store.dispatch.streaming.reset()
  store.dispatch.island.handleResetIslandStore()
}

function isDebugModeEnabled(): boolean {
  if (typeof localStorage === 'undefined') return false
  const debugMode = localStorage.getItem('phoneIslandDemoDebugMode')
  return debugMode === 'minimal' || debugMode === 'full'
}

function removePanel() {
  const panel = document.getElementById('pi-dev-citofono-panel')
  if (panel) panel.remove()
}

function injectPanel() {
  if (!isDebugModeEnabled()) return
  if (document.getElementById('pi-dev-citofono-panel')) return

  const panel = document.createElement('div')
  panel.id = 'pi-dev-citofono-panel'
  panel.style.cssText =
    'position:fixed;bottom:16px;left:16px;z-index:2147483647;background:#111827;' +
    'color:#f9fafb;font:12px/1.4 sans-serif;padding:12px;border-radius:10px;' +
    'box-shadow:0 6px 24px rgba(0,0,0,.4);width:240px;'

  panel.innerHTML = `
    <div style="font-weight:600;margin-bottom:8px">DEV · Citofono simulator</div>
    <label style="display:block;margin-bottom:6px">Name
      <input id="pi-dev-name" value="${DEFAULT_NAME}"
        style="width:100%;box-sizing:border-box;margin-top:2px"/>
    </label>
    <label style="display:block;margin-bottom:6px">Number
      <input id="pi-dev-number" value="${DEFAULT_NUMBER}"
        style="width:100%;box-sizing:border-box;margin-top:2px"/>
    </label>
    <label style="display:block;margin-bottom:4px">
      <input type="checkbox" id="pi-dev-img" checked/> image
    </label>
    <label style="display:block;margin-bottom:4px">
      <input type="checkbox" id="pi-dev-unlock" checked/> unlock button
    </label>
    <label style="display:block;margin-bottom:6px">Source type
      <select id="pi-dev-kind" style="width:100%;margin-top:2px">
        <option value="image">image (JPEG frames)</option>
        <option value="rtsp">rtsp (live video)</option>
      </select>
    </label>
    <label style="display:block;margin-bottom:6px">Source id (rtsp: existing source)
      <input id="pi-dev-source" value="${SOURCE_ID}"
        style="width:100%;box-sizing:border-box;margin-top:2px"/>
    </label>
    <label style="display:block;margin-bottom:8px">Gates (rtsp)
      <select id="pi-dev-gates" style="width:100%;margin-top:2px">
        <option value="0">none</option>
        <option value="1" selected>one</option>
        <option value="2">two</option>
      </select>
    </label>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button id="pi-dev-ring" style="flex:1">Ring</button>
      <button id="pi-dev-answer" style="flex:1">Answer</button>
      <button id="pi-dev-reset" style="flex:1">Reset</button>
    </div>
  `
  document.body.appendChild(panel)

  const val = (id: string) => (document.getElementById(id) as HTMLInputElement)

  panel.querySelector('#pi-dev-ring')!.addEventListener('click', () =>
    simulateIncomingCitofono({
      name: val('pi-dev-name').value,
      number: val('pi-dev-number').value,
      withImage: val('pi-dev-img').checked,
      withUnlock: val('pi-dev-unlock').checked,
      kind: val('pi-dev-kind').value === 'rtsp' ? 'rtsp' : 'image',
      sourceId: val('pi-dev-source').value || SOURCE_ID,
      gates:
        val('pi-dev-kind').value === 'rtsp'
          ? DEFAULT_GATES.slice(0, Number(val('pi-dev-gates').value))
          : undefined,
    }),
  )
  panel.querySelector('#pi-dev-answer')!.addEventListener('click', () => answerCitofono())
  panel.querySelector('#pi-dev-reset')!.addEventListener('click', () => resetCitofono())
}

/**
 * Shows the simulator panel (called explicitly, not on install).
 */
export function showPanel() {
  injectPanel()
}

/**
 * Hides the simulator panel.
 */
export function hidePanel() {
  removePanel()
}

/**
 * Toggles the simulator panel visibility.
 */
export function togglePanel() {
  if (document.getElementById('pi-dev-citofono-panel')) {
    removePanel()
  } else {
    injectPanel()
  }
}

/**
 * Installs the simulator: exposes helpers on `window.phoneIslandDev`.
 * Panel is NOT injected automatically; must be shown via showPanel() or button click.
 * Safe no-op outside the browser.
 */
export function installStreamingCallSimulator() {
  if (typeof window === 'undefined') return
  ;(window as any).phoneIslandDev = {
    simulateIncomingCitofono,
    answerCitofono,
    resetCitofono,
    showPanel,
    hidePanel,
    togglePanel,
  }
}
