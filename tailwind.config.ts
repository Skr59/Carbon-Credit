import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          500: "#16a34a",
          900: "#064e3b",
          gold: "#d4af37",
        },
        estate: {
          50: "#effaf1",
          100: "#d9f2de",
          300: "#8fdca2",
          500: "#15b79e",
          600: "#0f8f85",
          700: "#0b6e6b",
          800: "#0b4f52",
          900: "#0a3a40",
          950: "#072528",
        },
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
