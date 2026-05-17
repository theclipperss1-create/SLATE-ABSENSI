/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        "apple-bg": "#F5F5F7",
        "apple-card": "#FFFFFF",
        "apple-mono-black": "#000000",
        "apple-mono-charcoal": "#1D1D1F",
        "apple-mono-gray-dark": "#86868B",
        "apple-mono-gray-light": "#E5E5EA",
      },
    },
  },
  plugins: [],
}
