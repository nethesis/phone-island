// Copyright (C) 2024 Nethesis S.r.l.
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
  const showAlways: boolean = div.getAttribute('showAlways') === 'true' ? true : false
  const uaType: string = div.getAttribute('ua-type') || ''
  const urlParamWithEvent: boolean = div.getAttribute('urlParamWithEvent') === 'true' ? true : false
  const sipOnly: boolean = div.getAttribute('data-sip-only') === 'true'
  const displayName: string | undefined = div.getAttribute('data-display-name') || undefined

  const root = createRoot(div)
  root.render(
    <React.StrictMode>
      <PhoneIsland
        dataConfig={config}
        showAlways={showAlways}
        uaType={uaType}
        urlParamWithEvent={urlParamWithEvent}
        sipOnly={sipOnly}
        displayName={displayName}
      />
    </React.StrictMode>,
  )
})
