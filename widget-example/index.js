'use strict'

const NUMBER = "211"
const START_CALL_EVENT = 'phone-island-call-start'

function dispatchCall(name, data) {
  // Dispatch the event to start the call for the phone island
  window.dispatchEvent(new CustomEvent(name, { detail: data }))
}

function startCall(number) {
  dispatchCall(START_CALL_EVENT, {
    number: number,
  })
}

function init() {
  // Handle button click
  const callButton = document.querySelector('#callButton')
  callButton.addEventListener('click', () => {
    startCall(NUMBER)
  })
}

// Wait for content to be rendered
document.addEventListener('DOMContentLoaded', init)
