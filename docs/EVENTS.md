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

## Available Events

- `phone-island-call-start` The event to start a call
  ```json
  {
    "number": "200" // string - The number to be called
  }
  ```
