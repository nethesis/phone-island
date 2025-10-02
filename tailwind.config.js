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
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        'animated-text': '3s linear 0s infinite alternate move',
        'scroll-text': 'scroll 10s linear infinite',
        'custom-ping': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        //text
        primaryNeutral: '#111827', // gray-900
        primaryNeutralDark: '#F9FAFB', // gray-50

        primaryInvert: '#F9FAFB', // gray-50
        primaryInvertDark: '#111827', // gray-900

        //secondary
        secondaryNeutral: '#374151', // gray-700
        secondaryNeutralDark: '#E5E7EB', // gray-200

        //tertiary
        tertiaryNeutral: '#4b5563', // gray-600
        tertiaryNeutralDark: '#D1D5DB', // gray-300

        //surface

        //surfaceBackground
        surfaceBackground: '#F9FAFB', // gray-50
        surfaceBackgroundDark: '#030712', // gray-950

        //surfaceSidebar
        surfaceSidebar: '#374151', // gray-700
        surfaceSidebarDark: '#374151', // gray-700

        //surfaceSidebarHover
        surfaceSidebarHover: '#4B5563', // gray-600
        surfaceSidebarHoverDark: '#4B5563', // gray-600

        //elavation
        elevationL2: '#F3F4F6', //gray-100
        elevationL2Dark: '#1F2937', // gray-800
        //button

        // Active state
        phoneIslandActive: '#374151', // Gray/700
        phoneIslandActiveDark: '#D1D5DB', // Gray/300

        // Hover state
        phoneIslandHover: '#1F2937', // Gray/800
        phoneIslandHoverDark: '#F9FAFB', // Gray/50

        // Call state
        phoneIslandCall: '#15803D', // Green/700
        phoneIslandCallDark: '#22C55E', // Green/500

        // Call hover state
        phoneIslandCallHover: '#166534', // Green/800
        phoneIslandCallHoverDark: '#86EFAC', // Green/300

        // Close state
        phoneIslandClose: '#B91C1C', // Red/700
        phoneIslandCloseDark: '#EF4444', // Red/500

        // Close hover state
        phoneIslandCloseHover: '#991B1B', // Red/800
        phoneIslandCloseHoverDark: '#FCA5A5', // Red/300

        //icon

        //iconWhite
        iconWhite: '#FFFFFF', // white
        iconWhiteDark: '#FFFFFF', // white

        //iconPrimaryNeutral
        iconPrimaryNeutral: '#111827', // gray-900
        iconPrimaryNeutralDark: '#F9FAFB', // gray-50

        //iconPrimaryInvert
        iconPrimaryInvert: '#F9FAFB', // gray-50
        iconPrimaryInvertDark: '#111827', // gray-900
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
    'pi-text-green-500',
    'pi-bg-green-400',
    'pi-h-[624px]',
    'pi-w-[780px]',
    'pi-h-[524px]',
  ],
}
