const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'base-100': colors.slate[100],
        'base-700': colors.slate[700],
        accent: colors.emerald,
        'accent-sky': colors.sky,
        'accent-amber': colors.amber,
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
