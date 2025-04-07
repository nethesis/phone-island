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
import { getJSONItem } from '../../utils'

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
  //Remove all media alerts if default_device is physical
  if (isPhysical()) {
    store.dispatch.alerts.removeAlert('browser_permissions')
    store.dispatch.alerts.removeAlert('user_permissions')
    store.dispatch.alerts.removeAlert('busy_camera')
    store.dispatch.alerts.removeAlert('unknown_media_permissions')
    return
  }

  requestMediaPermissions({ audio: true, video: true })
    .then(() => {
      // Can successfully access camera and microphone streams
      // Save permissions state on rematch to get access globally on the app
    })
    .catch((err: any) => {
      const { type } = err

      // Define error mappings for different types of media permission errors
      const errorMap: any = {
        [MediaPermissionsErrorType.SystemPermissionDenied]: {
          alert: 'browser_permissions',
          message: 'WebRTC: browser does not have permission to access camera or microphone',
        },
        [MediaPermissionsErrorType.UserPermissionDenied]: {
          alert: 'user_permissions',
          message: "WebRTC: user didn't allow app to access camera or microphone",
        },
        [MediaPermissionsErrorType.CouldNotStartVideoSource]: {
          alert: 'busy_camera',
          message:
            'WebRTC: camera is in use by another application (Zoom, Skype) or browser tab (Google Meet, Messenger Video)',
        },
      }

      // Get error details from map or use default error
      const error = errorMap[type] ?? {
        alert: 'unknown_media_permissions',
        message: "WebRTC: can't access audio or camera on this device. unknown error",
      }

      // Display alert only for non-physical devices
      store.dispatch.alerts.setAlert(error.alert)

      // Log error message if Janus logger is available
      if (Janus.error) {
        Janus.error(error.message)
      }
    })
}

export const getCurrentVideoInputDeviceId = function () {
  const currentDeviceId = getJSONItem('phone-island-video-input-device').deviceId || null
  const videoInputDevices = store.select.mediaDevices.videoInputDevices(store.getState())

  // Check if the current device is still available
  const deviceFound = videoInputDevices.find((device) => device.deviceId === currentDeviceId)

  if (deviceFound) {
    return currentDeviceId
  } else {
    return null
  }
}

export const getCurrentAudioInputDeviceId = function () {
  const currentDeviceId = getJSONItem('phone-island-audio-input-device').deviceId || null
  const audioInputDevices = store.select.mediaDevices.audioInputDevices(store.getState())

  // Check if the current device is still available
  const deviceFound = audioInputDevices.find((device) => device.deviceId === currentDeviceId)

  if (deviceFound) {
    return currentDeviceId
  } else {
    return null
  }
}

export const getCurrentAudioOutputDeviceId = function () {
  const currentDeviceId = getJSONItem('phone-island-audio-output-device').deviceId || null
  const audioOutputDevices = store.select.mediaDevices.audioOutputDevices(store.getState())

  // Check if the current device is still available
  const deviceFound = audioOutputDevices.find((device) => device.deviceId === currentDeviceId)

  if (deviceFound) {
    return currentDeviceId
  } else {
    return null
  }
}
