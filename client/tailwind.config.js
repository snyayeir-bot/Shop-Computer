/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#060913',
          900: '#0B1120',
          850: '#111827',
          800: '#1E293B',
          700: '#334155',
        },
        cyber: {
          cyan: '#06B6D4',
          cyanGlow: '#22D3EE',
          indigo: '#6366F1',
          indigoGlow: '#818CF8',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.45)',
        'glow-indigo': '0 0 20px -3px rgba(99, 102, 241, 0.45)',
        'glow-rose': '0 0 20px -3px rgba(244, 63, 94, 0.45)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
