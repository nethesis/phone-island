import React, { useEffect, useState, useRef } from 'react'
import adapter from 'webrtc-adapter'
import Janus from './lib/janus.js'
import { io } from 'socket.io-client'

export const App = (props) => {
  const [calling, setCalling] = useState<boolean>(false)
  const [sipcall, setSipCall] = useState<any>(null)
  const [jsepGlobal, setJsepGlobal] = useState<object | null>(null)
  const [accepted, setAccepted] = useState<boolean>(false)
  const [callee, setCallee] = useState<object>({})
  const [currentCall, setCurrentCall] = useState<{ [index: string]: string | number }>({})
  const localStream = useRef(null)

  const HOST_NAME: string = 'nv-seb'
  const USERNAME: string = 'foo1'
  const AUTH_TOKEN: string = '791ff10b8666939426eb1b5507e983558f0e5806'
  const SIP_EXTEN: string = '211'
  const SIP_SECRET: string = '0081a9189671e8c3d1ad8b025f92403da'

  let registered = false

  const decline = () => {
    sipcall.send({
      message: {
        request: 'decline',
      },
    })
  }

  const hangup = () => {
    sipcall.send({
      message: {
        request: 'hangup',
      },
    })
  }

  const answer = () => {
    sipcall.createAnswer({
      jsep: jsepGlobal,
      media: {
        audio: true,
        videoSend: false,
        videoRecv: false,
      },
      success: (jsep) => {
        sipcall.send({
          message: {
            request: 'accept',
          },
          jsep: jsep,
        })
      },
      error: (error) => {
        // @ts-ignore
        Janus.error('WebRTC error:', error)
        sipcall.send({
          message: {
            request: 'decline',
            code: 480,
          },
        })
      },
    })
  }

  const register = (sipcall) => {
    // Register after Janus initialization
    sipcall.send({
      message: {
        request: 'register',
        username: 'sip:' + SIP_EXTEN + '@' + '127.0.0.1',
        display_name: 'Foo 1',
        secret: SIP_SECRET,
        proxy: 'sip:' + '127.0.0.1' + ':5060',
        sips: false,
        refresh: false,
      },
    })
  }

  interface ConvType {
    [index: string]: string | number
  }

  const getDispName = (conv: ConvType): string => {
    let dispName = ''
    if (
      conv &&
      conv.counterpartName !== '<unknown>' &&
      typeof conv.counterpartName === 'string' &&
      conv.counterpartName.length > 0
    ) {
      dispName = conv.counterpartName
    } else if (
      conv &&
      conv.counterpartNum &&
      typeof conv.counterpartNum === 'string' &&
      conv.counterpartNum.length > 0
    ) {
      dispName = conv.counterpartNum
    } else {
      dispName = 'Anonymous'
    }
    return dispName
  }

  useEffect(() => {
    const handleCalls = (res: any) => {
      // Initialize conversation
      const conv: ConvType = res.conversations[Object.keys(res.conversations)[0]] || {}

      // Check conversation isn't empty
      if (Object.keys(conv).length > 0) {
        const status: string = res.status
        if (status) {
          switch (status) {
            case 'ringing':
              setCurrentCall((state) => ({
                ...state,
                displayName: getDispName(conv),
              }))
              break
            default:
              break
          }
        }
      }
    }

    const initWsConnection = () => {
      const socket = io(HOST_NAME, {
        upgrade: false,
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 2000,
      })

      socket.on('connect', () => {
        console.log(`ws connected sid: ${socket.id}`)
      })

      socket.on('connect', () => {
        console.log('Socket on: ' + HOST_NAME + ' is connected !')

        socket.emit('login', {
          accessKeyId: USERNAME,
          token: AUTH_TOKEN,
          uaType: 'desktop',
        })
      })

      socket.on('authe_ok', () => {
        console.log('AUTH OK')
      })

      socket.on('extenUpdate', (res) => {
        if (res.username === USERNAME) {
          handleCalls(res)
        }
      })
    }

    initWsConnection()

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })

    const setupDeps = () =>
      // @ts-ignore
      Janus.useDefaultDependencies({
        adapter,
      })

    var evtObservers = {
      registration_failed: [],
      registered: [],
      calling: [],
      incomingcall: [],
      accepted: [],
      hangup: [],
      gateway_down: [],
      error: [],
      progress: [],
      destroyed: [],
    }

    const initWebRTC = () => {
      // @ts-ignore
      Janus.init({
        debug: 'all',
        dependencies: setupDeps(),
        callback: function () {
          // @ts-ignore
          const janus = new Janus({
            server: 'https://nv-seb/janus',
            success: () => {
              console.log('success')
              // @ts-ignore
              janus.attach({
                plugin: 'janus.plugin.sip',
                opaqueId: 'sebastian' + '_' + new Date().getTime(),
                success: function (pluginHandle) {
                  setSipCall(pluginHandle)
                  register(pluginHandle)
                  if (pluginHandle) {
                    console.log(
                      'SIP plugin attached! (' + pluginHandle.getPlugin() + ', id = ' + ')',
                    )
                  }
                  // getSupportedDevices(function () {
                  //   resolve()
                  // })
                },
                error: function (error) {
                  console.error('  -- Error attaching plugin...')
                  console.error(error)
                  // reject()
                },
                consentDialog: function (on) {
                  console.log(`janus consentDialog (on: ${on})`)
                },
                webrtcState: function (on) {
                  console.log(
                    'Janus says our WebRTC PeerConnection is ' + (on ? 'up' : 'down') + ' now',
                  )
                },
                iceState: function (newState) {
                  if (sipcall) {
                    console.log(
                      `ICE state of PeerConnection of handle has changed to "${newState}"`,
                    )
                  }
                },
                mediaState: function (medium, on) {
                  console.log('Janus ' + (on ? 'started' : 'stopped') + ' receiving our ' + medium)
                },
                slowLink: function (uplink, count) {
                  if (uplink) {
                    console.warn(`SLOW link: several missing packets from janus (${count})`)
                  } else {
                    console.warn(`SLOW link: janus is not receiving all your packets (${count})`)
                  }
                },
                onmessage: function (msg, jsep) {
                  // @ts-ignore
                  Janus.debug(' ::: Got a message :::')
                  // @ts-ignore
                  Janus.debug(JSON.stringify(msg))
                  // Any error?
                  var error = msg['error']
                  if (error != null && error != undefined) {
                    if (!registered) {
                      // @ts-ignore
                      Janus.log('User is not registered')
                    } else {
                      // Reset status
                      sipcall.hangup()
                    }
                    for (var evt in evtObservers['error']) {
                      // @ts-ignore
                      evtObservers['error'][evt](msg, jsep)
                    }
                    return
                  }
                  var result = msg['result']
                  if (
                    result !== null &&
                    result !== undefined &&
                    result['event'] !== undefined &&
                    result['event'] !== null
                  ) {
                    // get event
                    var event = result['event']

                    // call all evt registered
                    for (var evt in evtObservers[event]) {
                      evtObservers[event][evt](msg, jsep)
                    }

                    //switch event
                    switch (event) {
                      case 'registration_failed':
                        // @ts-ignore
                        Janus.error(
                          'Registration failed: ' + result['code'] + ' ' + result['reason'],
                        )
                        return
                        break

                      case 'unregistered':
                        // @ts-ignore
                        Janus.log('Successfully un-registered as ' + result['username'] + '!')
                        // registered = false
                        break

                      case 'registered':
                        // @ts-ignore
                        Janus.log('Successfully registered as ' + result['username'] + '!')
                        if (!registered) {
                          registered = true
                        }
                        // lastActivity = new Date().getTime()
                        break

                      case 'registering':
                        // @ts-ignore
                        Janus.log('janus registering')
                        break

                      case 'calling':
                        // @ts-ignore
                        Janus.log('Waiting for the peer to answer...')
                        // lastActivity = new Date().getTime()
                        break

                      case 'incomingcall':
                        setJsepGlobal(jsep)
                        setCalling(true)

                        setCallee((state) => ({
                          ...state,
                          display_name: result.displayname,
                        }))
                        console.log('RESULT RESULT')
                        console.log(result)
                        console.log(jsep)

                        // @ts-ignore
                        Janus.log('Incoming call from ' + result['username'] + '!')
                        // lastActivity = new Date().getTime()
                        break

                      case 'progress':
                        // @ts-ignore
                        Janus.log(
                          "There's early media from " +
                            result['username'] +
                            ', wairing for the call!',
                        )
                        // if (jsep !== null && jsep !== undefined) {
                        // handleRemote(jsep)
                        // }
                        // lastActivity = new Date().getTime()
                        break

                      case 'accepted':
                        setAccepted(true)

                        // @ts-ignore
                        Janus.log(result['username'] + ' accepted the call!')
                        // if (jsep !== null && jsep !== undefined) {
                        // handleRemote(jsep)
                        // }
                        // lastActivity = new Date().getTime()
                        break

                      case 'hangup':
                        setCalling(false)
                        setAccepted(false)

                        if (
                          result['code'] === 486 &&
                          result['event'] === 'hangup' &&
                          result['reason'] === 'Busy Here'
                        ) {
                          // @ts-ignore
                          busyToneSound.play()
                        }
                        // @ts-ignore
                        Janus.log('Call hung up (' + result['code'] + ' ' + result['reason'] + ')!')
                        // @ts-ignore
                        if (incoming != null) {
                          // @ts-ignore
                          incoming = null
                        }
                        sipcall.hangup()

                        // lastActivity = new Date().getTime()
                        // stopScreenSharingI()
                        break

                      default:
                        break
                    }
                  }
                },
                onlocalstream: function (stream) {
                  // @ts-ignore
                  Janus.debug(' ::: Got a local stream :::')
                  // @ts-ignore
                  Janus.debug(stream)
                  // @ts-ignore
                  Janus.attachMediaStream(localStream.current, stream)
                  /* IS VIDEO ENABLED ? */
                  var videoTracks = stream.getVideoTracks()
                  /* */
                },
                onremotestream: function (stream) {
                  // @ts-ignore
                  Janus.debug(' ::: Got a remote stream :::')
                  // @ts-ignore
                  Janus.debug(stream)
                  // retrieve stream track
                  var audioTracks = stream.getAudioTracks()
                  var videoTracks = stream.getVideoTracks()
                  // @ts-ignore
                  // Janus.attachMediaStream(remoteStreamAudio, new MediaStream(audioTracks))
                  // @ts-ignore
                  // Janus.attachMediaStream(remoteStreamVideo, new MediaStream(videoTracks))
                },
                oncleanup: function () {
                  console.log(' ::: janus Got a cleanup notification :::')
                },
                detached: function () {
                  console.warn('SIP plugin handle detached from the plugin itself')
                },
              })
            },
            error: (err) => {
              console.log('error', err)
            },
          })
        },
      })
    }

    initWebRTC()

    return () => {
      if (sipcall) {
        sipcall.send({
          message: {
            request: 'unregister',
          },
        })
      }
    }
  }, [])

  return (
    <>
      {calling && (
        <>
          <div className='bg-black px-10 py-8 rounded-3xl flex flex-col gap-5 text-white w-fit absolute bottom-6 left-20 font-sans'>
            <div className='flex items-center'>
              <span>{currentCall.displayName ? currentCall.displayName : '-'}</span>
              {accepted && <span className='ml-5 w-3 h-3 bg-red-600 rounded-full'></span>}
            </div>
            <div className='flex gap-3'>
              <button
                onClick={answer}
                className='flex content-center items-center justify-center font-medium tracking-wide transition-colors duration-200 transform focus:outline-none focus:ring-2 focus:z-20 focus:ring-offset-2 disabled:opacity-75 bg-green-600 text-white border border-transparent hover:bg-green-700 focus:ring-green-500 focus:ring-offset-black rounded-md px-3 py-2 text-sm leading-4'
              >
                Answer
              </button>
              <button
                onClick={accepted ? hangup : decline}
                className='flex content-center items-center justify-center font-medium tracking-wide transition-colors duration-200 transform focus:outline-none focus:ring-2 focus:z-20 focus:ring-offset-2 disabled:opacity-75 bg-red-600 text-white border border-transparent hover:bg-red-700 focus:ring-red-500 focus:ring-offset-black rounded-md px-3 py-2 text-sm leading-4'
              >
                Decline
              </button>
            </div>
          </div>
        </>
      )}
      <video ref={localStream} muted autoPlay></video>
    </>
  )
}

App.displayName = 'App'
