/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: '#8B9A6E',
        ivory: '#F7F2EB',
        sand: '#EAE2D6',
        softGray: '#EEEEEE',
        charcoal: '#1E1E1E',
      },
      boxShadow: {
        soft: '0 16px 32px rgba(30,30,30,0.08)',
      },
    },
  },
  plugins: [],
};
