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
        },
        neural: {
          bg: '#020617',
          surface: '#0f172a',
          accent: '#6366f1', // Indigo 500
          cyan: '#22d3ee',   // Cyan 400
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'brightness(1)' },
          '50%': { opacity: 0.7, filter: 'brightness(1.5)' },
        }
      }
    },
  },
  plugins: [],
}