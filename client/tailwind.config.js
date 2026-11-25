/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#25232B',
          900: '#323039',
          850: '#3A3742',
          800: '#423F4B',
          700: '#504C5B',
          600: '#625D6F',
        },
        dusty: {
          900: '#3E334B',
          800: '#514262',
          700: '#604F74',
          600: '#705E86',
          500: '#8874A0',
          400: '#A795BD',
          300: '#C8BBD8',
        },
        gold: {
          600: '#C9A126',
          500: '#E5BF3F',
          400: '#F2CE54',
          300: '#F7DC7C',
          100: '#FDF3CC',
        },
      },
    },
  },
  plugins: [],
};
