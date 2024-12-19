# EVENTS

The communication inside and outside the _phone-island_ is made through the [Event interface](https://developer.mozilla.org/en-US/docs/Web/API/Event).

During the intialization some event listeners are attached to the `window` object.

To trigger the events it is therefore necessary to dispatch events on the `window` object.

Events dispatch can be done using the [CustomEvent constructor](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent).

## Usage

The following is an example of helper function that can be used to dispatch events, the target can be any object but it uses `window` by default.

```
/**
  * The helper function
  *
  * @param name The name of the event
  * @param data The data object
  * @param element The target element
  */

export const eventDispatch = (
  name: string,
  data: any,
  element: HTMLElement | Window = window,
) => {
  typeof element !== 'undefined'
    ? element.dispatchEvent(new CustomEvent(name, { detail: data }))
    : console.error(new Error('EventDispatch error: element is not defined'))
}

// Call the helper function
eventDispatch('phone-island-call-start', { number: '212 })

```

As you can see, the helper function can be used in the following way:

eventDispatch(`<event-name>`, `<data-object>`)

## Listen Phone-Island Events - phone-island-*

- `phone-island-expand` The event to expand phone-island

  ```json
  {}
  ```

- `phone-island-compress` The event to compress phone-island

  ```json
  {}
  ```

- `phone-island-attach` The event to initialize webrtc with phone-island

  ```json
  {
    "id": "269",
    "type": "webrtc",
    "secret": "<secret>>",
    "username": "269",
    "description": "",
    "actions": {
        "answer": true,
        "dtmf": true,
        "hold": true
    }
  }
  ```

- `phone-island-detach` The event to destroy webrtc instance with phone-island

  ```json
  {
    "id": "92269",
    "type": "physical",
    "description": "Fanvil X6U-V2 2.12.16.18 0c383e32a7cb",
    "actions": {
        "answer": false,
        "dtmf": false,
        "hold": false
    }
  }
  ```

- `phone-island-audio-input-change` The event to change default audio input device for phone island

  ```json
  {
    "deviceId": "756ada2c6b10546e28808c13062982d66cae723eba1e03fe3834f8df79f794ee" // string - The input deviceId obtained by getUserMediaDevices
  }
  ```

- `phone-island-audio-output-change` The event to change default audio output device for phone island

  ```json
  {
    "deviceId": "2d331f699ec92b95000f3a656ab1d6ff9f17b3c9502c4a8db1d3f91905b5743f" // string - The output deviceId obtained by getUserMediaDevices
  }
  ```

- `phone-island-theme-change` The event to change phone-island theme

  ```json
  {
    "selectedTheme": "light | dark"
  }
  ```

- `phone-island-default-device-change` The event to change phone-island default device

  ```json
  {
    "id": "<number>",
    "type": "webrtc | nethlink | physical",
    "secret": "<secret>",
    "username": "<number>",
    "description": "",
    "actions": {
        "answer": true,
        "dtmf": true,
        "hold": true
    },
    "proxy_port": null
  }
  ```

- `phone-island-check-connection` The event to manually check if an user has internet connection

  ```json
  {}
  ```

## Dispatch Phone-Island Events - phone-island-*

- `phone-island-expanded` The dispatch of phone-island expand

  ```json
  {}
  ```

- `phone-island-compressed` The dispatch of phone-island compress

  ```json
  {}
  ```

- `phone-island-attached` The dispatch of initialize webrtc with phone-island (switch to webrtc device)

  ```json
  {}
  ```

- `phone-island-detached` The dispatch of destroy webrtc instance with phone-island (switch to physical device)

  ```json
  {}
  ```

- `phone-island-audio-input-changed` The dispatch of change default audio input device for phone island

  ```json
  {}
  ```

- `phone-island-audio-output-changed` The dispatch of change default audio output device for phone island

  ```json
  {}
  ```
- `phone-island-theme-changed` The dispatch of change phone-island theme

  ```json
  {}
  ```

- `phone-island-default-device-changed` The dispatch of change phone-island default device

  ```json
  {}
  ```

- `phone-island-presence-changed` The dispatch of change operator status

  ```json
  {}
  ```

- `phone-island-all-alerts-removed` The dispatch of clear alerts status

```json
{}
```

## Listen Call Events - phone-island-call-*

- `phone-island-call-start` The event to start a call

  ```json
  {
    "number": "200" // string - The number to be called
  }
  ```

- `phone-island-call-answer` The event to answer a call

  ```json
  {}
  ```

- `phone-island-call-end` The event to end a call

  ```json
  {}
  ```

- `phone-island-call-hold` The event to hold a call

  ```json
  {}
  ```

- `phone-island-call-unhold` The event to unhold a call

  ```json
  {}
  ```

- `phone-island-call-mute` The event to mute a call

  ```json
  {}
  ```

- `phone-island-call-unmute` The event to unmute a call

  ```json
  {}
  ```

- `phone-island-call-transfer-open` The event to show transfer view

  ```json
  {}
  ```

- `phone-island-call-transfer-close` The event to close transfer view

  ```json
  {}
  ```

- `phone-island-call-transfer-switch` The event to switch caller in transfer view

  ```json
  {}
  ```

- `phone-island-call-transfer-cancel` The event to cancel the transfer

  ```json
  {}
  ```

- `phone-island-call-transfer` The event to show transfer view

  ```json
  {
    "number": "200" // string - The number to transfer
  }
  ```

- `phone-island-call-keypad-open` The event to show keypad view

  ```json
  {}
  ```

- `phone-island-call-keypad-close` The event to close keypad view

  ```json
  {}
  ```

- `phone-island-call-keypad-send` The event to send DTMF tone

  ```json
  {
    "key": "1" // string - The DTMF tone key
  }
  ```

- `phone-island-call-park` The event to park a call

  ```json
  {}
  ```

- `phone-island-call-intrude` The event to intrude in a call

  ```json
  {
    "number": "200" // string - The number to intrude
  }
  ```

- `phone-island-call-listen` The event to listen a call

  ```json
  {
    "number": "200" // string - The number to listen
  }
  ```

- `phone-island-call-audio-input-switch` The event to change audio input device during a call

  ```json
  {
    "deviceId": "756ada2c6b10546e28808c13062982d66cae723eba1e03fe3834f8df79f794ee" // string - The input deviceId obtained by getUserMediaDevices
  }
  ```

- `phone-island-call-audio-output-switch` The event to change audio output device during a call

  ```json
  {
    "deviceId": "2d331f699ec92b95000f3a656ab1d6ff9f17b3c9502c4a8db1d3f91905b5743f" // string - The output deviceId obtained by getUserMediaDevices
  }
  ```

- `phone-island-call-actions-open` The event to open actions view

  ```json
  {}
  ```

- `phone-island-call-actions-close` The event to close actions view

  ```json
  {}
  ```
## Dispatch Call Events - phone-island-call-*

- `phone-island-call-ringing` The dispatch of call ringing

  ```json
  {}
  ```

- `phone-island-call-started` The dispatch of call start

  ```json
  {}
  ```

- `phone-island-call-answered` The dispatch of call answer

  ```json
  {}
  ```

- `phone-island-call-ended` The dispatch of call end

  ```json
  {}
  ```

- `phone-island-call-held` The dispatch of call hold

  ```json
  {}
  ```

- `phone-island-call-unheld` The dispatch of call unhold

  ```json
  {}
  ```

- `phone-island-call-muted` The dispatch of call mute

  ```json
  {}
  ```

- `phone-island-call-unmuted` The dispatch of call unmute

  ```json
  {}
  ```

- `phone-island-call-transfer-opened` The dispatch of call show transfer view

  ```json
  {}
  ```

- `phone-island-call-transfer-closed` The dispatch of call close transfer view

  ```json
  {}
  ```

- `phone-island-call-transfer-switched` The dispatch of call switch caller in transfer view

  ```json
  {}
  ```

- `phone-island-call-transfer-canceled` The dispatch of call cancel the transfer

  ```json
  {}
  ```

- `phone-island-call-transfered` The dispatch of call show transfer view

  ```json
  {}
  ```

- `phone-island-call-transfer-successfully-popup-open` The event to advert if a transfer has been made successfully and phone-island popup is open

  ```json
  {}
  ```

- `phone-island-call-transfer-successfully-popup-close` The event to advert if a transfer has been made successfully and phone-island popup is close

  ```json
  {}
  ```

- `phone-island-call-transfer-failed` The event to advert if a transfer has failed

  ```json
  {}
  ```

- `phone-island-call-keypad-opened` The dispatch of show keypad view

  ```json
  {}
  ```

- `phone-island-call-keypad-closed` The dispatch of close keypad view

  ```json
  {}
  ```

- `phone-island-call-keypad-sent` The dispatch of send DTMF tone

  ```json
  {}
  ```

- `phone-island-call-parked` The dispatch of call park

  ```json
  {}
  ```

- `phone-island-call-listened` The dispatch of call listen

  ```json
  {}
  ```

- `phone-island-call-intruded` The dispatch of call intrude

  ```json
  {}
  ```

- `phone-island-call-audio-input-switched` The dispatch of call input switch

  ```json
  {}
  ```

- `phone-island-call-audio-output-switched` The dispatch of call output switch

  ```json
  {}
  ```

- `phone-island-call-actions-opened` The dispatch of call actions open

  ```json
  {}
  ```

- `phone-island-call-actions-closed` The dispatch of call actions close

  ```json
  {}
  ```

- `phone-island-action-physical` The dispatch of physical phone call or action

 ```json
 {
    "url": "http://username:password@physicalPhoneIp/cgi-bin/ConfigManApp.com?key=numberCalled;ENTER",
    "urlType": "call"
 }
 ````

## Listen Recording Events - phone-island-recording-*

- `phone-island-recording-open` The event to show the recording view.

  ```json
  {}
  ```

- `phone-island-recording-close` The event to close the recording view.

  ```json
  {}
  ```

- `phone-island-recording-start` The event to start the recording.

  ```json
  {}
  ```

- `phone-island-recording-stop` The event to stop the recording.

  ```json
  {}
  ```

- `phone-island-recording-play` The event to play the recording.

  ```json
  {}
  ```

- `phone-island-recording-pause` The event to pause the recording.

  ```json
  {}
  ```

- `phone-island-recording-save` The event to save the recording.

  ```json
  {}
  ```

- `phone-island-recording-delete` The event to delete the recording.

  ```json
  {}
  ```

- `phone-island-physical-recording-view` The event to launch phone island physical device recording.

  ```json
  {}
  ```

- `phone-island-physical-recording-open` The event to start physical recording.

  ```json
  {}
  ```

## Dispatch Recording Events - phone-island-recording-*

- `phone-island-recording-opened` The dispatch of show the recording view.

  ```json
  {}
  ```

- `phone-island-recording-closed` The dispatch of close the recording view.

  ```json
  {}
  ```

- `phone-island-recording-started` The dispatch of start the recording.

  ```json
  {}
  ```

- `phone-island-recording-stopped` The dispatch of stop the recording.

  ```json
  {}
  ```

- `phone-island-recording-played` The dispatch of play the recording.

  ```json
  {}
  ```

- `phone-island-recording-paused` The dispatch of pause the recording.

  ```json
  {}
  ```

- `phone-island-recording-saved` The dispatch of save the recording.

  ```json
  {
    "tempFileName": "user-cti-1686824454167.wav", // string - The temp file name of the asterisk recording to pass to the /enable_announcement API
    "audioFileURL": "blob:http://localhost:6006/3897f2da-2411-4e38-a024-56bbeab72a91" // string - The local URL of the recorded file in blob format
  }
  ```

- `phone-island-recording-deleted` The dispatch of delete the recording.

  ```json
  {}
  ```

- `phone-island-physical-recording-opened` The dispatch of show the physical recording view.

  ```json
  {}
  ```

## Listen Audio Player Events - phone-island-audio-player-*

- `phone-island-audio-player-start` The event to show the audio player view and play an audio file.

  ```json
  {
    "base64_audio_file": "UklGRiQAAABXQVZFZm10IBAAAAABAAIARKwAABCxAgAEABAAZGF0YYIAAAAAA==", // string - The audio file to be played in base64 format, ignored if type is present
    "type": "call_recording" || "announcement", // (optional) The type of the audio to be played
    "id" : "1", // string - (optional) The id of the call_recording or announcement, required if type is present
    "description": "My Audio File" // string - (optional) The description of the given file
  }
  ```

- `phone-island-audio-player-play` The event to play the audio player.

  ```json
  {}
  ```

- `phone-island-audio-player-pause` The event to pause the audio player.

  ```json
  {}
  ```

- `phone-island-audio-player-close` The event to close the audio player.

  ```json
  {}
  ```

## Dispatch Audio Player Events - phone-island-audio-player-*

- `phone-island-audio-player-started` THe dispatch of show the audio player view and play an audio file.

  ```json
  {}
  ```

- `phone-island-audio-player-played` THe dispatch of play the audio player.

  ```json
  {}
  ```

- `phone-island-audio-player-paused` THe dispatch of pause the audio player.

  ```json
  {}
  ```

- `phone-island-audio-player-closed` THe dispatch of close the audio player.

  ```json
  {}
  ```

## General Dispatch Events

- `phone-island-user-already-login` Indicates that a the user did login from another window and dispatches an empty object

  ```json
  {}
  ```

- `phone-island-main-presence` Indicates that a message has arrived and dispatches the userMainPresenceUpdate data from the WebSocket

  ```json
  {
    "foo1": {
      // string - The updated username
      "mainPresence": "ringing" // string - The mainPresence status
    }
  }
  ```

- `phone-island-conversations` Indicates that a message has arrived and dispatches the extenUpdate data from the WebSocket

  ```json
  {
    "foo1": {
      // string - The updated username
      "conversations": {
        "PJSIP/91212-00001153>PJSIP/211-00001154": {
          // object - The conversations
          "id": "PJSIP/91212-00001153>PJSIP/211-00001154",
          "owner": "211",
          "chDest": {
            "type": "dest",
            "channel": "PJSIP/211-00001154",
            "callerNum": "211",
            "startTime": 1671557974000,
            "callerName": "foo 1",
            "bridgedNum": "212",
            "bridgedName": "foo 2",
            "inConference": false,
            "channelStatus": "ringing",
            "bridgedChannel": "PJSIP/91212-00001153"
          },
          "linkedId": "1671557974.4928",
          "uniqueId": "1671557974.4929",
          "chSource": {
            "type": "source",
            "channel": "PJSIP/91212-00001153",
            "callerNum": "212",
            "startTime": 1671557974000,
            "callerName": "foo 2",
            "bridgedNum": "211",
            "bridgedName": "foo 1",
            "inConference": false,
            "channelStatus": "ring",
            "bridgedChannel": "PJSIP/211-00001154"
          },
          "duration": 1,
          "startTime": 1671557974000,
          "connected": false,
          "recording": "false",
          "direction": "in",
          "inConference": false,
          "throughQueue": false,
          "throughTrunk": false,
          "counterpartNum": "212",
          "counterpartName": "foo 2"
        }
      }
    }
  }
  ```

- `phone-island-queue-update` Indicates that the informations of a queue are changed.

  ```json
  {
    "401": {
      "name": "QueueOne",
      "queue": "401",
      "members": {
        "211": {
          "type": "static",
          "name": "foo 1",
          "queue": "401",
          "member": "211",
          "paused": false,
          "loggedIn": true,
          "callsTakenCount": 0,
          "lastCallTimestamp": 0,
          "lastPausedInReason": "",
          "lastPausedInTimestamp": 0,
          "lastPausedOutTimestamp": 0
        },
        "214": {
          "type": "static",
          "name": "foo 4",
          "queue": "401",
          "member": "214",
          "paused": false,
          "loggedIn": true,
          "callsTakenCount": 0,
          "lastCallTimestamp": 0,
          "lastPausedInReason": "",
          "lastPausedInTimestamp": 0,
          "lastPausedOutTimestamp": 0
        }
      },
      "avgHoldTime": "0",
      "avgTalkTime": "0",
      "waitingCallers": {},
      "completedCallsCount": "0",
      "abandonedCallsCount": "0",
      "serviceLevelTimePeriod": "60",
      "serviceLevelPercentage": "0.0"
    }
  }
  ```

- `phone-island-queue-member-update` Indicates that the informations of a member of a queue are changed.

  ```json
  {
    "212": {
      "type": "static",
      "name": "foo 2",
      "queue": "302",
      "member": "212",
      "paused": false,
      "loggedIn": true,
      "callsTakenCount": 0,
      "lastCallTimestamp": 0,
      "lastPausedInReason": "",
      "lastPausedInTimestamp": 1678122068625,
      "lastPausedOutTimestamp": 1678122291524
    }
  }
  ```

- `phone-island-parking-update` Indicates update on parking list status

  ```json
  {}
  ```

- `phone-island-presence-change` The event to show transfer view

  ```json
  {
    "status": "dnd" // string - New status of the user
  }
  ```

## Server and Socket Dispatch Events - phone-island-server-* | phone-island-socket-*


- `phone-island-server-reloaded` Indicates that server is reloaded

  ```json
  {}
  ```

- `phone-island-server-disconnected` Indicates that server connection it's been disconnected

  ```json
  {}
  ```

- `phone-island-socket-connected` Indicates that webscket connection it's been connected

  ```json
  {}
  ```

- `phone-island-socket-disconnected` Indicates that webscket connection it's been disconnected

  ```json
  {}
  ```

- `phone-island-socket-reconnected` Indicates that websocket connection it's been reconnected

  ```json
  {}
  ```

- `phone-island-socket-disconnected-popup-open` Indicates that websocket connection missing popup appear

  ```json
  {}
  ```

- `phone-island-socket-disconnected-popup-close` Indicates that websocket connection missing popup disappear

  ```json
  {}
  ```

- `phone-island-default-device-updated` Indicates that user has updated the default device

  ```json
  {
    "id": "91204"
  }
  ```

- `phone-island-internet-connected` Indicates that user has no internet connectivity

  ```json
  {}
  ```

- `phone-island-internet-disconnected` Indicates that user has a valid internet connectivity

  ```json
  {}
  ```
