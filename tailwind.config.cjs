const colors = require('tailwindcss/colors');

module.exports = {
  content: {
    files: [
      './index.html',
      './src/**/*.{js,jsx,ts,tsx,html}',
      './apps/**/*.{js,jsx,ts,tsx,html}',
    ],
    safelist: [
      'shadow-md',
      'bg-blue-100',
      'bg-purple-100',
      'bg-green-100',
      'bg-orange-100',
    ],
  },
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
