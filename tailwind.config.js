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
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}
