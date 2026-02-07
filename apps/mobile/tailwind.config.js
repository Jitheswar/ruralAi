/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#059669',
        danger: '#DC2626',
        warning: '#D97706',
      },
    },
  },
  plugins: [],
};
