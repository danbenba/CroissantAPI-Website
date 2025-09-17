/** @type {import('tailwindcss').Config} */
const { heroui } = require("@heroui/theme");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#191b20",
        secondary: "#23242a",
        accent: "#8fa1c7",
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #f093fb 0%, #f5576c 25%, #4facfe 50%, #9c88ff 75%, #ffa726 100%)',
        'gradient-main-radial': 'radial-gradient(ellipse at center, #f093fb 0%, #9c88ff 40%, #ffa726 100%)',
        'main-overlay': 'linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.15) 25%, rgba(79, 172, 254, 0.2) 50%, rgba(156, 136, 255, 0.15) 75%, rgba(255, 167, 38, 0.1) 100%)',
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
      },
      maskImage: {
        'radial-from-10%-to-70%-at-top': 'radial-gradient(ellipse 150% 50% at 50% 0%, transparent 10%, black 70%)',
        'b-from-10%-to-70%': 'linear-gradient(to bottom, transparent 10%, black 70%)',
      },
      keyframes: {
        shimmer: {
          from: {
            backgroundPosition: "0 0",
          },
          to: {
            backgroundPosition: "-200% 0",
          },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        dark: {
          colors: {
            background: "#0D1117",
            foreground: "#ffffff",
            primary: {
              50: "#3B096C",
              100: "#520F83",
              200: "#7318A2",
              300: "#9823C2",
              400: "#c031e2",
              500: "#DD62ED",
              600: "#F182F6",
              700: "#FCADF9",
              800: "#FDD5F9",
              900: "#FEECFE",
              DEFAULT: "#DD62ED",
              foreground: "#ffffff",
            },
            focus: "#F182F6",
          },
        },
      },
    }),
    function({ addUtilities }) {
      addUtilities({
        // Classes de masques de base
        '.mask-b-from-10\\%': {
          '-webkit-mask-image': 'linear-gradient(to bottom, transparent 10%, black)',
          'mask-image': 'linear-gradient(to bottom, transparent 10%, black)',
        },
        '.mask-b-to-70\\%': {
          '-webkit-mask-image': 'linear-gradient(to bottom, black, transparent 70%)',
          'mask-image': 'linear-gradient(to bottom, black, transparent 70%)',
        },
        '.mask-radial-from-10\\%': {
          '-webkit-mask-image': 'radial-gradient(ellipse 150% 50% at 50% 0%, transparent 10%, black)',
          'mask-image': 'radial-gradient(ellipse 150% 50% at 50% 0%, transparent 10%, black)',
        },
        '.mask-radial-to-70\\%': {
          '-webkit-mask-image': 'radial-gradient(ellipse 150% 50% at 50% 0%, black, transparent 70%)',
          'mask-image': 'radial-gradient(ellipse 150% 50% at 50% 0%, black, transparent 70%)',
        },
        '.mask-radial-at-top': {
          '-webkit-mask-image': 'radial-gradient(ellipse 150% 50% at 50% 0%, black, transparent)',
          'mask-image': 'radial-gradient(ellipse 150% 50% at 50% 0%, black, transparent)',
        },
        // Classes combinées pour mobile
        '.max-md\\:mask-b-from-10\\%': {
          '@media (max-width: 767px)': {
            '-webkit-mask-image': 'linear-gradient(to bottom, transparent 10%, black)',
            'mask-image': 'linear-gradient(to bottom, transparent 10%, black)',
          }
        },
        '.max-md\\:mask-b-to-70\\%': {
          '@media (max-width: 767px)': {
            '-webkit-mask-image': 'linear-gradient(to bottom, black, transparent 70%)',
            'mask-image': 'linear-gradient(to bottom, black, transparent 70%)',
          }
        },
        // Classes combinées pour desktop
        '.md\\:mask-radial-from-10\\%': {
          '@media (min-width: 768px)': {
            '-webkit-mask-image': 'radial-gradient(ellipse 150% 50% at 50% 0%, transparent 10%, black)',
            'mask-image': 'radial-gradient(ellipse 150% 50% at 50% 0%, transparent 10%, black)',
          }
        },
        '.md\\:mask-radial-to-70\\%': {
          '@media (min-width: 768px)': {
            '-webkit-mask-image': 'radial-gradient(ellipse 150% 50% at 50% 0%, black, transparent 70%)',
            'mask-image': 'radial-gradient(ellipse 150% 50% at 50% 0%, black, transparent 70%)',
          }
        },
        '.md\\:mask-radial-at-top': {
          '@media (min-width: 768px)': {
            '-webkit-mask-image': 'radial-gradient(ellipse 150% 50% at 50% 0%, black, transparent)',
            'mask-image': 'radial-gradient(ellipse 150% 50% at 50% 0%, black, transparent)',
          }
        },
      })
    }
  ],
}