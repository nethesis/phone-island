import React, { useEffect, useState, useRef } from 'react'
import adapter from 'webrtc-adapter'

function App(props) {
  const [calling, setCalling] = useState(false)
  const [sipcall, setSipCall] = useState(null)
  const [jsepGlobal, setJsepGlobal] = useState(null)
  const [accepted, setAccepted] = useState(false)
  const [callee, setCallee] = useState({})
  const localStream = useRef(null)

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
        console.log('SUCCESS INSIDE CREATE ANSWER')
        sipcall.send({
          message: {
            request: 'accept',
          },
          jsep: jsep,
        })
      },
      error: (error) => {
        console.log('ERROR INSIDE CREATE ANSWER')
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
        username: 'sip:' + '211' + '@' + '127.0.0.1',
        display_name: 'Foo 1',
        secret: '0081a9189671e8c3d1ad8b025f92403da',
        proxy: 'sip:' + '127.0.0.1' + ':5060',
        sips: false,
        refresh: false,
      },
    })
  }

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'libs/janus.js'
    script.async = true
    script.onload = () => {
      console.log('loaded')
      console.log(Janus)

      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      const setupDeps = () =>
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

      Janus.init({
        debug: 'all',
        dependencies: setupDeps(),
        callback: function () {
          const janus = new Janus({
            server: 'https://nv-seb/janus',
            success: () => {
              console.log('success')

              janus.attach({
                plugin: 'janus.plugin.sip',
                opaqueId: 'sebastian' + '_' + new Date().getTime(),
                success: function (pluginHandle) {
                  setSipCall(pluginHandle)
                  register(pluginHandle)

                  console.log(
                    'SIP plugin attached! (' +
                      pluginHandle.getPlugin() +
                      ', id = ' +
                      pluginHandle.getId() +
                      ')',
                  )
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
                  console.log(
                    `ICE state of PeerConnection of handle ${sipcall.getId()} has changed to "${newState}"`,
                  )
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
                  Janus.debug(' ::: Got a message :::')
                  Janus.debug(JSON.stringify(msg))
                  // Any error?
                  var error = msg['error']
                  if (error != null && error != undefined) {
                    if (!registered) {
                      Janus.log('User is not registered')
                    } else {
                      // Reset status
                      sipcall.hangup()
                    }
                    for (var evt in evtObservers['error']) {
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
                        Janus.error(
                          'Registration failed: ' + result['code'] + ' ' + result['reason'],
                        )
                        return
                        break

                      case 'unregistered':
                        Janus.log('Successfully un-registered as ' + result['username'] + '!')
                        // registered = false
                        break

                      case 'registered':
                        Janus.log('Successfully registered as ' + result['username'] + '!')
                        if (!registered) {
                          registered = true
                        }
                        // lastActivity = new Date().getTime()
                        break

                      case 'registering':
                        Janus.log('janus registering')
                        break

                      case 'calling':
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

                        Janus.log('Incoming call from ' + result['username'] + '!')
                        // lastActivity = new Date().getTime()
                        break

                      case 'progress':
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
                          busyToneSound.play()
                        }
                        Janus.log('Call hung up (' + result['code'] + ' ' + result['reason'] + ')!')
                        if (incoming != null) {
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
                  Janus.debug(' ::: Got a local stream :::')
                  Janus.debug(stream)
                  Janus.attachMediaStream(localStream.current, stream)
                  /* IS VIDEO ENABLED ? */
                  var videoTracks = stream.getVideoTracks()
                  /* */
                },
                onremotestream: function (stream) {
                  Janus.debug(' ::: Got a remote stream :::')
                  Janus.debug(stream)
                  // retrieve stream track
                  var audioTracks = stream.getAudioTracks()
                  var videoTracks = stream.getVideoTracks()
                  Janus.attachMediaStream(remoteStreamAudio, new MediaStream(audioTracks))
                  Janus.attachMediaStream(remoteStreamVideo, new MediaStream(videoTracks))
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
    document.body.appendChild(script)

    return () => {
      sipcall.send({
        message: {
          request: 'unregister',
        },
      })
      document.body.removeChild(script)
    }
  }, [])

  return (
    <>
      {calling && (
        <>
          <div className='bg-black px-10 py-8 rounded-3xl flex flex-col gap-5 text-white w-fit'>
            <div className='flex items-center'>
              <span>{callee.display_name ? callee.display_name.replace(/"/g, '') : '-'}</span>
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

export default App
