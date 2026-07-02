import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: "#eefaff",
          100: "#d8f2ff",
          200: "#afe7ff",
          300: "#73d6ff",
          400: "#2fbdf8",
          500: "#0ca2df",
          600: "#0581bd",
          700: "#086798",
          800: "#0d567e",
          900: "#104768"
        },
        mint: "#16b7a7",
        amberline: "#e9a63a"
      },
      boxShadow: {
        soft: "0 18px 55px rgba(8, 103, 152, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
