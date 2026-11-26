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
  Socket: evaluate('components/Socket.tsx'),
  VideoView: evaluate('components/VideoView/index.tsx'),
  CallEvents: evaluate('events/CallEvents.tsx'),
  call: evaluate('lib/phone/call.ts'),
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
const response = (status, body) => ({ status, json: async () => body })
const adminKey = 'TestVideoRoomKey123'
const tick = () => new Promise(setImmediate)

function harness() {
  const events = new Map()
  const eventTarget = new EventTarget()
  const notices = []
  const effects = []
  const tasks = []
  const messages = []
  const socket = []
  const socketHandlers = new Map()
  const websocket = {
    on(event, handler) { socketHandlers.set(event, handler) },
    emit(_, message) { socket.push(message) },
    io: { on() {} },
  }
  const requests = []
  const pickers = []
  const handles = []
  const subscribers = new Set()
  let now = 0
  const state = {
    alerts: '', currentCall: {
      accepted: true, conversationId: 'a/b-c', ownerExtension: '101', username: 'alice', number: '102',
    },
    currentUser: {
      username: 'bob', conversations: {},
      profile: { macro_permissions: { nethvoice_cti: {
        value: true, permissions: { screen_sharing: { value: true } },
      } } },
    },
    island: { view: 'video' },
    player: {}, webrtc: {},
    screenShare: { active: false, room: '', role: '', localVideos: 0 },
    paramUrl: { openParamUrlType: 'never' },
    websocket: { socket: null },
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
      player: { updatePlayer: (patch) => update('player', patch), pauseRemoteAudio() {} },
      currentCall: { updateCurrentCall: (patch) => update('currentCall', patch) },
      websocket: { update: (patch) => update('websocket', patch) },
      island: {
        setIslandView: (view) => update('island', { view }),
        toggleSideViewVisible: (visible) => update('island', { visible }),
        toggleTranscriptionViewVisible() {},
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
        getPlugin() { return callbacks.plugin },
        getId() { return id },
        webrtcStuff: { pc: { iceConnectionState: 'connected' } },
        createOffer(offer) { this.offer = offer; this.offerCount = (this.offerCount ?? 0) + 1 },
        createAnswer(answer) { this.answer = answer },
        handleRemoteJsep(answer) { this.answer = answer },
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
    'socket.io-client': { io: () => websocket },
    'react-redux': { useDispatch: () => store.dispatch, useSelector: (select) => select(state) },
    'janus.js': JanusLib,
    default_device: { isWebRTC: () => true },
    messages: { pauseWebRTC: () => true },
    utils: {
      useIsomorphicLayoutEffect: (effect) => effects.push(effect),
      useEventListener: (event, handler) => events.set(event, handler),
      eventDispatch(event) {
        notices.push(event)
        eventTarget.dispatchEvent(new Event(event))
      },
    },
  }
  const globals = {
    AbortController, MediaStream, window: eventTarget, document: {}, addEventListener() {}, removeEventListener() {},
    Date: { now: () => now },
    setTimeout(cb, ms) { const task = { cb, at: now + ms }; tasks.push(task); return task },
    clearTimeout(task) { if (task) task.cancel = true },
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
  load('call')
  load('CallEvents').CallEvents({})
  load('screenShare')
  load('screenSharing')
  load('Socket').Socket({ hostName: 'example.invalid', username: 'bob', reload: false })
  effects.splice(0).forEach((effect) => effect())
  const { VideoView } = load('VideoView')
  const { useSideViewLogic } = load('useSideViewLogic')
  const render = () => {
    VideoView()
    effects.splice(0).forEach((effect) => effect())
  }
  const start = () => events.get('phone-island-screen-share-start')()
  const stop = () => events.get('phone-island-screen-share-stop')()
  const hold = () => events.get('phone-island-call-hold')()
  const emitHeld = () => eventTarget.dispatchEvent(new Event('phone-island-call-held'))
  const advance = (ms) => {
    now += ms
    for (const task of tasks.filter(({ at, cancel }) => at <= now && !cancel)) {
      task.cancel = true
      task.cb()
    }
  }
  const receive = (message) => socketHandlers.get('message')(message)
  const invite = (roomId, callUser = 'alice') => receive({ message: 'screenSharingStart', roomId, callUser })
  return { state, store, update, render, start, stop, hold, emitHeld, advance, notices, messages, socket, receive, invite,
    requests, handles, pickers, useSideViewLogic, sent: () => messages.map(({ message }) => message.request) }
}

// Exercise the bundled Janus SDK's createOffer with a browser picker that finishes after teardown.
async function checkLateCapture() {
  let picker
  const module = { exports: {} }
  class PeerConnection { close() { this.signalingState = 'closed' } }
  vm.runInNewContext(fs.readFileSync(path.join(src, 'lib/webrtc/janus.js'), 'utf8'), {
    module, window: { RTCPeerConnection: PeerConnection }, RTCPeerConnection: PeerConnection,
    RTCRtpSender: class {}, MediaStreamTrack: Track, MediaStream,
    navigator: { mediaDevices: { getDisplayMedia: () => picker.promise } },
  })
  const Janus = module.exports
  const debugMessages = []
  const outgoingMessages = []
  Object.assign(Janus, {
    initDone: true, isArray: Array.isArray, log() {}, error() {}, warn() {},
    debug(value) { debugMessages.push(JSON.stringify(value)) },
    httpAPICall(_url, req) {
      if (req.body?.janus === 'message') outgoingMessages.push(req.body.body)
      if (req.verb === 'POST') req.success({ janus: 'success', data: { id: 1 } })
    },
  })
  const session = new Janus({ server: 'https://example.invalid/janus' })
  for (const teardown of ['detach', 'replace']) {
    picker = defer()
    let handle
    session.attach({ plugin: 'janus.plugin.videoroom', success: (h) => { handle = h } })
    handle.send({ message: { request: 'create', admin_key: adminKey } })
    const track = new Track()
    let error
    handle.createOffer({ tracks: [{ type: 'screen', capture: true }], error: (e) => { error = e } })
    if (teardown === 'detach') handle.detach()
    else {
      handle.hangup()
      handle.webrtcStuff.pc = new PeerConnection()
    }
    picker.resolve(new MediaStream([track]))
    await tick()
    assert.equal(track.readyState, 'ended')
    assert.match(String(error), /Capture ended/)
  }
  assert.equal(outgoingMessages.length, 2)
  assert.ok(outgoingMessages.every((message) => message.admin_key === adminKey))
  assert.ok(debugMessages.some((value) => value?.includes('[redacted]')))
  assert.ok(debugMessages.every((value) => !value?.includes(adminKey)))
}

async function resolveKey(h, requestIndex = 0) {
  h.requests[requestIndex].resolve(response(200, { admin_key: adminKey }))
  await tick()
}

async function createRoom(h, room) {
  await resolveKey(h)
  h.messages[0].success({ videoroom: 'created', room })
}

;(async () => {
  await checkLateCapture()
  for (const [baseURL, authorization] of [
    ['https://example.invalid/api', 'Bearer mock'],
    ['https://example.invalid/webrest', 'bob:mock'],
  ]) {
    const h = harness()
    h.update('fetchDefaults', { baseURL, headers: { Authorization: authorization } })
    h.render()
    h.start()
    h.start()
    assert.deepEqual(h.sent(), [])
    assert.equal(h.requests.length, 1)
    const request = h.requests[0]
    assert.equal(request.url, baseURL + '/user/janus_admin_key')
    assert.equal(request.config.method ?? 'GET', 'GET')
    assert.equal(request.config.headers.Authorization, authorization)
    assert.equal(request.config.cache, 'no-store')
    assert.equal(request.config.redirect, 'error')
    await createRoom(h, 100)
    assert.deepEqual(h.sent(), ['create', 'join'])
    assert.equal(h.messages[0].message.admin_key, adminKey)
    assert.equal(h.messages[1].message.admin_key, undefined)
    assert.ok(!JSON.stringify(h.state).includes(adminKey))
    h.stop()
    assert.deepEqual(h.sent(), ['create', 'join', 'destroy'])
    assert.equal(h.messages[2].message.admin_key, undefined)
  }
  {
    const h = harness()
    h.render()
    h.start()
    h.requests[0].resolve(response(404))
    await tick()
    assert.deepEqual(h.sent(), ['create'])
    assert.ok(!Object.hasOwn(h.messages[0].message, 'admin_key'))
    h.messages[0].success({ videoroom: 'created', room: 300 })
    assert.deepEqual(h.sent(), ['create', 'join'])
    h.stop()
  }
  {
    const h = harness()
    h.update('currentUser', { profile: undefined })
    h.render()
    h.start()
    assert.equal(h.requests.length, 0)
    assert.equal(h.handles.length, 0)
    assert.equal(h.state.currentCall.accepted, true)
  }
  for (const result of [
    response(401), response(403), response(503), response(200), response(200, { admin_key: '' }),
    { status: 200, json: async () => { throw new SyntaxError('Invalid JSON') } },
    new Error('fetch failed'),
  ]) {
    const h = harness()
    h.render()
    h.start()
    if (result instanceof Error) h.requests[0].reject(result)
    else h.requests[0].resolve(result)
    await tick()
    assert.deepEqual(h.sent(), [])
    assert.equal(h.handles[0].detached, true)
    assert.equal(h.state.alerts, 'screen_share_unavailable')
    assert.equal(h.state.currentCall.accepted, true)
    assert.equal(h.state.island.view, 'call')
  }
  {
    const h = harness()
    h.render()
    h.start()
    h.advance(30000)
    assert.equal(h.state.screenShare.active, false)
    assert.equal(h.handles[0].detached, true)
    assert.equal(h.requests[0].config.signal.aborted, true)
    assert.equal(h.state.alerts, 'screen_share_unavailable')
    h.start()
    await resolveKey(h)
    assert.deepEqual(h.sent(), [])
    assert.equal(h.state.screenShare.active, true)
    assert.equal(h.state.screenShare.plugin, h.handles[1])
    assert.equal(h.state.alerts, '')
    await resolveKey(h, 1)
    h.messages[0].success({ videoroom: 'created', room: 500 })
    assert.deepEqual(h.sent(), ['create', 'join'])
    const publisher = h.handles[1]
    publisher.callbacks.onmessage({ videoroom: 'joined' })
    publisher.callbacks.onmessage({ videoroom: 'joined' })
    assert.equal(publisher.offerCount, 1)
    publisher.callbacks.onlocaltrack(new Track(), true)
    publisher.offer.success('sdp')
    assert.deepEqual(h.sent(), ['create', 'join', 'configure'])
    assert.deepEqual(h.socket, [])
    publisher.callbacks.onmessage({ videoroom: 'event', configured: 'ok' }, { type: 'answer', sdp: 'answer' })
    assert.deepEqual(h.socket, [])
    publisher.answer.success()
    h.advance(30000)
    assert.equal(h.state.screenShare.active, true, 'successful publication clears the signalling deadline')
    assert.equal(h.socket.length, 1)
    assert.equal(h.socket[0].message, 'screenSharingStart')
    assert.equal(h.socket[0].destUser, 'alice')
    assert.equal(h.socket[0].roomId, 500)
  }
  {
    const h = harness()
    const track = new Track()
    h.update('screenShare', { pendingScreenStream: new MediaStream([track]) })
    let attach
    h.state.webrtc.janusInstance.attach = (callbacks) => { attach = callbacks }
    h.render()
    h.start()
    h.advance(30000)
    assert.equal(h.state.screenShare.active, false)
    assert.equal(track.readyState, 'ended')
    assert.equal(h.state.alerts, 'screen_share_unavailable')
    let detached = false
    attach.success({ detach() { detached = true } })
    assert.equal(detached, true)
    assert.equal(h.requests.length, 0)
  }
  {
    const h = harness()
    h.render()
    h.start()
    await resolveKey(h)
    h.messages[0].success({ videoroom: 'event', error_code: 433, error: 'Unauthorized' })
    assert.deepEqual(h.sent(), ['create'])
    assert.equal(h.handles[0].detached, true)
    assert.equal(h.state.alerts, 'screen_share_unavailable')
    assert.equal(h.state.currentCall.accepted, true)
  }
  {
    const h = harness()
    const track = new Track()
    h.update('screenShare', { pendingScreenStream: new MediaStream([track]) })
    h.render()
    h.start()
    await createRoom(h, 123)
    assert.deepEqual(h.sent(), ['create', 'join'])
    h.advance(30000)
    h.handles[0].callbacks.onmessage({ videoroom: 'joined' })
    assert.equal(h.sent().at(-1), 'destroy')
    assert.equal(h.handles[0].detached, true)
    assert.equal(track.readyState, 'ended')
    assert.equal(h.state.screenShare.active, false)
    assert.equal(h.state.alerts, 'screen_share_unavailable')
    assert.deepEqual(h.socket, [])
  }
  for (const failure of ['janus rejection', 'invalid SDP', 'no response']) {
    const h = harness()
    h.render()
    h.start()
    await createRoom(h, 405)
    const publisher = h.handles[0]
    publisher.callbacks.onmessage({ videoroom: 'joined' })
    h.advance(30000)
    assert.equal(h.state.screenShare.active, true, 'screen picker has no signalling deadline')
    const track = new Track()
    publisher.callbacks.onlocaltrack(track, true)
    publisher.offer.success('sdp')
    if (failure === 'janus rejection') {
      publisher.callbacks.onmessage({ videoroom: 'event', error: 'Cannot publish' })
    } else if (failure === 'invalid SDP') {
      publisher.callbacks.onmessage({ videoroom: 'event', configured: 'ok' }, { type: 'answer', sdp: 'invalid' })
      publisher.answer.error()
    } else {
      h.advance(30000)
    }
    assert.equal(track.readyState, 'ended')
    assert.equal(h.state.screenShare.active, false)
    assert.deepEqual(h.socket, [])
  }
  for (const update of [
    (h) => h.stop(),
    (h) => h.hold(),
    (h) => h.update('currentCall', { accepted: false }),
    (h) => h.update('currentCall', { transferring: true }),
    (h) => h.update('currentCall', { username: 'charlie', conversationId: 'another-call' }),
  ]) {
    const h = harness()
    h.render()
    h.start()
    update(h)
    assert.equal(h.requests[0].config.signal.aborted, true)
    assert.equal(h.handles[0].detached, true)
    assert.equal(h.state.screenShare.active, false)
    await resolveKey(h)
    assert.deepEqual(h.sent(), [])
    assert.deepEqual(h.socket, [])
  }
  {
    const h = harness()
    h.render()
    h.start()
    await resolveKey(h)
    h.update('currentCall', { transferring: true })
    h.update('currentCall', { transferring: false, username: 'charlie', conversationId: 'new-call' })
    assert.equal(h.state.screenShare.active, false)
    h.start()
    await resolveKey(h, 1)
    h.messages[0].success({ videoroom: 'created', room: 321 })
    assert.deepEqual(h.sent(), ['create', 'create', 'destroy'])
    assert.equal(h.messages[2].message.room, 321)
    assert.equal(h.handles[0].detached, true)
    assert.equal(h.handles[1].detached, false)
    assert.deepEqual(h.socket, [])
  }
  {
    const h = harness()
    h.render()
    h.start()
    await resolveKey(h)
    h.advance(30000)
    assert.equal(h.state.screenShare.active, false)
    assert.equal(h.handles[0].detached, false, 'keep the handle while Janus can still return the room')
    h.advance(30000)
    assert.equal(h.handles[0].detached, true, 'release the handle even when Janus never responds')
    assert.deepEqual(h.sent(), ['create'])
    assert.deepEqual(h.socket, [])
  }
  {
    const h = harness()
    h.render()
    h.start()
    await createRoom(h, 800)
    const publisher = h.handles[0]
    publisher.callbacks.onmessage({ videoroom: 'joined' })
    h.update('currentCall', { username: 'charlie', conversationId: 'another-call' })
    h.start()
    publisher.offer.success('stale SDP')
    const staleTrack = new Track()
    publisher.callbacks.onlocaltrack(staleTrack, true)
    assert.equal(staleTrack.readyState, 'ended')
    assert.deepEqual(h.sent(), ['create', 'join', 'destroy'])
    assert.equal(h.state.screenShare.active, true)
    assert.equal(h.state.screenShare.plugin, h.handles[1])
    assert.deepEqual(h.socket, [])
  }
  {
    const h = harness()
    h.update('island', { view: 'call' })
    h.invite(123, 'charlie')
    h.update('currentCall', { accepted: false })
    h.invite(123)
    assert.equal(h.state.island.view, 'call')
    h.update('currentCall', { accepted: true })
    h.invite(123)
    assert.equal(h.state.island.view, 'video')
    h.update('currentCall', { conversationId: 'new-call-with-same-peer' })
    h.render()
    assert.equal(h.handles.length, 0)
    assert.equal(h.state.screenShare.room, '')
    assert.equal(h.state.island.view, 'call')
  }
  for (const cancel of [
    (h) => h.update('currentCall', { accepted: false }),
    (h) => h.emitHeld(),
    (h) => h.receive({ message: 'screenSharingStop', roomId: 123 }),
  ]) {
    const h = harness()
    h.invite(123)
    cancel(h) // VideoView never mounted for this invitation.
    assert.equal(h.state.screenShare.isJoiningScreenShare, false)
    h.update('currentCall', { accepted: true, conversationId: 'next-call' })
    h.invite(124)
    h.render()
    assert.deepEqual(h.sent(), ['join'])
    assert.equal(h.messages[0].message.room, 124)
  }
  for (const endCallShare of [
    (h) => h.stop(),
    (h) => h.hold(),
    (h) => h.update('currentCall', { transferring: true }),
    (h) => h.update('currentCall', { accepted: false }),
    (h) => h.update('currentCall', { username: 'charlie', conversationId: 'new-call' }),
  ]) {
    const h = harness()
    h.invite(123)
    h.render()
    assert.equal(h.state.screenShare.role, 'listener')
    assert.equal(h.requests.length, 0)
    assert.deepEqual(h.sent(), ['join'])
    assert.equal(h.messages[0].message.room, 123)
    h.handles[0].callbacks.onmessage({ videoroom: 'joined', publishers: [{ id: 456, display: 'alice' }] })
    const track = new Track()
    h.handles[1].callbacks.onremotetrack(track, '0', true)
    h.advance(30000)
    assert.equal(h.state.screenShare.active, true)
    endCallShare(h)
    assert.equal(track.readyState, 'ended')
    assert.equal(h.state.screenShare.active, false)
    assert.equal(h.handles[0].detached, true)
    assert.equal(h.handles[1].detached, true)
    assert.deepEqual(h.sent(), ['join', 'join'])
    assert.equal(h.socket.length, 1)
    assert.equal(h.socket[0].message, 'screenSharingStop')
    assert.equal(h.socket[0].destUser, 'alice')
    assert.equal(h.socket[0].roomId, 123)
  }
  for (const failure of ['attach', 'answer', 'timeout']) {
    const h = harness()
    h.invite(123)
    h.render()
    const janus = h.state.webrtc.janusInstance
    const attach = janus.attach
    if (failure === 'attach') {
      janus.attach = (callbacks) => callbacks.error(new Error('Subscriber attach failed'))
    }
    h.handles[0].callbacks.onmessage({ videoroom: 'joined', publishers: [{ id: 456, display: 'alice' }] })
    janus.attach = attach
    if (failure === 'answer') {
      const subscriber = h.handles[1]
      subscriber.callbacks.onmessage({ videoroom: 'attached' }, { type: 'offer', sdp: 'invalid' })
      subscriber.answer.error(new Error('Invalid SDP'))
    } else if (failure === 'timeout') {
      h.advance(30000)
    }
    assert.equal(h.state.screenShare.active, false)
    assert.ok(h.handles.every((handle) => handle.detached))
    assert.deepEqual(h.socket, [], 'a local subscriber failure must not stop the publisher')
    h.invite(124)
    h.render()
    assert.equal(h.state.screenShare.active, true)
    assert.equal(h.messages.at(-1).message.room, 124)
  }
  {
    const h = harness()
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
  for (const timing of ['picker', 'handoff']) {
    const h = harness()
    h.render()
    h.update('island', { view: 'call' })
    const track = new Track()
    const pending = h.useSideViewLogic('desktop').goToScreenSharing()
    if (timing === 'picker') {
      h.hold()
      // Resuming before the capture arrives must still discard the old request.
      h.update('currentCall', { paused: false })
    }
    h.pickers[0].resolve(new MediaStream([track]))
    await pending
    if (timing === 'handoff') {
      assert.equal(h.state.screenShare.isStartingScreenShare, true)
      h.hold()
    }
    h.render()
    assert.equal(track.readyState, 'ended')
    assert.ok(!h.state.screenShare.isStartingScreenShare)
    assert.equal(h.handles.length, 0)
    assert.equal(h.requests.length, 0)
  }
  {
    const h = harness()
    h.invite(123)
    h.render()
    h.receive({ message: 'screenSharingStop', roomId: 123 })
    h.stop()
    h.start()
    h.render()
    assert.equal(h.state.screenShare.active, true, 'old queued stop must not reset the new publisher')
    assert.equal(h.state.screenShare.plugin, h.handles[1])
  }
  console.log('Direct Janus screen sharing tests passed')
})().catch((error) => { console.error(error); process.exitCode = 1 })
