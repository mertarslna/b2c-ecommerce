/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',

    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'spanish-gray': 'hsl(0, 0%, 60%)',
        'sonic-silver': 'hsl(0, 0%, 47%)',
        'eerie-black': 'hsl(0, 0%, 13%)',
        'salmon-pink': 'hsl(353, 100%, 78%)',
        'sandy-brown': 'hsl(29, 90%, 65%)',
        'bittersweet': 'hsl(0, 100%, 70%)',
        'ocean-green': 'hsl(152, 51%, 52%)',
        'davys-gray': 'hsl(0, 0%, 33%)',
        'cultured': 'hsl(0, 0%, 93%)',
        'white': 'hsl(0, 100%, 100%)',
        'onyx': 'hsl(0, 0%, 27%)',
      },
     
    },
  },
  plugins: [],
};