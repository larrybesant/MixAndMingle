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
          ...defaultConfig.theme.extend.colors.primary,
          DEFAULT: "hsl(252 100% 64%)",
        },
        secondary: {
          ...defaultConfig.theme.extend.colors.secondary,
          DEFAULT: "hsl(15 100% 60%)",
        },
        accent: {
          ...defaultConfig.theme.extend.colors.accent,
          DEFAULT: "hsl(280 100% 60%)",
        },
        destructive: {
          ...defaultConfig.theme.extend.colors.destructive,
          DEFAULT: "hsl(0 62.8% 30.6%)",
        },
        muted: {
          ...defaultConfig.theme.extend.colors.muted,
          DEFAULT: "hsl(240 5% 15%)",
          foreground: "hsl(240 5% 65%)",
        },
        card: {
          ...defaultConfig.theme.extend.colors.card,
          foreground: "hsl(0 0% 98%)",
        },
      },
      boxShadow: {
        "neon-blue": "0 0 5px #4B56FF, 0 0 15px rgba(75, 86, 255, 0.5)",
        "neon-orange": "0 0 5px #FF5F3D, 0 0 15px rgba(255, 95, 61, 0.5)",
        "neon-purple": "0 0 5px #B833FF, 0 0 15px rgba(184, 51, 255, 0.5)",
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
