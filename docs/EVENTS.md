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

## Dispated Events

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
