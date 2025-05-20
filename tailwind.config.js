/** @type {import('tailwindcss').Config} */
const defaultConfig = require("shadcn/ui/tailwind.config")

module.exports = {
  ...defaultConfig,
  content: [
    ...defaultConfig.content,
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    ...defaultConfig.theme,
    extend: {
      ...defaultConfig.theme.extend,
      colors: {
        ...defaultConfig.theme.extend.colors,
        background: "#0A0A12",
        foreground: "#F8F8FF",
        primary: {
          DEFAULT: "#4B56FF", // Neon blue
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#FF5F3D", // Neon orange
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#B833FF", // Neon purple
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#1A1A2E",
          foreground: "#A0A0B8",
        },
        card: {
          DEFAULT: "#12121C",
          foreground: "#F8F8FF",
        },
        border: "#2A2A3C",
      },
      boxShadow: {
        "neon-blue": "0 0 5px #4B56FF, 0 0 15px rgba(75, 86, 255, 0.5)",
        "neon-orange": "0 0 5px #FF5F3D, 0 0 15px rgba(255, 95, 61, 0.5)",
        "neon-purple": "0 0 5px #B833FF, 0 0 15px rgba(184, 51, 255, 0.5)",
      },
      keyframes: {
        ...defaultConfig.theme.extend.keyframes,
        "pulse-glow": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.7 },
        },
      },
      animation: {
        ...defaultConfig.theme.extend.animation,
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      backgroundImage: {
        ...defaultConfig.theme.extend.backgroundImage,
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "dark-gradient": "linear-gradient(to bottom, #0A0A12, #12121C)",
      },
    },
  },
  plugins: [...defaultConfig.plugins, require("tailwindcss-animate")],
}
