// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { PhoneIsland } from './App'

// Find all widget divs
const widgetDivs = document.querySelectorAll('.phone-island')

// Inject our React App into each element
widgetDivs.forEach((div) => {
  const config: string = div.getAttribute('data-config') || ''
  const always: boolean = div.getAttribute('always') === 'true' ? true : false

  const root = createRoot(div)
  root.render(
    <React.StrictMode>
      <PhoneIsland dataConfig={config} always={always} />
    </React.StrictMode>,
  )
})
