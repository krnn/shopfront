const colors = require('tailwindcss/colors')

module.exports = {
  purge: {
    content: [
      '../shopfront/templates/*.html',
      '../shopfront/templates/**/*.html',
    ]
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
    transparent: 'transparent',
    current: 'currentColor',
    black: colors.black,
    white: colors.white,
    grey: colors.coolGray,
    primary: colors.indigo,
    accent: colors.orange,
    danger: colors.red,
    success: colors.emerald,
    info: colors.cyan,
    },
    container: {
      center: true,
    },
  },
  variants: {
    extend: {
      borderStyle: ['hover'],
    },
  },
  plugins: [],
}
