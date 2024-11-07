const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  mode: 'jit',
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true, preferredStrategy: 'pseudoelements' }),
  ],
  darkMode: 'selector',
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

  corePlugins: {
    preflight: false,
  },
  prefix: 'pi-',
  safelist: [
    'pi-border-4',
    'pi-rounded-2xl',
    'pi-p-4',
    'pi-flex',
    'pi-gap-5',
    'pi-items-center',
    'pi-border-red-600',
    'pi-border-orange-600',
    'pi-border-green-600',
  ],
}
