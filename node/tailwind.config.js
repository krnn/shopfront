const colors = require('tailwindcss/colors')

module.exports = {
  purge: {
    content: [
      '../shopfront/templates/*.html',
      '../shopfront/templates/**/*.html',
      '../shopfront/static/js/*.js',
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
      borderStyle: ['hover', 'last'],
      visibility: ['group-hover'],
      borderRadius: ['first', 'last'],
    },
  },
  plugins: [],
}
