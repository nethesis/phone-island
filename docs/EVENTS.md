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

## Listened Events

- `phone-island-call-start` The event to start a call

  ```json
  {
    "number": "200" // string - The number to be called
  }
  ```

- `phone-island-recording-start` The event to show the recording view.

  ```json
  {}
  ```

- `phone-island-audio-player-start` The event to show the audio player view and play an audio file.

  ```json
  {
    "base64_audio_file": "UklGRiQAAABXQVZFZm10IBAAAAABAAIARKwAABCxAgAEABAAZGF0YYIAAAAAA==", // string - The audio file to be played in base64 format, ignored if type is present
    "type": "call_recording" || "announcement", // (optional) The type of the audio to be played
    "id" : "1", // string - (optional) The id of the call_recording or announcement, required if type is present
    "description": "My Audio File" // string - (optional) The description of the given file
  }
  ```

## Dispatched Events

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

- `phone-island-outgoing-call-started` Indicates that an outgoing call has started and dispatches the called name and number.

  ```json
  {
    "name": "Foo 1", // string - The called name
    "number": "211" // string - The called number
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

- `phone-island-recording-save` Indicates that the recorded audio was saved by the user from the recording view.

  ```json
  {
    "tempFileName": "user-cti-1686824454167.wav", // string - The temp file name of the asterisk recording to pass to the /enable_announcement API
    "audioFileURL": "blob:http://localhost:6006/3897f2da-2411-4e38-a024-56bbeab72a91" // string - The local URL of the recorded file in blob format
  }
  ```

- `phone-island-audio-player-closed` Indicates that the audio player view was closed by the user.

  ```json
  {}
  ```

- `phone-island-audio-player-started` Indicates that the audio player started playing an audio.

  ```json
  {}
  ```

- `phone-island-server-reloaded` Indicates that server is reloaded

  ```json
  {}
  ```

- `phone-island-transfer-call` The event to transfer call.

  ```json
  {
    "to": "123456" // string - The transfered number
  }
  ```

- `phone-island-call-parked` Indicates that actual call it's been parked

  ```json
  {}
  ```

- `phone-island-socket-disconnected` Indicates that webscket connection it's been disconnected

  ```json
  {}
  ```

- `phone-island-parking-update` Indicates update on parking list status

  ```json
  {}
  ```
