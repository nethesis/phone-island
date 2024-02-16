const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  mode: 'jit',
  theme: {
    extend: {
      rotate: {
        135: '135deg',
      },
      zIndex: {
        1000: '1000',
      },
      keyframes: {
        move: {
          '0%, 25%': {
            transform: 'translateX(0%)',
            left: '0%',
          },
          '75%, 100%': {
            transform: 'translateX(-100%)',
            left: '100%',
          },
        },
      },
      animation: {
        'animated-text': '3s linear 0s infinite alternate move',
        'custom-ping': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  variants: {
    scrollbar: ['rounded'],
    extend: {},
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true, preferredStrategy: 'pseudoelements' }),
  ],
  corePlugins: {
    preflight: false,
  },
  prefix: 'pi-',
}
