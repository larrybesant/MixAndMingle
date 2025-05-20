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
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      ...defaultConfig.theme.extend,
      colors: {
        ...defaultConfig.theme.extend.colors,
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
        card: {
          DEFAULT: "#12121C",
          foreground: "#F8F8FF",
        },
        destructive: {
          DEFAULT: "#FF5F3D",
          foreground: "#FFFFFF",
        },
      },
      boxShadow: {
        "neon-blue": "0 0 5px #4B56FF, 0 0 15px rgba(75, 86, 255, 0.5)",
        "neon-orange": "0 0 5px #FF5F3D, 0 0 15px rgba(255, 95, 61, 0.5)",
        "neon-purple": "0 0 5px #B833FF, 0 0 15px rgba(184, 51, 255, 0.5)",
      },
      keyframes: {
        ...defaultConfig.theme.extend.keyframes,
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.7 },
        },
      },
      animation: {
        ...defaultConfig.theme.extend.animation,
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "dark-gradient": "linear-gradient(to bottom, #0A0A12, #12121C)",
      },
    },
  },
  plugins: [...defaultConfig.plugins, require("tailwindcss-animate")],
}
