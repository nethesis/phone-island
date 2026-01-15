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
        // text
        primaryNeutral: 'var(--color-primary-neutral)',
        primaryNeutralDark: 'var(--color-primary-neutral-dark)',
        primaryInvert: 'var(--color-primary-invert)',
        primaryInvertDark: 'var(--color-primary-invert-dark)',
        // secondary
        secondaryNeutral: 'var(--color-secondary-neutral)',
        secondaryNeutralDark: 'var(--color-secondary-neutral-dark)',
        // tertiary
        tertiaryNeutral: 'var(--color-tertiary-neutral)',
        tertiaryNeutralDark: 'var(--color-tertiary-neutral-dark)',
        // surface
        surfaceBackground: 'var(--color-surface-background)',
        surfaceBackgroundDark: 'var(--color-surface-background-dark)',
        surfaceSidebar: 'var(--color-surface-sidebar)',
        surfaceSidebarDark: 'var(--color-surface-sidebar-dark)',
        surfaceSidebarHover: 'var(--color-surface-sidebar-hover)',
        surfaceSidebarHoverDark: 'var(--color-surface-sidebar-hover-dark)',
        // elevation
        elevationL2: 'var(--color-elevation-l2)',
        elevationL2Dark: 'var(--color-elevation-l2-dark)',
        // phone island - active state
        phoneIslandActive: 'var(--color-phone-island-active)',
        phoneIslandActiveDark: 'var(--color-phone-island-active-dark)',
        // phone island - hover state
        phoneIslandHover: 'var(--color-phone-island-hover)',
        phoneIslandHoverDark: 'var(--color-phone-island-hover-dark)',
        // phone island - call state
        phoneIslandCall: 'var(--color-phone-island-call)',
        phoneIslandCallDark: 'var(--color-phone-island-call-dark)',
        phoneIslandCallHover: 'var(--color-phone-island-call-hover)',
        phoneIslandCallHoverDark: 'var(--color-phone-island-call-hover-dark)',
        // phone island - close state
        phoneIslandClose: 'var(--color-phone-island-close)',
        phoneIslandCloseDark: 'var(--color-phone-island-close-dark)',
        phoneIslandCloseHover: 'var(--color-phone-island-close-hover)',
        phoneIslandCloseHoverDark: 'var(--color-phone-island-close-hover-dark)',
        // icons
        iconWhite: 'var(--color-icon-white)',
        iconWhiteDark: 'var(--color-icon-white-dark)',
        iconPrimaryNeutral: 'var(--color-icon-primary-neutral)',
        iconPrimaryNeutralDark: 'var(--color-icon-primary-neutral-dark)',
        iconPrimaryInvert: 'var(--color-icon-primary-invert)',
        iconPrimaryInvertDark: 'var(--color-icon-primary-invert-dark)',
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
}
