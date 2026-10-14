import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        nova: { bg: "#080E18", card: "#0F1A29", border: "#1C2A3D", cyan: "#00E5FF", muted: "#8E9DAE", text: "#FFFFFF" },
        atelier: { bg: "#FAF9F5", card: "#FFFFFF", border: "#E5E2DA", text: "#1F1E1D", muted: "#737069", accent: "#0D9488" }
      },
      fontFamily: { mono: ["monospace"] }
    }
  },
  plugins: []
};
export default config;
