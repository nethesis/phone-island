import * as React from 'react'

const PhoneKeyboardSolid = (props) => (
  <svg width={22} height={22} fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <g clipPath='url(#a)' fill='#fff'>
      <circle cx={3} cy={3} r={3} />
      <circle cx={19} cy={3} r={3} />
      <circle cx={11} cy={3} r={3} />
      <circle cx={3} cy={11} r={3} />
      <circle cx={19} cy={11} r={3} />
      <circle cx={11} cy={11} r={3} />
      <circle cx={3} cy={19} r={3} />
      <circle cx={19} cy={19} r={3} />
      <circle cx={11} cy={19} r={3} />
    </g>
    <defs>
      <clipPath id='a'>
        <path fill='#fff' d='M0 0h22v22H0z' />
      </clipPath>
    </defs>
  </svg>
)

export default PhoneKeyboardSolid
