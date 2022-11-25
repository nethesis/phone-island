// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later


export const getSupportedDevices = function (origCallback) {
  let supportedDevices = null

  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    // Firefox 38+ seems having support of enumerateDevicesx
    // @ts-ignore
    navigator.enumerateDevices = function (callback) {
      navigator.mediaDevices.enumerateDevices().then(callback)
    }
  }

  var MediaDevices = []
  var isHTTPs = location.protocol === 'https:'
  var canEnumerate = false

  if (typeof MediaStreamTrack !== 'undefined' && 'getSources' in MediaStreamTrack) {
    canEnumerate = true
  } else if (navigator.mediaDevices && !!navigator.mediaDevices.enumerateDevices) {
    canEnumerate = true
  }

  var hasMicrophone = false
  var hasSpeakers = false
  var hasWebcam = false

  var isMicrophoneAlreadyCaptured = false
  var isWebcamAlreadyCaptured = false

  function checkDeviceSupport(callback) {
    if (!canEnumerate) {
      return
    }

    if (
      // @ts-ignore
      !navigator.enumerateDevices &&
      window.MediaStreamTrack &&
      // @ts-ignore
      window.MediaStreamTrack.getSources
    ) {
      // @ts-ignore
      navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(
        window.MediaStreamTrack,
      )
    }
    // @ts-ignore
    if (!navigator.enumerateDevices && navigator.enumerateDevices) {
      // @ts-ignore
      navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator)
    }
    // @ts-ignore
    if (!navigator.enumerateDevices) {
      if (callback) {
        callback()
      }
      return
    }

    MediaDevices = []
    // @ts-ignore
    navigator.enumerateDevices(function (devices) {
      devices.forEach(function (_device) {
        var device = {}
        for (var d in _device) {
          device[d] = _device[d]
        }
        // @ts-ignore
        if (device.kind === 'audio') {
          // @ts-ignore
          device.kind = 'audioinput'
        }
        // @ts-ignore
        if (device.kind === 'video') {
          // @ts-ignore
          device.kind = 'videoinput'
        }

        var skip
        MediaDevices.forEach(function (d) {
          // @ts-ignore
          if (d.id === device.id && d.kind === device.kind) {
            skip = true
          }
        })

        if (skip) {
          return
        }
        // @ts-ignore
        if (!device.deviceId) {
          // @ts-ignore
          device.deviceId = device.id
        }
        // @ts-ignore
        if (!device.id) {
          // @ts-ignore
          device.id = device.deviceId
        }
        // @ts-ignore
        if (!device.label) {
          // @ts-ignore
          device.label = 'Please invoke getUserMedia once.'
          if (!isHTTPs) {
            // @ts-ignore
            device.label = 'HTTPs is required to get label of this ' + device.kind + ' device.'
          }
        } else {
          // @ts-ignore
          if (device.kind === 'videoinput' && !isWebcamAlreadyCaptured) {
            isWebcamAlreadyCaptured = true
          }
          // @ts-ignore
          if (device.kind === 'audioinput' && !isMicrophoneAlreadyCaptured) {
            isMicrophoneAlreadyCaptured = true
          }
        }
        // @ts-ignore
        if (device.kind === 'audioinput') {
          hasMicrophone = true
        }
        // @ts-ignore
        if (device.kind === 'audiooutput') {
          hasSpeakers = true
        }
        // @ts-ignore
        if (device.kind === 'videoinput') {
          hasWebcam = true
        }

        // there is no 'videoouput' in the spec.
        // @ts-ignore
        MediaDevices.push(device)
      })

      if (callback) {
        callback()
      }
    })
  }

  // check for microphone/camera support!
  checkDeviceSupport(function () {
    // @ts-ignore
    supportedDevices = {
      audio: hasMicrophone,
      audioCap: isMicrophoneAlreadyCaptured,
      video: hasWebcam,
      videoCap: isWebcamAlreadyCaptured,
    }
    // @ts-ignore
    // janus.log('supportedDevices=', supportedDevices)
    origCallback()
  })
}