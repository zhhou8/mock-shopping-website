import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ah: {
          blue: "#00ADE6",
          dark: "#003E7E",
          ink: "#0a0a0a",
          paper: "#f7f7f5",
          border: "#e6e6e6"
        }
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Helvetica Neue", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
