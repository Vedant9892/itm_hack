/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Adding your "Startup" palette from the architecture
        brand: {
          primary: '#6366f1', // Indigo/Purple
          dark: '#0f172a',    // Slate/Dark
        }
      }
    },
  },
  plugins: [],
}