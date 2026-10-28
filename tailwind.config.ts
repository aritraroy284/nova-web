import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        nova: {
          canvas: "#060B11",   // Deep base layer
          surface: "#0D1520",  // Card / panel layer
          raised: "#142030",   // Elevated hover / inputs / active tabs
          border: "#1E3045",   // Technical subtle 1px border
          cyan: "#00E5FF",     // Brand primary accent
          mint: "#00F5A0",     // Online / active status accent
          muted: "#8E9DAE",    // Secondary technical text
          text: "#FFFFFF"
        }
      },
      fontFamily: {
        mono: ["monospace", "Courier New", "Menlo"]
      }
    }
  },
  plugins: []
};

export default config;
