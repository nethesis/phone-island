import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { PhoneIsland } from './App'

// Find all widget divs
const widgetDivs = document.querySelectorAll('.phone-island')

// Inject our React App into each element
widgetDivs.forEach((div) => {
  const config: string = div.getAttribute('data-config')  || ''
  ReactDOM.render(
    <React.StrictMode>
      <PhoneIsland dataConfig={config} />
    </React.StrictMode>,
    div,
  )
})
