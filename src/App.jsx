import React, { useEffect, useState } from 'react'
import adapter from 'webrtc-adapter'

function App(props) {
  var sipcall = null
  let registered = false

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'libs/janus.js'
    script.async = true
    script.onload = () => {
      console.log('loaded')
      console.log(Janus)

      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
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
                  sipcall = pluginHandle
                  console.log(
                    'SIP plugin attached! (' +
                      sipcall.getPlugin() +
                      ', handle id = ' +
                      sipcall.getId() +
                      ')',
                  )

                  console.log('sipcall')
                  console.log(sipcall)

                  sipcall.send({
                    message: {
                      request: 'register',
                      username: 'sip:' + '211' + '@' + '127.0.0.1',
                      display_name: 'Sebastian',
                      secret: '0081a9189671e8c3d1ad8b025f92403da',
                      proxy: 'sip:' + '127.0.0.1' + ':5060',
                      sips: false,
                      refresh: true,
                    },
                  })

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
                      //   // Reset status
                      //   sipcall.hangup()
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
                        // jsepGlobal = jsep
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
                        Janus.log(result['username'] + ' accepted the call!')
                        // if (jsep !== null && jsep !== undefined) {
                        // handleRemote(jsep)
                        // }
                        // lastActivity = new Date().getTime()
                        break

                      case 'hangup':
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

                  Janus.attachMediaStream(localStream, stream)

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
    }
  }, [])

  return <div className='text-red-300'>App Widget</div>
}

export default App
