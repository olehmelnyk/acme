/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './__tests__/**/*.{js,ts,jsx,tsx,mdx}',
    './specs/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './public/**/*.html'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
