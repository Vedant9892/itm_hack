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
          bg: '#f8fafc',         // Slate 50 (Foundation)
          surface: '#ffffff',    // White (Surface)
          primary: '#2563eb',    // Blue (Trust)
          secondary: '#10b981',  // Emerald (Vitality/Health)
          accent: '#f43f5e',     // Rose (Heart)
          muted: '#64748b',      // Slate 500 (Muted)
        }
      }
    },
  },
  plugins: [],
}