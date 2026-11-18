/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sentinel: {
          bg: "#F7F9FC",
          surface: "#FFFFFF",
          text: "#172033",
          secondary: "#697586",
          accent: "#315EF5",
          accentHover: "#2548C9",
          teal: "#16A085",
          tealHover: "#117A65",
          softBlue: "#EAF0FF",
          softGreen: "#E7F7F0",
          softOrange: "#FFF3E5",
          softRed: "#FDECEC",
          border: "#E5EAF1",
          borderHover: "#D0D7E2",
          cardHover: "#FAFCFF",
          // Meaningful Severity Colors
          critical: "#E11D48",
          high: "#D97706",
          medium: "#B45309",
          low: "#315EF5",
          info: "#0284C7",
          verified: "#16A085",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'card': '16px',
        'subtle': '12px',
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(23, 32, 51, 0.04), 0 1px 2px rgba(23, 32, 51, 0.02)',
        'elevated': '0 8px 24px rgba(23, 32, 51, 0.06), 0 2px 6px rgba(23, 32, 51, 0.03)',
        'modal': '0 20px 48px rgba(23, 32, 51, 0.12), 0 8px 16px rgba(23, 32, 51, 0.04)',
      }
    },
  },
  plugins: [],
}
