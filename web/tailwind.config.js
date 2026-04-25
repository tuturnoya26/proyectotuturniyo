/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0A',
        bgCard: '#1A1A1A',
        bgElevated: '#222222',
        accent: '#029FAD',
        accentDark: '#027F8A',
        border: '#2A2A2A',
        muted: '#A1A1A1',
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
