// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  MediaPermissionsError,
  MediaPermissionsErrorType,
  requestMediaPermissions,
} from 'mic-check'
import JanusLib from '../webrtc/janus'
import { JanusTypes } from '../../types'
import { store } from '../../store'
import { isPhysical } from '../user/default_device'

const Janus: JanusTypes = JanusLib

export const getSupportedDevices = function (origCallback: () => void) {
  let hasMicrophone = false
  let hasSpeakers = false
  let hasWebcam = false
  let isMicrophoneAlreadyCaptured = false
  let isWebcamAlreadyCaptured = false

  function checkDeviceSupport(callback: () => void) {
    const mediaDevices: MediaDeviceInfo[] = []

    navigator.mediaDevices.enumerateDevices().then((devices: MediaDeviceInfo[]) => {
      devices.forEach(function (device: MediaDeviceInfo) {
        let skip = false

        mediaDevices.forEach(function (d: MediaDeviceInfo) {
          if (d.deviceId === device.deviceId && d.kind === device.kind) {
            skip = true
          }
        })

        if (skip) {
          return
        }

        if (device.kind === 'videoinput' && !isWebcamAlreadyCaptured) {
          isWebcamAlreadyCaptured = true
        }
        if (device.kind === 'audioinput' && !isMicrophoneAlreadyCaptured) {
          isMicrophoneAlreadyCaptured = true
        }

        if (device.kind === 'audioinput') {
          hasMicrophone = true
        }

        if (device.kind === 'audiooutput') {
          hasSpeakers = true
        }

        if (device.kind === 'videoinput') {
          hasWebcam = true
        }

        mediaDevices.push(device)
      })

      if (callback) {
        callback()
      }
    })
  }

  // check for microphone/camera support!
  checkDeviceSupport(function () {
    const supportedDevices: any = {
      audio: hasMicrophone,
      audioCap: isMicrophoneAlreadyCaptured,
      video: hasWebcam,
      videoCap: isWebcamAlreadyCaptured,
    }

    Janus.log && Janus.log('supportedDevices=', supportedDevices)
    origCallback()
  })
}

export const checkMediaPermissions = function () {
  requestMediaPermissions({ audio: true, video: false })
    .then(() => {
      // Can successfully access camera and microphone streams
      // Save permissions state on rematch to get access globally on the app
    })
    .catch((err: MediaPermissionsError) => {
      const { type, name, message } = err
      if (type === MediaPermissionsErrorType.SystemPermissionDenied) {
        // browser does not have permission to access camera or microphone
        store.dispatch.alerts.setAlert('browser_permissions')
        if (Janus.error)
          Janus.error('WebRTC: browser does not have permission to access camera or microphone')
      } else if (type === MediaPermissionsErrorType.UserPermissionDenied) {
        // User didn't allow app to access camera or microphone only if default_device is not physical
        if( isPhysical() ? '' : store.dispatch.alerts.setAlert('user_permissions') )
        if (Janus.error) Janus.error("WebRTC: user didn't allow app to access camera or microphone")
      } else if (type === MediaPermissionsErrorType.CouldNotStartVideoSource) {
        // Camera is in use by another application (Zoom, Skype) or browser tab (Google Meet, Messenger Video)
        // (mostly Windows specific problem)
        store.dispatch.alerts.setAlert('busy_camera')
        if (Janus.error)
          Janus.error(
            'WebRTC: camera is in use by another application (Zoom, Skype) or browser tab (Google Meet, Messenger Video)',
          )
      } else {
        // Not all error types are handled by this library
        store.dispatch.alerts.setAlert('unknown_media_permissions')
        if (Janus.error)
          Janus.error("WebRTC: can't access audio or camere on this device. unknown error")
      }
    })
}
