import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-lexend)", "system-ui", "sans-serif"],
        mono: ["var(--font-lexend)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #f093fb 0%, #f5576c 25%, #4facfe 50%, #9c88ff 75%, #ffa726 100%)',
        'gradient-main-radial': 'radial-gradient(ellipse at center, #f093fb 0%, #9c88ff 40%, #ffa726 100%)',
        'main-overlay': 'linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.15) 25%, rgba(79, 172, 254, 0.2) 50%, rgba(156, 136, 255, 0.15) 75%, rgba(255, 167, 38, 0.1) 100%)',
      },
      colors: {
        'blue-primary': '#2563eb',
        'blue-secondary': '#3b82f6',
        'blue-hover': '#1d4ed8',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}

module.exports = config;
