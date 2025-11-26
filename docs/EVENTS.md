# EVENTS

The communication inside and outside the _phone-island_ is made through the [Event interface](https://developer.mozilla.org/en-US/docs/Web/API/Event).

During the initialization some event listeners are attached to the `window` object.

To trigger the events it is therefore necessary to dispatch events on the `window` object.

Events dispatch can be done using the [CustomEvent constructor](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent).

## Table of Contents

- [Usage](#usage)
- [Listen Events (External → Phone Island)](#listen-events-external--phone-island)
  - [Core Phone Island Events](#core-phone-island-events)
  - [Device Management Events](#device-management-events)
  - [Ringtone Management Events](#ringtone-management-events)
  - [Call Control Events](#call-control-events)
  - [Recording Events](#recording-events)
  - [Audio Player Events](#audio-player-events)
  - [Video & Screen Share Events](#video--screen-share-events)
  - [Conference Events](#conference-events)
  - [Debug Events](#debug-events)
- [Dispatch Events (Phone Island → External)](#dispatch-events-phone-island--external)
  - [Core Dispatch Events](#core-dispatch-events)
  - [Device Status Events](#device-status-events)
  - [Ringtone Status Events](#ringtone-status-events)
  - [Call Status Events](#call-status-events)
  - [Recording Status Events](#recording-status-events)
  - [Audio Player Status Events](#audio-player-status-events)
  - [Video & Screen Share Status Events](#video--screen-share-status-events)
  - [Conference Status Events](#conference-status-events)
  - [System Events](#system-events)
  - [WebSocket & Server Events](#websocket--server-events)
  - [UI State Events](#ui-state-events)

## Usage

### Helper Function

The following is an example of helper function that can be used to dispatch events, the target can be any object but it uses `window` by default.

```javascript
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
eventDispatch('phone-island-call-start', { number: '212' })
```

As you can see, the helper function can be used in the following way:

`eventDispatch('<event-name>', '<data-object>')`

### Complete Vanilla JavaScript Integration Example

For a complete, working example showing how to integrate phone-island events in a vanilla JavaScript application, see:

**📁 [widget-example/index.html](../widget-example/index.html)** - Complete HTML integration example with UI  
**📁 [widget-example/index.js](../widget-example/index.js)** - JavaScript event handling and integration logic

This example demonstrates:

1. **Event Dispatching**: How to send commands to phone-island
2. **Event Listening**: How to receive notifications from phone-island  
3. **Complete Integration**: Real-world buttons and status updates
4. **Utility Functions**: Ready-to-use functions for common operations
5. **Token Configuration**: How to properly configure the phone-island widget
6. **Real-time Event Log**: Visual feedback for all phone-island events
7. **Error Handling**: Status updates and console logging for debugging

**🚀 Quick Start:**
1. Replace `YOUR_BASE64_ENCODED_TOKEN_HERE` with your actual Base64 encoded token
2. Open `widget-example/index.html` in your browser
3. Use the buttons to test integration with phone-island
4. Monitor the event log and console for real-time feedback

**🎯 Key Features:**
- Interactive UI with all major phone-island controls
- Real-time status updates and event logging
- Theme switching (light/dark)
- WebRTC device management
- Call controls (start, end, mute, hold, transfer)
- Debugging utilities and status information

---

## Listen Events (External → Phone Island)

These events are triggered by external applications to control the phone-island behavior.

### Core Phone Island Events

#### `phone-island-expand`
The event to expand phone-island

```json
{}
```

#### `phone-island-compress`
The event to compress phone-island

```json
{}
```

#### `phone-island-attach`
The event to initialize webrtc with phone-island

```json
{
  "id": "269",
  "type": "webrtc",
  "secret": "<secret>",
  "username": "269",
  "description": "",
  "actions": {
    "answer": true,
    "dtmf": true,
    "hold": true
  }
}
```

#### `phone-island-detach`
The event to destroy webrtc instance with phone-island

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

#### `phone-island-theme-change`
The event to change phone-island theme

```json
{
  "selectedTheme": "light | dark"
}
```

#### `phone-island-default-device-change`
The event to change phone-island default device

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

#### `phone-island-check-connection`
The event to manually check if an user has internet connection

```json
{}
```

#### `phone-island-sideview-open`
The event to manually open phone island right menu

```json
{}
```

#### `phone-island-sideview-close`
The event to manually close phone island right menu

```json
{}
```

### Device Management Events

#### `phone-island-audio-input-change`
The event to change default audio input device for phone island

```json
{
  "deviceId": "756ada2c6b10546e28808c13062982d66cae723eba1e03fe3834f8df79f794ee"
}
```

#### `phone-island-audio-output-change`
The event to change default audio output device for phone island

```json
{
  "deviceId": "2d331f699ec92b95000f3a656ab1d6ff9f17b3c9502c4a8db1d3f91905b5743f"
}
```

#### `phone-island-video-input-change`
The event to change default video input device for phone island

```json
{
  "deviceId": "116ada2c6b10546e28808c13062982d66cae723eba1e03fe3834f8df79f794ee"
}
```

### Ringtone Management Events

#### `phone-island-ringing-tone-list`
Request the list of available ringtones

```json
{}
```

#### `phone-island-ringing-tone-select`
Select a ringtone to use for incoming calls

```json
{
  "name": "default"
}
```

Available ringtone names:
- `default` - Default incoming call ringtone
- `classic` - Classic tone
- `modern` - Modern tone
- `soft` - Soft tone
- `gentle` - Gentle tone

#### `phone-island-ringing-tone-output`
Set the audio output device for ringtone playback

```json
{
  "deviceId": "2d331f699ec92b95000f3a656ab1d6ff9f17b3c9502c4a8db1d3f91905b5743f"
}
```

### Call Control Events

#### `phone-island-call-start`
The event to start a call

```json
{
  "number": "200"
}
```

#### `phone-island-call-answer`
The event to answer a call

```json
{}
```

#### `phone-island-call-end`
The event to end a call

```json
{}
```

#### `phone-island-call-hold`
The event to hold a call

```json
{}
```

#### `phone-island-call-unhold`
The event to unhold a call

```json
{}
```

#### `phone-island-call-mute`
The event to mute a call

```json
{}
```

#### `phone-island-call-unmute`
The event to unmute a call

```json
{}
```

#### `phone-island-call-transfer-open`
The event to show transfer view

```json
{}
```

#### `phone-island-call-transfer-close`
The event to close transfer view

```json
{}
```

#### `phone-island-call-transfer-switch`
The event to switch caller in transfer view

```json
{}
```

#### `phone-island-call-transfer-cancel`
The event to cancel the transfer

```json
{}
```

#### `phone-island-call-transfer`
The event to transfer a call

```json
{
  "number": "200"
}
```

#### `phone-island-call-keypad-open`
The event to show keypad view

```json
{}
```

#### `phone-island-call-keypad-close`
The event to close keypad view

```json
{}
```

#### `phone-island-call-keypad-send`
The event to send DTMF tone

```json
{
  "key": "1"
}
```

#### `phone-island-call-park`
The event to park a call

```json
{}
```

#### `phone-island-call-intrude`
The event to intrude in a call

```json
{
  "number": "200"
}
```

#### `phone-island-call-listen`
The event to listen a call

```json
{
  "number": "200"
}
```

#### `phone-island-call-audio-input-switch`
The event to change audio input device during a call

```json
{
  "deviceId": "756ada2c6b10546e28808c13062982d66cae723eba1e03fe3834f8df79f794ee"
}
```

#### `phone-island-call-audio-output-switch`
The event to change audio output device during a call

```json
{
  "deviceId": "2d331f699ec92b95000f3a656ab1d6ff9f17b3c9502c4a8db1d3f91905b5743f"
}
```

#### `phone-island-call-video-input-switch`
The event to change video input device during a call

```json
{
  "deviceId": "116ada2c6b10546e28808c13062982d66cae723eba1e03fe3834f8df79f794ee"
}
```

#### `phone-island-call-actions-open`
The event to open actions view

```json
{}
```

#### `phone-island-call-actions-close`
The event to close actions view

```json
{}
```

### Recording Events

#### `phone-island-recording-open`
The event to show the recording view

```json
{}
```

#### `phone-island-recording-close`
The event to close the recording view

```json
{}
```

#### `phone-island-recording-start`
The event to start the recording

```json
{}
```

#### `phone-island-recording-stop`
The event to stop the recording

```json
{}
```

#### `phone-island-recording-play`
The event to play the recording

```json
{}
```

#### `phone-island-recording-pause`
The event to pause the recording

```json
{}
```

#### `phone-island-recording-save`
The event to save the recording

```json
{}
```

#### `phone-island-recording-delete`
The event to delete the recording

```json
{}
```

#### `phone-island-physical-recording-view`
The event to launch phone island physical device recording

```json
{}
```

#### `phone-island-physical-recording-open`
The event to start physical recording

```json
{}
```

### Audio Player Events

#### `phone-island-audio-player-start`
The event to show the audio player view and play an audio file

```json
{
  "base64_audio_file": "UklGRiQAAABXQVZFZm10IBAAAAABAAIARKwAABCxAgAEABAAZGF0YYIAAAAAA==",
  "type": "call_recording || announcement",
  "id": "1",
  "description": "My Audio File"
}
```

#### `phone-island-audio-player-play`
The event to play the audio player

```json
{}
```

#### `phone-island-audio-player-pause`
The event to pause the audio player

```json
{}
```

#### `phone-island-audio-player-close`
The event to close the audio player

```json
{}
```

### Video & Screen Share Events

#### `phone-island-fullscreen-enter`
The event to manually enter fullscreen mode

```json
{}
```

#### `phone-island-fullscreen-exit`
The event to manually exit fullscreen mode

```json
{}
```

#### `phone-island-video-enable`
The event to manually enable the video stream during a call

```json
{}
```

#### `phone-island-video-disable`
The event to manually disable the video stream during a call

```json
{}
```

#### `phone-island-screen-share-join`
The event triggered when starting to join a screen share initiated by another user

```json
{}
```

#### `phone-island-screen-share-leave`
The event triggered when starting to leave a screen share initiated by another user

```json
{}
```

#### `phone-island-screen-share-start`
The event triggered when starting screen sharing

```json
{}
```

#### `phone-island-screen-share-stop`
The event triggered when stopping the screen sharing

```json
{}
```

### Conference Events

#### `phone-island-owner-conference-enter`
The event to advert that owner has entered inside conference

```json
{}
```

### Debug Events

#### `phone-island-view-changed`
Force to change phone-island view

```json
{
  "viewType": "call"
}
```

#### `phone-island-call-status`
Retrieve all information about call

```json
{}
```

#### `phone-island-user-status`
Retrieve all information about main user

```json
{}
```

#### `phone-island-all-users-status`
Retrieve all information about all users

```json
{}
```

#### `phone-island-status`
Retrieve all information about phone island

```json
{}
```

#### `phone-island-webrtc-status`
Retrieve all information about webrtc

```json
{}
```

#### `phone-island-screen-share-status`
Retrieve all information about screen share

```json
{}
```

#### `phone-island-player-status`
Retrieve all information about audio player

```json
{}
```

#### `phone-island-player-force-stop`
Force to stop all audio

```json
{}
```

---

## Dispatch Events (Phone Island → External)

These events are dispatched by phone-island to notify external applications about state changes.

### Core Dispatch Events

#### `phone-island-expanded`
The dispatch of phone-island expand

```json
{}
```

#### `phone-island-compressed`
The dispatch of phone-island compress

```json
{}
```

#### `phone-island-attached`
The dispatch of initialize webrtc with phone-island (switch to webrtc device)

```json
{}
```

#### `phone-island-detached`
The dispatch of destroy webrtc instance with phone-island (switch to physical device)

```json
{}
```

#### `phone-island-theme-changed`
The dispatch of change phone-island theme

```json
{}
```

#### `phone-island-default-device-changed`
The dispatch of change phone-island default device

```json
{}
```

#### `phone-island-presence-changed`
The dispatch of change operator status

```json
{}
```

#### `phone-island-all-alerts-removed`
The dispatch of clear alerts status

```json
{}
```

#### `phone-island-extensions-update`
The dispatch of extensions update

```json
{}
```

### Device Status Events

#### `phone-island-audio-input-changed`
The dispatch of change default audio input device for phone island

```json
{}
```

#### `phone-island-audio-output-changed`
The dispatch of change default audio output device for phone island

```json
{}
```

#### `phone-island-video-input-changed`
The dispatch of change default video input device for phone island

```json
{}
```

### Ringtone Status Events

#### `phone-island-ringing-tone-list-response`
Response containing the list of available ringtones

```json
{
  "ringtones": [
    {
      "name": "default",
      "displayName": "Default"
    },
    {
      "name": "classic",
      "displayName": "Classic"
    },
    {
      "name": "modern",
      "displayName": "Modern"
    },
    {
      "name": "soft",
      "displayName": "Soft"
    }
     {
      "name": "gentle",
      "displayName": "Gentle"
    }
  ]
}
```

#### `phone-island-ringing-tone-selected`
Notification that a ringtone has been selected

```json
{
  "name": "default"
}
```

#### `phone-island-ringing-tone-output-changed`
Notification that the ringtone output device has been changed

```json
{
  "deviceId": "2d331f699ec92b95000f3a656ab1d6ff9f17b3c9502c4a8db1d3f91905b5743f"
}
```

### Call Status Events

#### `phone-island-call-ringing`
The dispatch of call ringing

```json
{}
```

#### `phone-island-call-started`
The dispatch of call start

```json
{}
```

#### `phone-island-outgoing-call-started`
The dispatch of outgoing call start

```json
{}
```

#### `phone-island-call-answered`
The dispatch of call answer (if not empty call it's been answered from another device)

```json
{
  "extensionType": "mobile"
}
```

#### `phone-island-call-ended`
The dispatch of call end

```json
{}
```

#### `phone-island-call-held`
The dispatch of call hold

```json
{}
```

#### `phone-island-call-unheld`
The dispatch of call unhold

```json
{}
```

#### `phone-island-call-muted`
The dispatch of call mute

```json
{}
```

#### `phone-island-call-unmuted`
The dispatch of call unmute

```json
{}
```

#### `phone-island-call-transfer-opened`
The dispatch of call show transfer view

```json
{}
```

#### `phone-island-call-transfer-closed`
The dispatch of call close transfer view

```json
{}
```

#### `phone-island-call-transfer-switched`
The dispatch of call switch caller in transfer view

```json
{}
```

#### `phone-island-call-transfer-canceled`
The dispatch of call cancel the transfer

```json
{}
```

#### `phone-island-call-transfered`
The dispatch of call transfer

```json
{}
```

#### `phone-island-call-conferenced`
The dispatch of call being conferenced

```json
{}
```

#### `phone-island-call-transfer-successfully-popup-open`
The event to advert if a transfer has been made successfully and phone-island popup is open

```json
{}
```

#### `phone-island-call-transfer-successfully-popup-close`
The event to advert if a transfer has been made successfully and phone-island popup is close

```json
{}
```

#### `phone-island-call-transfer-failed`
The event to advert if a transfer has failed

```json
{}
```

#### `phone-island-call-keypad-opened`
The dispatch of show keypad view

```json
{}
```

#### `phone-island-call-keypad-closed`
The dispatch of close keypad view

```json
{}
```

#### `phone-island-call-keypad-sent`
The dispatch of send DTMF tone

```json
{}
```

#### `phone-island-call-parked`
The dispatch of call park

```json
{}
```

#### `phone-island-call-listened`
The dispatch of call listen

```json
{}
```

#### `phone-island-call-intruded`
The dispatch of call intrude

```json
{}
```

#### `phone-island-call-audio-input-switched`
The dispatch of call audio input switch

```json
{}
```

#### `phone-island-call-audio-output-switched`
The dispatch of call audio output switch

```json
{}
```

#### `phone-island-call-video-input-switched`
The dispatch of call video input switch

```json
{}
```

#### `phone-island-call-actions-opened`
The dispatch of call actions open

```json
{}
```

#### `phone-island-call-actions-closed`
The dispatch of call actions close

```json
{}
```

#### `phone-island-call-switched`
Indicates that user has a switched call to another devices

```json
{}
```

#### `phone-island-action-physical`
The dispatch of physical phone call or action

```json
{
  "url": "http://username:password@physicalPhoneIp/cgi-bin/ConfigManApp.com?key=numberCalled;ENTER",
  "urlType": "call"
}
```

### Recording Status Events

#### `phone-island-recording-opened`
The dispatch of show the recording view

```json
{}
```

#### `phone-island-recording-closed`
The dispatch of close the recording view

```json
{}
```

#### `phone-island-recording-started`
The dispatch of start the recording

```json
{}
```

#### `phone-island-recording-stopped`
The dispatch of stop the recording

```json
{}
```

#### `phone-island-recording-played`
The dispatch of play the recording

```json
{}
```

#### `phone-island-recording-paused`
The dispatch of pause the recording

```json
{}
```

#### `phone-island-recording-saved`
The dispatch of save the recording

```json
{
  "tempFileName": "user-cti-1686824454167.wav",
  "audioFileURL": "blob:http://localhost:6006/3897f2da-2411-4e38-a024-56bbeab72a91"
}
```

#### `phone-island-recording-deleted`
The dispatch of delete the recording

```json
{}
```

#### `phone-island-physical-recording-opened`
The dispatch of show the physical recording view

```json
{}
```

#### `phone-island-physical-recording-saved`
The dispatch of save the physical recording

```json
{}
```

### Audio Player Status Events

#### `phone-island-audio-player-started`
The dispatch of show the audio player view and play an audio file

```json
{}
```

#### `phone-island-audio-player-played`
The dispatch of play the audio player

```json
{}
```

#### `phone-island-audio-player-paused`
The dispatch of pause the audio player

```json
{}
```

#### `phone-island-audio-player-closed`
The dispatch of close the audio player

```json
{}
```

### Video & Screen Share Status Events

#### `phone-island-fullscreen-entered`
Indicates that phone island entered fullscreen mode

```json
{}
```

#### `phone-island-fullscreen-exited`
Indicates that phone island exited fullscreen mode

```json
{}
```

#### `phone-island-video-enabled`
Indicates that the video has been enabled during the current call

```json
{}
```

#### `phone-island-video-disabled`
Indicates that the video has been disabled during the current call

```json
{}
```

#### `phone-island-screen-share-started`
Indicates that the screen sharing has started during the current call

```json
{}
```

#### `phone-island-screen-share-stopped`
Indicates that the screen sharing has stopped during the current call

```json
{}
```

#### `phone-island-screen-share-joined`
Indicates that the user successfully joined a screen sharing initiated by the other party

```json
{}
```

#### `phone-island-screen-share-left`
Indicates that the user successfully left a screen sharing initiated by the other party

```json
{}
```

### Conference Status Events

#### `phone-island-conference-finished`
The dispatch of finished conference

```json
{}
```

#### `phone-island-owner-conference-finished`
The dispatch of owner conference finished

```json
{}
```

### System Events

#### `phone-island-user-already-login`
Indicates that a the user did login from another window and dispatches an empty object

```json
{}
```

#### `phone-island-main-presence`
Indicates that a message has arrived and dispatches the userMainPresenceUpdate data from the WebSocket

```json
{
  "foo1": {
    "mainPresence": "ringing"
  }
}
```

#### `phone-island-conversations`
Indicates that a message has arrived and dispatches the extenUpdate data from the WebSocket

```json
{
  "foo1": {
    "conversations": {
      "PJSIP/91212-00001153>PJSIP/211-00001154": {
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

#### `phone-island-queue-update`
Indicates that the information of a queue are changed

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

#### `phone-island-queue-member-update`
Indicates that the information of a member of a queue are changed

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

#### `phone-island-parking-update`
Indicates update on parking list status

```json
{}
```

#### `phone-island-presence-change`
The event to show transfer view

```json
{
  "status": "dnd"
}
```

#### `phone-island-default-device-updated`
Indicates that user has updated the default device

```json
{
  "id": "91204"
}
```

#### `phone-island-internet-connected`
Indicates that user has no internet connectivity

```json
{}
```

#### `phone-island-internet-disconnected`
Indicates that user has a valid internet connectivity

```json
{}
```

#### `phone-island-voicemail-received`
Indicates that user has a received a new voicemail message

```json
{
  "voicemail": "228",
  "counter": "14"
}
```

#### `phone-island-streaming-information-received`
Indicates that streaming devices received url update

```json
{}
```

#### `phone-island-alert-removed`
Indicates that alert is closed

```json
{}
```

#### `phone-island-url-parameter-opened`
Indicates that user has clicked on url parameter button

```json
{
  "counterpartNum": "1234",
  "counterpartName": "Antonio test",
  "owner": "91269",
  "uniqueId": "21234",
  "throughQueue": true,
  "throughTrunk": false,
  "direction": "in",
  "connected": true,
  "url": "www.google.it/$CALLER_NUMBER-$CALLER_NAME-$CALLED-$UNIQUEID"
}
```

### WebSocket & Server Events

#### `phone-island-server-reloaded`
Indicates that server is reloaded

```json
{}
```

#### `phone-island-server-disconnected`
Indicates that server connection it's been disconnected

```json
{}
```

#### `phone-island-socket-connected`
Indicates that websocket connection it's been connected

```json
{}
```

#### `phone-island-socket-disconnected`
Indicates that websocket connection it's been disconnected

```json
{}
```

#### `phone-island-socket-reconnected`
Indicates that websocket connection it's been reconnected

```json
{}
```

#### `phone-island-socket-disconnected-popup-open`
Indicates that websocket connection missing popup appear

```json
{}
```

#### `phone-island-socket-disconnected-popup-close`
Indicates that websocket connection missing popup disappear

```json
{}
```

#### `phone-island-socket-authorized`
Indicates that socket it's been authorized

```json
{}
```

### UI State Events

#### `phone-island-sideview-opened`
Indicates that phone island right menu is open

```json
{}
```

#### `phone-island-sideview-closed`
Indicates that phone island right menu is closed

```json
{}
```

#### `phone-island-size-change`
Get phone-island resize information

```json
{
  "width": "348px",
  "height": "304px",
  "borderRadius": "20px",
  "padding": "24px"
}
```

### User informations Events

#### `phone-island-user-informations-update`
Indicates new informations about main user

```json
{
  "name": "test",
  "username": "user",
  "mainPresence": "online",
  "presence": "online",
  "endpoints": {},
  "presenceOnBusy": "callforward",
  "presenceOnUnavailable": "online",
  "recallOnBusy": "disabled",
  "profile": {},
  "default_device": {},
  "lkhash": "",
  "proxy_fqdn": "",
  "settings": {}
}
```

#### `phone-island-conversation-transcription`
Indicates that a real-time transcription message has been received for an active conversation. This event is triggered when the system receives transcription data from the middleware.

```json
{
  "uniqueid": "1759147339.1198",
  "transcription": "Hello, how can I help you today?",
  "timestamp": 25.55,
  "speaker_name": "Antonio Colapietro",
  "speaker_number": "202",
  "speaker_counterpart_name": "Lorenzo Di Carlantonio",
  "speaker_counterpart_number": "204",
  "is_final": true
}
```

**Parameters:**
- `uniqueid`: Unique identifier for the conversation
- `transcription`: The transcribed text content
- `timestamp`: Time offset in seconds from the start of the conversation
- `speaker_name`: Display name of the person speaking
- `speaker_number`: Phone number/extension of the speaker
- `speaker_counterpart_name`: Display name of the other party in the conversation
- `speaker_counterpart_number`: Phone number/extension of the other party
- `is_final`: Boolean indicating if this is a final transcription (`true`) or interim result (`false`)

**Usage Notes:**
- Interim results (`is_final: false`) may be updated multiple times as speech recognition refines the text
- Final results (`is_final: true`) represent the completed, stable transcription
- Only users who are participants in the conversation (matching speaker or counterpart) will receive these events
- This event requires the phone-island to be connected to a middleware that supports transcription services
