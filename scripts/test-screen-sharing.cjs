// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: GPL-3.0-or-later

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const src = path.resolve(__dirname, '../src')
const ts = require('typescript')
const evaluate = (filename) => ts.transpileModule(fs.readFileSync(path.join(src, filename), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
}).outputText

const modules = {
  useSideViewLogic: evaluate('components/SideView/hooks/useSideViewLogic.ts'),
  VideoView: evaluate('components/VideoView/index.tsx'),
  screenShare: evaluate('lib/phone/screenShare.ts'),
  screenSharing: evaluate('services/screenSharing.ts'),
}

class Track extends EventTarget {
  id = 'track'
  kind = 'video'
  readyState = 'live'
  stop() { this.readyState = 'ended' }
}
class MediaStream {
  constructor(tracks) { this.tracks = tracks }
  getTracks() { return this.tracks }
  getVideoTracks() { return this.tracks }
}
const defer = () => {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
const response = (status, room) => ({ status, json: async () => ({ room }) })
const tick = () => new Promise(setImmediate)

function harness(mode) {
  const events = new Map()
  const notices = []
  const effects = []
  const tasks = []
  const messages = []
  const socket = []
  const requests = []
  const pickers = []
  const handles = []
  const subscribers = new Set()
  let now = 0
  const state = {
    alerts: '', currentCall: {
      accepted: true, conversationId: 'a/b-c', ownerExtension: '101', username: 'alice', number: '102',
    },
    currentUser: { username: 'bob', conversations: {} }, island: { view: 'video' },
    player: {}, webrtc: {},
    screenShare: { active: false, room: '', role: '', localVideos: 0 },
    paramUrl: { openParamUrlType: 'never' },
    websocket: { socket: { emit: (_, value) => socket.push(value) } },
    fetchDefaults: { apiMode: 'new', baseURL: 'https://example.invalid/api', headers: { Authorization: 'Bearer mock', 'Content-Type': 'application/json' } },
  }
  const update = (dest, patch) => {
    state[dest] = { ...state[dest], ...patch }
    for (const subscriber of [...subscribers]) subscriber()
  }
  const store = {
    getState: () => state,
    subscribe(cb) { subscribers.add(cb); return () => subscribers.delete(cb) },
    select: { mediaDevices: { videoInputDevices: () => [] } },
    dispatch: {
      alerts: { setAlert: (a) => state.alerts = a, removeAlert: () => state.alerts = '' },
      screenShare: { update: (patch) => update('screenShare', patch) },
      player: { updatePlayer: (patch) => update('player', patch) },
      currentCall: { updateCurrentCall: (patch) => update('currentCall', patch) },
      island: {
        setIslandView: (view) => update('island', { view }),
        toggleSideViewVisible: (visible) => update('island', { visible }),
      },
    },
  }
  const JanusLib = {
    isExtensionEnabled: () => true, randomString: () => 'random',
    stopAllTracks: (stream) => stream?.getTracks().forEach((track) => track.stop()),
  }
  state.webrtc.janusInstance = {
    attach(callbacks) {
      const id = handles.length + 1
      const handle = {
        id, callbacks, detached: false,
        detach() { this.detached = true },
        webrtcStuff: { pc: { iceConnectionState: 'connected' } },
        createOffer(offer) { this.offer = offer; this.offerCount = (this.offerCount ?? 0) + 1 },
        send(config) {
          messages.push({ id, ...config })
          if (config.message.request === 'destroy') config.success?.()
        },
      }
      handles.push(handle)
      callbacks.success(handle)
    },
  }
  let hooks = {
    createElement: () => undefined, useState: (initial) => [initial, () => {}],
    useRef: (current) => ({ current }), useEffect: (effect) => effects.push(effect),
    useCallback: (fn) => fn, useMemo: (fn) => fn(),
  }
  const api = {
    store: { store }, react: hooks,
    'react-redux': { useDispatch: () => store.dispatch, useSelector: (select) => select(state) },
    'janus.js': JanusLib,
    utils: {
      useIsomorphicLayoutEffect: (effect) => effects.push(effect),
      useEventListener: (event, handler) => events.set(event, handler),
      eventDispatch: (event) => notices.push(event),
    },
  }
  const globals = {
    AbortController, MediaStream, document: {}, addEventListener() {}, removeEventListener() {},
    Date: { now: () => now },
    setTimeout(cb, ms) { const task = { cb, at: now + ms }; tasks.push(task); return task },
    clearTimeout(task) { task.cancel = true },
    fetch(url, config) {
      const request = defer()
      requests.push({ url, config, ...request })
      return request.promise
    },
    navigator: { mediaDevices: {
      getDisplayMedia() { const picker = defer(); pickers.push(picker); return picker.promise },
    } },
  }
  const load = (key) => {
    const exports = {}
    vm.runInNewContext(modules[key], {
      ...globals, exports, require: (name) => api[name] ?? api[name.split('/').at(-1)] ?? {},
    }, { filename: key + '.js' })
    api[key] = exports
    return exports
  }
  load('screenShare')
  load('screenSharing')
  const { VideoView } = load('VideoView')
  const { useSideViewLogic } = load('useSideViewLogic')
  const render = () => {
    VideoView({ screenShareRoomCreation: mode })
    effects.splice(0).forEach((effect) => effect())
  }
  const start = () => events.get('phone-island-screen-share-start')()
  const stop = () => events.get('phone-island-screen-share-stop')()
  const advance = (ms) => {
    now += ms
    for (const task of tasks.filter(({ at, cancel }) => at <= now && !cancel)) {
      task.cancel = true
      task.cb()
    }
  }
  return { state, store, update, render, start, stop, advance, notices, messages, socket,
    requests, handles, pickers, useSideViewLogic, sent: () => messages.map(({ message }) => message.request) }
}

;(async () => {
  {
    const h = harness()
    h.render()
    h.start()
    h.start()
    assert.deepEqual(h.sent(), ['create'])
    assert.equal(h.requests.length, 0)
    h.messages[0].success({ videoroom: 'created', room: 100 })
    assert.deepEqual(h.sent(), ['create', 'join'])
    h.stop()
    assert.deepEqual(h.sent(), ['create', 'join', 'destroy'])
  }
  {
    const h = harness('middleware')
    h.update('fetchDefaults', { apiMode: 'legacy' })
    h.render()
    h.start()
    await tick()
    assert.deepEqual(h.sent(), [])
    assert.equal(h.requests.length, 0)
    assert.equal(h.state.currentCall.accepted, true)
    assert.equal(h.state.alerts, 'screen_share_unavailable')
  }
  for (const status of [401, 403, 503]) {
    const h = harness('middleware')
    h.render()
    h.start()
    h.start()
    assert.equal(h.requests.length, 1)
    const request = h.requests[0]
    assert.equal(request.url, 'https://example.invalid/api/screen-sharing/rooms')
    assert.equal(request.config.method, 'POST')
    assert.equal(request.config.headers.Authorization, 'Bearer mock')
    assert.deepEqual(JSON.parse(request.config.body), { conversationId: 'a/b-c' })
    request.resolve(response(status))
    await tick()
    assert.deepEqual(h.sent(), [])
    assert.equal(h.handles[0].detached, true)
    assert.equal(h.state.alerts, 'screen_share_unavailable')
    assert.equal(h.state.currentCall.accepted, true)
    assert.equal(h.state.island.view, 'call')
  }
  {
    const h = harness('middleware')
    h.render()
    h.start()
    h.advance(30000)
    assert.equal(h.state.screenShare.active, false)
    assert.equal(h.handles[0].detached, true)
    assert.equal(h.state.alerts, 'screen_share_unavailable')
    h.start()
    h.requests[0].resolve(response(201, 400))
    await tick()
    assert.deepEqual(h.sent(), ['destroy'])
    assert.equal(h.messages[0].message.room, 400)
    assert.equal(h.messages[0].id, h.handles[2].id)
    assert.equal(h.state.screenShare.active, true)
    assert.equal(h.state.screenShare.plugin, h.handles[1])
    assert.equal(h.state.alerts, '')
    assert.deepEqual(h.socket, [])
    h.requests[1].resolve(response(201, 500))
    await tick()
    assert.deepEqual(h.sent(), ['destroy', 'join'])
    const publisher = h.handles[1]
    publisher.callbacks.onmessage({ videoroom: 'joined' })
    publisher.callbacks.onmessage({ videoroom: 'joined' })
    assert.equal(publisher.offerCount, 1)
    publisher.callbacks.onlocaltrack(new Track(), true)
    publisher.offer.success('sdp')
    assert.deepEqual(h.sent(), ['destroy', 'join', 'configure'])
    assert.equal(h.socket.length, 1)
    assert.equal(h.socket[0].message, 'screenSharingStart')
    assert.equal(h.socket[0].destUser, 'alice')
    assert.equal(h.socket[0].roomId, 500)
  }
  for (const update of [
    (h) => h.stop(),
    (h) => h.update('currentCall', { accepted: false }),
    (h) => h.update('currentCall', { transferring: true }),
    (h) => h.update('currentCall', { username: 'charlie', conversationId: 'another-call' }),
  ]) {
    const h = harness('middleware')
    h.render()
    h.start()
    update(h)
    assert.equal(h.handles[0].detached, true)
    assert.equal(h.state.screenShare.active, false)
    h.requests[0].resolve(response(201, 700))
    await tick()
    assert.deepEqual(h.sent(), ['destroy'])
    assert.equal(h.messages[0].message.room, 700)
    assert.deepEqual(h.socket, [])
  }
  {
    const h = harness('middleware')
    h.render()
    h.start()
    h.requests[0].resolve(response(201, 800))
    await tick()
    const publisher = h.handles[0]
    publisher.callbacks.onmessage({ videoroom: 'joined' })
    h.update('currentCall', { username: 'charlie', conversationId: 'another-call' })
    h.start()
    publisher.offer.success('stale SDP')
    const staleTrack = new Track()
    publisher.callbacks.onlocaltrack(staleTrack, true)
    assert.equal(staleTrack.readyState, 'ended')
    assert.deepEqual(h.sent(), ['join', 'destroy'])
    assert.equal(h.state.screenShare.active, true)
    assert.equal(h.state.screenShare.plugin, h.handles[1])
    assert.deepEqual(h.socket, [])
  }
  {
    const h = harness('middleware')
    h.update('screenShare', { isJoiningScreenShare: true, room: 123 })
    h.render()
    assert.equal(h.state.screenShare.role, 'listener')
    assert.equal(h.requests.length, 0)
    assert.deepEqual(h.sent(), ['join'])
    assert.equal(h.messages[0].message.room, 123)
    h.stop()
    assert.equal(h.handles[0].detached, true)
    assert.deepEqual(h.sent(), ['join'])
  }
  {
    const h = harness('middleware')
    h.update('island', { view: 'call' })
    const ui = h.useSideViewLogic('desktop')
    const pending = ui.goToScreenSharing()
    await ui.goToScreenSharing()
    assert.equal(h.pickers.length, 1)
    h.pickers[0].reject(new Error('Picker canceled by user'))
    await pending
    assert.equal(h.state.island.view, 'call')
    assert.equal(h.state.screenShare.isStartingScreenShare, undefined)
    assert.equal(h.requests.length, 0)
    const pending2 = ui.goToScreenSharing()
    const track = new Track()
    h.update('currentCall', { username: 'charlie', conversationId: 'another-call' })
    h.pickers[1].resolve(new MediaStream([track]))
    await pending2
    assert.equal(track.readyState, 'ended')
    assert.equal(h.state.island.view, 'call')
    assert.equal(h.requests.length, 0)
  }
  {
    const h = harness('middleware')
    h.update('screenShare', { isJoiningScreenShare: true, room: 123 })
    h.render()
    h.update('screenShare', { isLeavingScreenShare: true })
    h.stop()
    h.start()
    h.render()
    assert.equal(h.state.screenShare.active, true, 'old queued stop must not reset the new publisher')
    assert.equal(h.state.screenShare.plugin, h.handles[1])
  }
  console.log('Phone Island mocked lifecycle passed: direct default, publisher/listener routing, bearer request, denial, deadline, repeat starts, cancellation, hangup, transfer, call switch, stale cleanup, and picker')
})().catch((error) => { console.error(error); process.exitCode = 1 })
